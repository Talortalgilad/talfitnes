const MAX_WIDTH = 800;
const QUALITY = 0.7;

// Downscale to max 800px wide and re-encode as JPEG 0.7 so localStorage stays small.
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_WIDTH / img.naturalWidth);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('canvas'));
      ctx.fillStyle = '#fff'; // flatten transparency (PNG) onto white before JPEG
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', QUALITY));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load')); };
    img.src = url;
  });
}

// Unsplash serves any width: ask for what the slot needs (cards 400, item page 800, thumbnails 200).
export function sized(src: string | undefined, w: number): string | undefined {
  if (!src || !src.includes('images.unsplash.com')) return src;
  return /[?&]w=\d+/.test(src) ? src.replace(/([?&]w=)\d+/, `$1${w}`) : `${src}${src.includes('?') ? '&' : '?'}w=${w}`;
}
