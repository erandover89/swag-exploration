/**
 * Downscale an uploaded image to a bounded JPEG data URL so banner uploads
 * don't blow past the localStorage quota. SVG data URIs pass through untouched.
 */
export function resizeImageDataUrl(dataUrl: string, maxWidth = 1600, quality = 0.82): Promise<string> {
  if (dataUrl.startsWith('data:image/svg')) return Promise.resolve(dataUrl);
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxWidth / img.naturalWidth);
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch { resolve(dataUrl); }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/** Read a File as a data URL. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.readAsDataURL(file);
  });
}
