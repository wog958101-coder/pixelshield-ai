/**
 * Client-side image pre-flight check and optional compression
 * Prevents network drops and proxy timeouts on huge raw camera uploads (10MB-30MB).
 */

export interface CompressionResult {
  file: File;
  wasCompressed: boolean;
  originalSize: number;
  compressedSize: number;
}

export async function prepareImageForUpload(file: File): Promise<CompressionResult> {
  const originalSize = file.size;

  // If file is already under 4MB, upload as-is to preserve exact camera EXIF
  if (file.size <= 4 * 1024 * 1024) {
    return {
      file,
      wasCompressed: false,
      originalSize,
      compressedSize: originalSize,
    };
  }

  // For oversized images (> 4MB), resize gracefully on canvas to prevent proxy timeout
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 2400;
        let { width, height } = img;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback to original file
          resolve({ file, wasCompressed: false, originalSize, compressedSize: originalSize });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ file, wasCompressed: false, originalSize, compressedSize: originalSize });
              return;
            }

            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve({
              file: compressedFile,
              wasCompressed: true,
              originalSize,
              compressedSize: compressedFile.size,
            });
          },
          'image/jpeg',
          0.92
        );
      };

      img.onerror = () => {
        resolve({ file, wasCompressed: false, originalSize, compressedSize: originalSize });
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      resolve({ file, wasCompressed: false, originalSize, compressedSize: originalSize });
    };

    reader.readAsDataURL(file);
  });
}
