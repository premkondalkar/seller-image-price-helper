import type { Background, ModelChoice } from '../types';

export async function generateAiImages(args: { imageDataUrl: string; background: Background; customBackground: string; model: ModelChoice; category: string; productName: string; }): Promise<{title:string;url:string}[]> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 330000);
  try {
    const res = await fetch('/api/generate-images', {
      method: 'POST', headers: {'Content-Type':'application/json'}, signal: controller.signal,
      body: JSON.stringify(args)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'AI image service failed.');
    if (!Array.isArray(data.images) || data.images.length === 0) throw new Error('AI service returned no images.');
    return data.images;
  } finally { window.clearTimeout(timer); }
}
