import { ProtectionOptions, TransformationAudit } from '@/types/media';

/**
 * Builds real Cloudinary transformation string and delivery URL
 * Example Cloudinary URL format:
 * https://res.cloudinary.com/<cloud_name>/image/upload/<transformations>/<public_id>
 */
export function buildCloudinaryTransformationUrl(
  cloudName: string,
  publicId: string,
  options: ProtectionOptions
): TransformationAudit {
  const parts: string[] = [];
  const operations: string[] = [];

  // 1. Metadata / EXIF Stripping (Critical for privacy: GPS coordinates, hardware info)
  if (options.stripMetadata) {
    parts.push('fl_strip_profile');
    operations.push('Metadata Sanitization (fl_strip_profile: GPS & EXIF scrubbed)');
  }

  // 2. Face Privacy & Redaction
  if (options.facePrivacy === 'pixelate') {
    const intensity = options.facePixelateIntensity || 15;
    parts.push(`e_pixelate_faces:${intensity}`);
    operations.push(`AI Face Pixelation (e_pixelate_faces:${intensity})`);
  } else if (options.facePrivacy === 'blur') {
    parts.push('e_blur_faces:600');
    operations.push('AI Face Gaussian Blur (e_blur_faces:600)');
  } else if (options.facePrivacy === 'mask') {
    parts.push('e_pixelate_faces:40');
    operations.push('Heavy Privacy Masking (e_pixelate_faces:40)');
  }

  // 3. Background Privacy
  if (options.backgroundPrivacy === 'remove') {
    parts.push('e_background_removal');
    operations.push('AI Background Removal (e_background_removal)');
  } else if (options.backgroundPrivacy === 'blur') {
    const blurAmount = options.backgroundBlurIntensity || 700;
    parts.push(`e_blur:${blurAmount}`);
    operations.push(`Background Privacy Blur (e_blur:${blurAmount})`);
  }

  // 4. Smart Content-Aware Cropping (g_auto)
  if (options.smartCrop === 'square') {
    parts.push('c_fill,g_auto,ar_1:1');
    operations.push('AI Content-Aware Smart Crop (c_fill,g_auto,ar_1:1)');
  } else if (options.smartCrop === 'portrait') {
    parts.push('c_fill,g_auto,ar_4:5');
    operations.push('AI Portrait Smart Crop (c_fill,g_auto,ar_4:5)');
  } else if (options.smartCrop === 'landscape') {
    parts.push('c_fill,g_auto,ar_16:9');
    operations.push('AI Landscape Smart Crop (c_fill,g_auto,ar_16:9)');
  }

  // 5. Optimization & Dynamic Delivery
  if (options.optimization === 'auto') {
    parts.push('q_auto:good');
    operations.push('Perceptual Quality Optimization (q_auto:good)');
  } else if (options.optimization === 'eco') {
    parts.push('q_auto:eco');
    operations.push('High-Efficiency Compression (q_auto:eco)');
  } else if (options.optimization === 'lossless') {
    parts.push('q_auto:best');
    operations.push('Lossless Quality Balance (q_auto:best)');
  }

  // 6. Format Optimization
  if (options.deliveryFormat === 'auto') {
    parts.push('f_auto');
    operations.push('Next-Gen Format Negotiation (f_auto -> AVIF/WebP)');
  } else {
    parts.push(`f_${options.deliveryFormat}`);
    operations.push(`Target Format Conversion (f_${options.deliveryFormat})`);
  }

  const transformationString = parts.join(',');
  const cleanPublicId = publicId.replace(/\.[^/.]+$/, ''); // Strip extension if present
  
  // Format target extension
  const extension = options.deliveryFormat === 'auto' ? '' : `.${options.deliveryFormat}`;
  
  const finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${cleanPublicId}${extension}`;

  return {
    appliedOperations: operations,
    transformationString,
    finalUrl,
    bytesSavingsEstimate: '45% - 75% typical reduction',
    formatChosen: options.deliveryFormat.toUpperCase(),
  };
}
