import { NextResponse } from 'next/server';
import { isCloudinaryConfigured, getCloudName } from '@/lib/cloudinary/client';

export async function GET() {
  const configured = isCloudinaryConfigured();
  const cloudName = getCloudName();

  return NextResponse.json({
    status: 'ok',
    cloudinary: {
      configured,
      cloudName: configured ? cloudName : 'unconfigured',
      readyForUpload: configured,
      features: [
        'Upload API',
        'AI Face Detection & Privacy Redaction',
        'EXIF/GPS Metadata Stripping (fl_strip_profile)',
        'AI Content-Aware Smart Crop (g_auto)',
        'Dynamic Format & Perceptual Compression (f_auto, q_auto)',
        'Content Moderation Pipeline',
      ],
    },
  });
}
