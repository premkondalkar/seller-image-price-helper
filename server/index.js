import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = Number(process.env.PORT || 8787);
const root = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (_req,res) => res.json({ok:true, demoMode: !process.env.AI_IMAGE_API_KEY}));

app.post('/api/generate-images', async (req,res) => {
  if (!process.env.AI_IMAGE_API_KEY || !process.env.AI_IMAGE_API_URL) {
    return res.status(503).json({ error: 'AI image generation is not configured. Demo Mode is available without an API key.' });
  }
  const { imageDataUrl, background, customBackground, model, category, productName } = req.body ?? {};
  if (typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:image/')) return res.status(400).json({error:'A valid product image is required.'});
  if (imageDataUrl.length > 14_000_000) return res.status(413).json({error:'Image payload is too large.'});
  const safeText = (v) => typeof v === 'string' ? v.slice(0,160) : '';
  const variants = [
    ['Clean white-background product image', 'pure white background, centered marketplace product shot'],
    ['Professional studio image', 'premium soft studio lighting with a clean light-grey studio backdrop'],
    ['Lifestyle image', 'tasteful realistic lifestyle environment appropriate to the product category'],
    ['Model/wearer image', model === 'none' ? 'catalog composition with no model or wearer' : `realistic ${model} model/wearer, while preserving the exact product`],
    ['45-degree catalog angle', 'catalog presentation with a subtle 45-degree product angle, without changing product geometry']
  ];
  const makePrompt = (variant) => `Create ONE marketplace catalog image from the supplied product image. ${variant[1]}. Product name: ${safeText(productName)}. Category: ${safeText(category)}. Background preference: ${safeText(background === 'custom' ? customBackground : background)}. Model preference: ${safeText(model)}. Preserve the exact product color, pattern, logo, shape, proportions and important details. Do not invent features, text, materials, accessories or branding. Do not remove important product details. Commercial e-commerce photography, realistic, clean, high resolution.`;
  try {
    const images = [];
    for (const variant of variants) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), Number(process.env.AI_IMAGE_TIMEOUT_MS || 60000));
      try {
        const response = await fetch(process.env.AI_IMAGE_API_URL, {
          method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.AI_IMAGE_API_KEY}`}, body:JSON.stringify({ model: process.env.AI_IMAGE_MODEL || 'authorized-image-model', prompt: makePrompt(variant), imageDataUrl, size: '1024x1024', n: 1 }), signal:controller.signal
        });
        const data = await response.json().catch(()=>({}));
        if (!response.ok) return res.status(502).json({error:data?.error?.message || `AI provider rejected ${variant[0]}.`});
        const first = data?.data?.[0];
        const url = first?.url || (first?.b64_json ? `data:image/png;base64,${first.b64_json}` : null);
        if (!url) return res.status(502).json({error:`AI provider returned no usable image for ${variant[0]}.`});
        images.push({title:variant[0],url});
      } finally { clearTimeout(timer); }
    }
    return res.json({images});

  } catch (err) {
    const message = err?.name === 'AbortError' ? 'AI image request timed out.' : 'Network error while contacting the AI image service.';
    return res.status(502).json({error:message});
  }
});

const dist = path.resolve(root, '..', 'dist');
app.use(express.static(dist));
app.get(/.*/, (_req,res) => res.sendFile(path.join(dist,'index.html')));

app.listen(port, () => console.log(`Seller Image & Price Helper server listening on ${port}`));
