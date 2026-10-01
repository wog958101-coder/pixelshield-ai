import { MediaSafetyReport } from '@/types/media';

export interface SamplePresetMeta {
  key: string;
  name: string;
  badge: string;
  badgeType: 'danger' | 'warning' | 'info';
  description: string;
  report: MediaSafetyReport;
}

export const SAMPLE_PRESETS: Record<string, MediaSafetyReport> = {
  portrait_id: {
    overallScore: 45,
    overallVerdict: 'caution',
    contentModeration: {
      status: 'approved',
      provider: 'Cloudinary Moderation',
      details: 'Visual media clear of policy violations. Passed initial scan.',
    },
    privacyRisks: {
      facesDetected: 1,
      faceCoordinates: [{ x: 320, y: 150, width: 220, height: 260 }],
      exifGpsExposed: true,
      deviceFingerprintExposed: true,
      riskSummary: [
        '1 unmasked high-resolution face detected with frontal biometric visibility.',
        'Physical GPS coordinates embedded in EXIF tag: Lat 37.7749° N, Lon 122.4194° W.',
        'Hardware signature exposed: Apple iPhone 14 Pro, iOS 17.4.',
      ],
    },
    technicalSpecs: {
      width: 1200,
      height: 1600,
      format: 'jpg',
      originalBytes: 2450000,
      estimatedOptimizedBytes: 680000,
      potentialSavingsPercent: 72,
      aspectRatio: '3:4',
    },
    cloudinaryDetails: {
      publicId: 'cld-sample-5',
      version: 1,
      cloudName: 'demo',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/cld-sample-5.jpg',
      resourceType: 'image',
      storageType: 'upload',
    },
  },
  street_crowd: {
    overallScore: 35,
    overallVerdict: 'high_risk',
    contentModeration: {
      status: 'approved',
      provider: 'Cloudinary Moderation',
      details: 'Media safe for general audience. No objectionable imagery detected.',
    },
    privacyRisks: {
      facesDetected: 3,
      faceCoordinates: [
        { x: 180, y: 210, width: 90, height: 110 },
        { x: 450, y: 190, width: 105, height: 125 },
        { x: 720, y: 230, width: 85, height: 95 },
      ],
      exifGpsExposed: true,
      deviceFingerprintExposed: true,
      riskSummary: [
        '3 civilian bystander faces captured without privacy anonymization.',
        'GPS geo-tagging active in EXIF metadata.',
        'Camera serial number and aperture profile intact.',
      ],
    },
    technicalSpecs: {
      width: 1920,
      height: 1080,
      format: 'jpg',
      originalBytes: 3820000,
      estimatedOptimizedBytes: 940000,
      potentialSavingsPercent: 75,
      aspectRatio: '16:9',
    },
    cloudinaryDetails: {
      publicId: 'cld-sample',
      version: 1,
      cloudName: 'demo',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/cld-sample.jpg',
      resourceType: 'image',
      storageType: 'upload',
    },
  },
  document_privacy: {
    overallScore: 60,
    overallVerdict: 'caution',
    contentModeration: {
      status: 'approved',
      provider: 'Cloudinary Moderation',
      details: 'No unsafe imagery flagged.',
    },
    privacyRisks: {
      facesDetected: 0,
      faceCoordinates: [],
      exifGpsExposed: false,
      deviceFingerprintExposed: true,
      riskSummary: [
        'No human faces detected.',
        'Hardware fingerprint: Canon EOS 5D Mark IV.',
        'Uncompressed image format causes unnecessary bandwidth and latency overhead.',
      ],
    },
    technicalSpecs: {
      width: 1400,
      height: 933,
      format: 'jpg',
      originalBytes: 1850000,
      estimatedOptimizedBytes: 520000,
      potentialSavingsPercent: 71,
      aspectRatio: '3:2',
    },
    cloudinaryDetails: {
      publicId: 'sample',
      version: 1,
      cloudName: 'demo',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      resourceType: 'image',
      storageType: 'upload',
    },
  },
};
