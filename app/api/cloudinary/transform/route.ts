import { NextRequest, NextResponse } from 'next/server';
import { getCloudName, isCloudinaryConfigured } from '@/lib/cloudinary/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const TransformRequestSchema = z.object({
  publicId: z
    .string()
    .min(1, 'publicId is required')
    .max(250)
    .regex(/^[\w\-\/\.]+$/, 'Invalid publicId characters detected'),
  action: z.enum(['optimize', 'smart_crop', 'format', 'background_removal', 'privacy']),
  options: z.record(z.string(), z.any()).optional().default({}),
  originalBytes: z.number().nonnegative().optional(),
  originalFormat: z.string().max(20).optional(),
  facesDetectedCount: z.number().int().nonnegative().optional().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parseResult = TransformRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues
        ? parseResult.error.issues.map((e) => e.message).join(', ')
        : 'Invalid request body.';

      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_REQUEST',
          message: errorMsg,
        },
        { status: 400 }
      );
    }

    const { publicId, action, options, originalBytes, originalFormat, facesDetectedCount } = parseResult.data;

    const cloudName = getCloudName();
    const configured = isCloudinaryConfigured();
    const cleanId = publicId.replace(/\.[^/.]+$/, '');

    // 1. ACTION: OPTIMIZE
    if (action === 'optimize') {
      const quality = options.quality || 'good';
      const transformationString = `f_auto,q_auto:${quality}`;
      const url = `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${cleanId}`;

      let resultSize: number | undefined;
      let savedSize: number | undefined;
      let percentageSaved: number | undefined;

      // Real edge probe to measure exact compressed payload if delivered by Cloudinary CDN
      try {
        const headRes = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(6000) });
        if (headRes.ok) {
          const cl = headRes.headers.get('content-length');
          if (cl) {
            resultSize = parseInt(cl, 10);
            if (originalBytes && originalBytes > 0 && resultSize > 0) {
              savedSize = Math.max(0, originalBytes - resultSize);
              percentageSaved = Math.round((savedSize / originalBytes) * 100);
            }
          }
        }
      } catch {
        // Edge warmup or timeout, fallback gracefully to URL delivery
      }

      return NextResponse.json({
        success: true,
        status: 'success',
        url,
        transformationString,
        metadata: {
          format: 'Auto (AVIF / WebP)',
          appliedOperations: [
            'Next-Gen Format Negotiation (f_auto)',
            `Perceptual Compression (q_auto:${quality})`,
          ],
          originalSize: originalBytes,
          resultSize,
          savedSize,
          percentageSaved,
          isConfigured: configured,
        },
      });
    }

    // 2. ACTION: SMART CROP
    if (action === 'smart_crop') {
      const aspectRatio = options.aspectRatio || '1:1';
      const width = options.width || 800;
      const transformationString = `c_fill,g_auto,ar_${aspectRatio},w_${width},f_auto,q_auto:good`;
      const url = `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${cleanId}`;

      return NextResponse.json({
        success: true,
        status: 'success',
        url,
        transformationString,
        metadata: {
          aspectRatio,
          dimensions: `${aspectRatio} Crop (${width}px)`,
          appliedOperations: [
            `Content-Aware Smart Gravity Crop (c_fill, g_auto, ar_${aspectRatio})`,
            'Adaptive Width Resizing',
            'Perceptual CDN Delivery (f_auto, q_auto:good)',
          ],
          isConfigured: configured,
        },
      });
    }

    // 3. ACTION: FORMAT CONVERSION
    if (action === 'format') {
      const targetFormat = (options.targetFormat || 'webp').toLowerCase();
      const transformationString = targetFormat === 'auto' ? 'f_auto,q_auto:good' : `f_${targetFormat},q_auto:good`;
      const ext = targetFormat === 'auto' ? '' : `.${targetFormat}`;
      const url = `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${cleanId}${ext}`;

      let warningMessage: string | undefined;
      const orig = (originalFormat || '').toLowerCase();
      if ((orig.includes('png') || orig.includes('webp')) && (targetFormat === 'jpg' || targetFormat === 'jpeg')) {
        warningMessage =
          'Notice: JPEG does not support alpha transparency. Any transparent background pixels will be converted to a solid opaque fill.';
      }

      return NextResponse.json({
        success: true,
        status: 'success',
        url,
        transformationString,
        warningMessage,
        metadata: {
          format: targetFormat.toUpperCase(),
          appliedOperations: [
            `Format Transcoding (${targetFormat === 'auto' ? 'f_auto' : `f_${targetFormat}`})`,
            'Dynamic Quality Compression (q_auto:good)',
          ],
          isConfigured: configured,
        },
      });
    }

    // 4. ACTION: BACKGROUND REMOVAL
    if (action === 'background_removal') {
      const transformationString = 'e_background_removal,f_png';
      const url = `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${cleanId}.png`;

      // Check if Cloudinary account has background removal active or if demo/unconfigured
      try {
        const probeRes = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(7000) });
        const cldError = probeRes.headers.get('x-cld-error') || '';

        if (!probeRes.ok || cldError.toLowerCase().includes('not enabled') || cldError.toLowerCase().includes('add-on') || cldError.toLowerCase().includes('subscription')) {
          return NextResponse.json({
            success: false,
            status: 'unavailable',
            message:
              'Background removal requires additional Cloudinary configuration or an active Cloudinary AI Background Removal add-on subscription.',
            transformationString,
            url,
          });
        }
      } catch (err: any) {
        // If probing network fails or timeout
        console.warn('Background removal probe notice:', err?.message);
      }

      return NextResponse.json({
        success: true,
        status: 'success',
        url,
        transformationString,
        metadata: {
          format: 'PNG',
          appliedOperations: [
            'Cloudinary AI Background Removal (e_background_removal)',
            'Alpha Transparency Preservation (f_png)',
          ],
          isConfigured: configured,
        },
      });
    }

    // 5. ACTION: PRIVACY REDACTION & SANITIZATION
    if (action === 'privacy') {
      const method = options.facePrivacy || 'pixelate';
      const intensity = options.facePixelateIntensity || 15;
      const stripMetadata = options.stripMetadata !== false;

      const ops: string[] = [];
      const parts: string[] = [];

      if (stripMetadata) {
        parts.push('fl_strip_profile');
        ops.push('EXIF, GPS & Hardware Metadata Stripping (fl_strip_profile)');
      }

      if (facesDetectedCount > 0) {
        if (method === 'pixelate') {
          parts.push(`e_pixelate_faces:${intensity}`);
          ops.push(`AI Face Pixelation (e_pixelate_faces:${intensity})`);
        } else if (method === 'blur') {
          parts.push('e_blur_faces:600');
          ops.push('AI Face Gaussian Blur (e_blur_faces:600)');
        } else if (method === 'mask') {
          parts.push('e_pixelate_faces:40');
          ops.push('Heavy Privacy Masking (e_pixelate_faces:40)');
        }
      } else {
        ops.push('No unmasked faces detected; biometric filters bypassed');
      }

      parts.push('f_auto,q_auto:good');
      ops.push('Dynamic CDN Delivery (f_auto, q_auto:good)');

      const transformationString = parts.join(',');
      const url = `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${cleanId}`;

      return NextResponse.json({
        success: true,
        status: 'success',
        url,
        transformationString,
        metadata: {
          appliedOperations: ops,
          isConfigured: configured,
        },
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Transform API Error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 'failed',
        message: error.message || 'Transformation failed to execute.',
      },
      { status: 500 }
    );
  }
}
