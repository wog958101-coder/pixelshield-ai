import { ProtectionOptions, TransformationAudit } from '@/types/media';

/**
 * Validation rules for image uploads (JPG/JPEG, PNG, WEBP)
 */
export const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates image file type and file size before upload
 */
export function validateImageFile(file: { type: string; size: number; name?: string }): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No image file was provided.' };
  }

  const mime = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasValidMime = ALLOWED_FORMATS.includes(mime) || mime.startsWith('image/');

  if (!hasValidMime && !hasValidExt) {
    return {
      valid: false,
      error: 'Unsupported format. PixelShield AI accepts JPG, PNG, and WebP images.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum allowed size is 15 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Formats a byte number to human-readable string
 */
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Generates an optimized Cloudinary delivery URL with f_auto and q_auto
 */
export function buildOptimizedDeliveryUrl(
  cloudName: string,
  publicId: string,
  options?: {
    quality?: 'good' | 'eco' | 'best';
    width?: number;
    crop?: string;
  }
): string {
  const cleanId = publicId.replace(/\.[^/.]+$/, '');
  const qParam = options?.quality ? `q_auto:${options.quality}` : 'q_auto:good';
  const parts = ['f_auto', qParam];

  if (options?.width) {
    parts.push(`w_${options.width}`);
  }
  if (options?.crop) {
    parts.push(options.crop);
  }

  const transformation = parts.join(',');
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${cleanId}`;
}

/**
 * Generates a content-aware smart cropped URL (g_auto)
 */
export function buildSmartCropUrl(
  cloudName: string,
  publicId: string,
  aspectRatio: '1:1' | '4:5' | '16:9' = '1:1',
  width: number = 800
): string {
  const cleanId = publicId.replace(/\.[^/.]+$/, '');
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,g_auto,ar_${aspectRatio},w_${width},f_auto,q_auto/${cleanId}`;
}

/**
 * Generates a format-converted URL
 */
export function buildFormatConversionUrl(
  cloudName: string,
  publicId: string,
  format: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
): string {
  const cleanId = publicId.replace(/\.[^/.]+$/, '');
  if (format === 'auto') {
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto:good/${cleanId}`;
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_${format},q_auto:good/${cleanId}.${format}`;
}

/**
 * Builds full privacy protection transformations
 */
export function buildProtectionUrl(
  cloudName: string,
  publicId: string,
  options: ProtectionOptions
): TransformationAudit {
  const parts: string[] = [];
  const operations: string[] = [];

  // 1. Metadata / EXIF Stripping
  if (options.stripMetadata) {
    parts.push('fl_strip_profile');
    operations.push('EXIF & GPS Sanitization (fl_strip_profile)');
  }

  // 2. Face Anonymization
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
    operations.push('Content-Aware Smart Crop Square (c_fill,g_auto,ar_1:1)');
  } else if (options.smartCrop === 'portrait') {
    parts.push('c_fill,g_auto,ar_4:5');
    operations.push('Content-Aware Portrait Crop (c_fill,g_auto,ar_4:5)');
  } else if (options.smartCrop === 'landscape') {
    parts.push('c_fill,g_auto,ar_16:9');
    operations.push('Content-Aware Landscape Crop (c_fill,g_auto,ar_16:9)');
  }

  // 5. Optimization & Quality Delivery
  if (options.optimization === 'auto') {
    parts.push('q_auto:good');
    operations.push('Perceptual Quality Optimization (q_auto:good)');
  } else if (options.optimization === 'eco') {
    parts.push('q_auto:eco');
    operations.push('Eco Compression Delivery (q_auto:eco)');
  } else if (options.optimization === 'lossless') {
    parts.push('q_auto:best');
    operations.push('Lossless Quality Balance (q_auto:best)');
  }

  // 6. Dynamic Format Negotiation
  if (options.deliveryFormat === 'auto') {
    parts.push('f_auto');
    operations.push('Format Auto-Negotiation (f_auto -> AVIF/WebP)');
  } else {
    parts.push(`f_${options.deliveryFormat}`);
    operations.push(`Target Format Conversion (f_${options.deliveryFormat})`);
  }

  const transformationString = parts.join(',');
  const cleanPublicId = publicId.replace(/\.[^/.]+$/, '');
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

/**
 * Downloads a real Cloudinary asset with client-side blob handling
 */
export async function downloadCloudinaryAsset(url: string, suggestedFilename: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = suggestedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch (err) {
    console.warn('Direct blob download failed, falling back to window navigation:', err);
    const link = document.createElement('a');
    link.href = url;
    link.download = suggestedFilename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return false;
  }
}
