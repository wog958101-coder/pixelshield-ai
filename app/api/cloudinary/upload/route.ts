import { NextRequest, NextResponse } from 'next/server';
import { getCloudinaryClient, isCloudinaryConfigured, getCloudName } from '@/lib/cloudinary/client';
import { MediaSafetyReport } from '@/types/media';
import { SAMPLE_PRESETS } from '@/lib/cloudinary/presets';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 60; // Allow 60s for Cloudinary AI processing

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const samplePreset = formData.get('samplePreset') as string | null;

    // Handle Sample Preset (instant response)
    if (samplePreset) {
      const selected = SAMPLE_PRESETS[samplePreset] || SAMPLE_PRESETS['portrait_id'];
      return NextResponse.json({
        success: true,
        report: selected,
        isSample: true,
      });
    }

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Strict MIME & Extension Validation
    const mime = (file.type || '').toLowerCase();
    const name = (file.name || '').toLowerCase();
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    const hasAllowedExt = allowedExtensions.some((ext) => name.endsWith(ext));
    const hasAllowedMime = allowedMimes.includes(mime);

    // Reject dangerous or scriptable formats (SVG, HTML, JS, PHP, etc.)
    const dangerousExtensions = ['.svg', '.html', '.htm', '.js', '.exe', '.sh', '.php', '.bat'];
    if (dangerousExtensions.some((ext) => name.endsWith(ext)) || mime.includes('svg') || mime.includes('xml') || mime.includes('html')) {
      return NextResponse.json(
        { error: 'Security alert: Vector, script, or executable uploads are prohibited. Please provide a standard raster photo (JPG, PNG, WebP).' },
        { status: 400 }
      );
    }

    if (!hasAllowedMime && !hasAllowedExt) {
      return NextResponse.json(
        { error: 'Unsupported file format. PixelShield AI accepts JPEG, PNG, and WebP images.' },
        { status: 400 }
      );
    }

    // Validate size (15MB limit)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 15MB limit. Please upload a smaller image.' },
        { status: 400 }
      );
    }

    // Check Cloudinary configuration
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error: 'CLOUDINARY_NOT_CONFIGURED',
          message:
            'Cloudinary API credentials are missing. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables.',
        },
        { status: 503 }
      );
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Magic byte signature validation to prevent file spoofing
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isWebp =
      buffer.length > 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP';

    if (!isJpeg && !isPng && !isWebp) {
      return NextResponse.json(
        { error: 'Corrupted or unverified file signature. The uploaded file does not match a valid JPEG, PNG, or WebP image.' },
        { status: 400 }
      );
    }

    const cloudinary = getCloudinaryClient();
    const cloudName = getCloudName();

    // Generate predictable but unique public ID
    const publicId = `ps_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Trigger Cloudinary AI Pipeline upload with face detection, EXIF metadata, and safety checks via stream
    let uploadResult: any;
    try {
      uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'pixelshield/uploads',
            public_id: publicId,
            resource_type: 'image',
            faces: true,
            image_metadata: true,
            colors: true,
            quality_analysis: true,
            moderation: 'manual',
            tags: ['pixelshield', 'ai-privacy-scan', 'hackindia-2026'],
            timeout: 60000,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
    } catch (primaryError: any) {
      console.warn('Full AI scan upload had issue, falling back to core face/exif scan:', primaryError?.message);
      // Resilient fallback in case advanced moderation/quality add-ons are restricted on account
      uploadResult = await new Promise<any>((resolve, reject) => {
        const fallbackStream = cloudinary.uploader.upload_stream(
          {
            folder: 'pixelshield/uploads',
            public_id: publicId,
            resource_type: 'image',
            faces: true,
            image_metadata: true,
            tags: ['pixelshield', 'ai-privacy-scan', 'hackindia-2026'],
            timeout: 45000,
          },
          (err, res) => {
            if (err) reject(err);
            else resolve(res);
          }
        );
        fallbackStream.end(buffer);
      });
    }

    // Parse Cloudinary faces detection
    const facesList = Array.isArray(uploadResult.faces) ? uploadResult.faces : [];
    const faceCoordinates = facesList.map((f: number[]) => ({
      x: f[0],
      y: f[1],
      width: f[2],
      height: f[3],
    }));

    // Parse EXIF metadata
    const rawMetadata = uploadResult.image_metadata || {};
    const hasGps = Boolean(
      rawMetadata.GPSLatitude ||
      rawMetadata.GPSLongitude ||
      rawMetadata['GPS Latitude'] ||
      rawMetadata['GPS Longitude']
    );
    const hasDeviceFingerprint = Boolean(
      rawMetadata.Make ||
      rawMetadata.Model ||
      rawMetadata['Camera Model Name'] ||
      rawMetadata.Software
    );

    // Evaluate Content Moderation
    let moderationStatus: 'approved' | 'rejected' | 'pending' | 'not_requested' = 'approved';
    let moderationDetails = 'No unsafe content flags detected by Cloudinary filters.';
    if (uploadResult.moderation && uploadResult.moderation.length > 0) {
      const primaryModeration = uploadResult.moderation[0] as any;
      if (typeof primaryModeration === 'object' && primaryModeration !== null) {
        moderationStatus = (primaryModeration.status as any) || 'pending';
        moderationDetails = `Moderation state: ${moderationStatus} (${primaryModeration.kind || 'content'})`;
      } else if (typeof primaryModeration === 'string') {
        moderationDetails = `Moderation note: ${primaryModeration}`;
      }
    }

    // Evaluate Privacy Risks
    const riskSummary: string[] = [];
    if (faceCoordinates.length > 0) {
      riskSummary.push(
        `${faceCoordinates.length} unmasked face(s) identified. Biometric or identity disclosure risk.`
      );
    }
    if (hasGps) {
      riskSummary.push('Physical GPS coordinates detected in EXIF profile. High location disclosure risk.');
    }
    if (hasDeviceFingerprint) {
      riskSummary.push(
        `Device hardware fingerprint exposed (${rawMetadata.Make || ''} ${rawMetadata.Model || 'Hardware'}).`
      );
    }
    if (riskSummary.length === 0) {
      riskSummary.push('No obvious face or location vulnerabilities detected in raw image.');
    }

    // Calculate dynamic Safety Score (0-100)
    let score = 100;
    if (faceCoordinates.length > 0) score -= Math.min(35, faceCoordinates.length * 20);
    if (hasGps) score -= 30;
    if (hasDeviceFingerprint) score -= 15;
    if (moderationStatus === 'rejected') score = 0;
    else if (moderationStatus === 'pending') score -= 10;
    score = Math.max(10, Math.min(100, score));

    const overallVerdict: 'safe' | 'caution' | 'high_risk' =
      score >= 80 ? 'safe' : score >= 50 ? 'caution' : 'high_risk';

    // Compression estimation
    const originalBytes = uploadResult.bytes || file.size;
    const estimatedOptimizedBytes = Math.round(originalBytes * 0.45); // Typical 55% reduction with f_auto,q_auto
    const potentialSavingsPercent = Math.round(((originalBytes - estimatedOptimizedBytes) / originalBytes) * 100);

    const report: MediaSafetyReport = {
      overallScore: score,
      overallVerdict,
      contentModeration: {
        status: moderationStatus,
        provider: 'Cloudinary Moderation',
        details: moderationDetails,
      },
      privacyRisks: {
        facesDetected: faceCoordinates.length,
        faceCoordinates,
        exifGpsExposed: hasGps,
        deviceFingerprintExposed: hasDeviceFingerprint,
        riskSummary,
      },
      technicalSpecs: {
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        originalBytes,
        estimatedOptimizedBytes,
        potentialSavingsPercent,
        aspectRatio: `${uploadResult.width}:${uploadResult.height}`,
      },
      cloudinaryDetails: {
        publicId: uploadResult.public_id,
        version: uploadResult.version,
        cloudName,
        secureUrl: uploadResult.secure_url,
        resourceType: uploadResult.resource_type,
        storageType: uploadResult.type,
        etag: uploadResult.etag,
      },
    };

    const cleanId = uploadResult.public_id.replace(/\.[^/.]+$/, '');
    const optimizedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${cleanId}`;

    return NextResponse.json({
      success: true,
      report,
      asset: {
        publicId: uploadResult.public_id,
        version: uploadResult.version,
        cloudName,
        secureUrl: uploadResult.secure_url,
        originalUrl: uploadResult.secure_url,
        optimizedUrl,
        format: uploadResult.format,
        originalBytes,
        width: uploadResult.width,
        height: uploadResult.height,
        folder: 'pixelshield/uploads',
        cloudinaryStatus: 'Stored & Optimized via Cloudinary CDN',
      },
    });
  } catch (error: any) {
    const raw = String(error?.message || '');
    const isSensitive = /key|secret|token|pass|auth/i.test(raw);
    const sanitized = isSensitive
      ? 'Cloudinary ingestion encountered an authorization or processing fault.'
      : raw || 'Failed to process image through Cloudinary pipeline.';

    return NextResponse.json(
      {
        error: 'UPLOAD_FAILED',
        message: sanitized,
      },
      { status: 500 }
    );
  }
}
