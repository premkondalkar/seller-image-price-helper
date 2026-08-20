export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateImage(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Unsupported image type. Please use JPG, JPEG, PNG or WEBP.';
  if (file.size > MAX_FILE_SIZE) return 'Image is larger than 10 MB. Please choose a smaller file.';
  return null;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image.'));
    reader.onerror = () => reject(new Error('Could not read image.'));
    reader.readAsDataURL(file);
  });
}

export function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('This file is not a valid readable image.'));
    image.src = dataUrl;
  });
}

export async function normalizeImage(file: File, maxDimension = 2200, quality = .9): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not prepare the image.');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

export async function demoGenerate(original: string, background: 'white' | 'grey' | 'lifestyle' | 'custom', customBackground: string, model: 'male' | 'female' | 'none'): Promise<{title:string;url:string}[]> {
  const img = await loadImage(original);
  const templates = [
    ['Clean white background', '#ffffff'],
    ['Professional studio', '#f1f5f9'],
    ['Lifestyle setting', background === 'lifestyle' ? '#dbeafe' : background === 'custom' ? customBackground : '#e2e8f0'],
    [model === 'none' ? 'Catalog product composition' : `${model === 'male' ? 'Male' : 'Female'} model-style composition`, '#f8fafc'],
    ['45-degree catalog angle', '#ffffff']
  ];
  return templates.map(([title, bg], i) => {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1500;
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas unavailable.');
    ctx.fillStyle = bg; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'rgba(15,23,42,.06)'; ctx.fillRect(80,80,1040,1340);
    const margin = i === 4 ? 170 : 120;
    const scale = Math.min((canvas.width-margin*2)/img.naturalWidth, (canvas.height-margin*2)/img.naturalHeight);
    const w = img.naturalWidth*scale, h = img.naturalHeight*scale;
    const x = (canvas.width-w)/2, y = (canvas.height-h)/2;
    ctx.save();
    if (i === 4) { ctx.translate(canvas.width/2, canvas.height/2); ctx.rotate(-0.08); ctx.drawImage(img, -w/2, -h/2, w, h); }
    else { ctx.drawImage(img, x, y, w, h); }
    ctx.restore();
    ctx.fillStyle = '#111827'; ctx.font = '700 30px system-ui'; ctx.fillText(title, 100, 1470);
    ctx.fillStyle = '#64748b'; ctx.font = '500 22px system-ui'; ctx.fillText('Demo Mode • Original product preserved', 100, 150); 
    return { title, url: canvas.toDataURL('image/jpeg', .92) };
  });
}
