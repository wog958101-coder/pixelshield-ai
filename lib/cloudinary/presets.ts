export interface SampleImageMeta {
  key: string;
  name: string;
  badge: string;
  description: string;
  path: string;
}

export const SAMPLE_IMAGES: SampleImageMeta[] = [
  {
    key: 'portrait',
    name: 'Portrait Photo',
    badge: 'Face Detection',
    description: 'Frontal portrait to test Cloudinary facial coordinate extraction and pixelation.',
    path: '/samples/portrait.jpg',
  },
  {
    key: 'street',
    name: 'Street Scene',
    badge: 'Multi-Subject',
    description: 'City street scene with multiple subjects to test bystander face and gravity detection.',
    path: '/samples/street.jpg',
  },
  {
    key: 'nature',
    name: 'Nature Landscape',
    badge: 'Optimization',
    description: 'Wide outdoor photography to test content-aware smart cropping and format delivery.',
    path: '/samples/nature.jpg',
  },
];
