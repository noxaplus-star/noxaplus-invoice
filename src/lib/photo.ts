export async function photoToDataUrl(file: File): Promise<string> {
  const source = await readAsDataUrl(file);
  const image = await loadImage(source);
  const max = 520;
  const scale = Math.min(1, max / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.86);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Unreadable image')));
    reader.onerror = () => reject(reader.error ?? new Error('Unreadable image'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Invalid image'));
    image.src = src;
  });
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'N';
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`;
}
