import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'PixelShield AI — Protect Every Pixel Before You Share It',
  description: 'AI-powered media privacy and safety platform that analyzes, protects, transforms, and optimizes images using Cloudinary.',
  openGraph: {
    title: 'PixelShield AI — Protect Every Pixel Before You Share It',
    description: 'AI-powered media privacy and safety platform that analyzes, protects, transforms, and optimizes images using Cloudinary.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PixelShield AI — Protect Every Pixel Before You Share It',
    description: 'AI-powered media privacy and safety platform that analyzes, protects, transforms, and optimizes images using Cloudinary.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
