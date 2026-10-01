import { v2 as cloudinary } from 'cloudinary';

// Check if Cloudinary credentials are fully configured
export function isCloudinaryConfigured(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (cloudinaryUrl && cloudinaryUrl.trim().length > 0) {
    return true;
  }

  return Boolean(
    cloudName &&
    apiKey &&
    apiSecret &&
    cloudName.trim().length > 0 &&
    apiKey.trim().length > 0 &&
    apiSecret.trim().length > 0
  );
}

// Get the current Cloudinary cloud name safely
export function getCloudName(): string {
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    return process.env.CLOUDINARY_CLOUD_NAME.trim();
  }
  if (process.env.CLOUDINARY_URL) {
    try {
      const parsed = new URL(process.env.CLOUDINARY_URL.replace('cloudinary://', 'http://'));
      return parsed.hostname;
    } catch {
      return 'demo';
    }
  }
  return 'demo';
}

// Initialize server-side Cloudinary client
export function getCloudinaryClient() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (cloudinaryUrl) {
    cloudinary.config({
      cloudinary_url: cloudinaryUrl,
      secure: true,
    });
  } else if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName.trim(),
      api_key: apiKey.trim(),
      api_secret: apiSecret.trim(),
      secure: true,
    });
  } else {
    // Fallback to demo cloud for read-only transformation previews
    cloudinary.config({
      cloud_name: 'demo',
      secure: true,
    });
  }

  return cloudinary;
}
