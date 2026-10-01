export interface CloudinaryFaceCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExifMetadata {
  make?: string;
  model?: string;
  dateTimeOriginal?: string;
  hasGps: boolean;
  gpsLatitude?: string;
  gpsLongitude?: string;
  software?: string;
  raw?: Record<string, any>;
}

export interface CloudinaryModerationItem {
  kind: string;
  status: 'approved' | 'rejected' | 'pending';
  confidence?: number;
  updated_at?: string;
}

export interface MediaSafetyReport {
  overallScore: number; // 0 - 100
  overallVerdict: 'safe' | 'caution' | 'high_risk';
  contentModeration: {
    status: 'approved' | 'rejected' | 'pending' | 'not_requested';
    provider?: string;
    details: string;
  };
  privacyRisks: {
    facesDetected: number;
    faceCoordinates: CloudinaryFaceCoordinates[];
    exifGpsExposed: boolean;
    deviceFingerprintExposed: boolean;
    riskSummary: string[];
  };
  technicalSpecs: {
    width: number;
    height: number;
    format: string;
    originalBytes: number;
    estimatedOptimizedBytes: number;
    potentialSavingsPercent: number;
    aspectRatio: string;
  };
  cloudinaryDetails: {
    publicId: string;
    version: number;
    cloudName: string;
    secureUrl: string;
    resourceType: string;
    storageType: string;
    etag?: string;
  };
}

export interface ProtectionOptions {
  facePrivacy: 'none' | 'pixelate' | 'blur' | 'mask';
  facePixelateIntensity: number; // 1 to 50
  stripMetadata: boolean;
  backgroundPrivacy: 'none' | 'blur' | 'remove';
  backgroundBlurIntensity: number;
  smartCrop: 'none' | 'square' | 'portrait' | 'landscape' | 'custom';
  optimization: 'auto' | 'lossless' | 'eco';
  deliveryFormat: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
  watermarkShield: boolean;
}

export interface TransformationAudit {
  appliedOperations: string[];
  transformationString: string;
  finalUrl: string;
  bytesSavingsEstimate: string;
  formatChosen: string;
}

export interface UploadedMediaAsset {
  publicId: string;
  version: number;
  cloudName: string;
  secureUrl: string;
  originalUrl: string;
  optimizedUrl: string;
  format: string;
  originalBytes: number;
  width: number;
  height: number;
  folder: string;
  cloudinaryStatus: string;
}

export type TransformationType =
  | 'original'
  | 'optimized'
  | 'smart_crop'
  | 'format'
  | 'background_removed'
  | 'privacy_protected'
  | 'custom';

export type OperationStatus = 'idle' | 'processing' | 'success' | 'failed' | 'unavailable';

export interface TransformationResult {
  id: string;
  type: TransformationType;
  name: string;
  description: string;
  url: string;
  transformationString: string;
  timestamp: number;
  status: OperationStatus;
  errorMessage?: string;
  warningMessage?: string;
  metadata: {
    format?: string;
    dimensions?: string;
    originalSize?: number;
    resultSize?: number;
    savedSize?: number;
    percentageSaved?: number;
    aspectRatio?: string;
    appliedOperations: string[];
    isConfigured?: boolean;
  };
}

