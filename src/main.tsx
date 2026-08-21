import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import type { Background, ModelChoice, PriceInputs, ProductInfo, GeneratedImage } from './types';
import { loadProject, saveProject, clearProject } from './lib/storage';
import { chargeableWeight, calculatePrice } from './lib/calculations';
import { UploadCard } from './components/UploadCard';
import { ProductDetails } from './components/ProductDetails';
import { ImageGenerator } from './components/ImageGenerator';
import { ShippingHelper } from './components/ShippingHelper';
import { PriceCalculator } from './components/PriceCalculator';
import { Dashboard } from './components/Dashboard';
import { Section } from './components/Section';
import { Toast } from './components/Toast';

const defaultProduct: ProductInfo = { name:'', category:'', hsn:'', productCost:0, sellingPrice:0, weight:0, length:0, width:0, height:0 };
const defaultPrice: PriceInputs = { productCost:0, packagingCost:0, otherCosts:0, marketplacePct:0, shippingCost:0, desiredProfit:0, gstPct:0 };

function App(){
 const existing=loadProject();
 const [product,setProduct]=useState<ProductInfo>(existing?.product||defaultProduct);
 const [price,setPrice]=useState<PriceInputs>(existing?.price||defaultPrice);
 const [image,setImage]=useState(existing?.originalImageDataUrl||'');
 const [generated,setGenerated]=useState<GeneratedImage[]>(existing?.generated||[]);
 const [model,setModel]=useState<ModelChoice>(existing?.model||'none');
 const [background,setBackground]=useState<Background>(existing?.background||'white');
 const [customBackground,setCustomBackground]=useState(existing?.customBackground||'');
 const [toast,setToast]=useState<string|null>(null);
 const [mobileOpen,setMobileOpen]=useState(false);
 const [active,setActive]=useState('dashboard');
 const [search,setSearch]=useState('');

 useEffect(()=>{try{saveProject({product,price,originalImageDataUrl:image,generated,model,background,customBackground,updatedAt:Date.now()});}catch(e){setToast(e instanceof Error?e.message:'Could not save project.');}},[product,price,image,generated,model,background,customBackground]);
 const charge=useMemo(()=>chargeableWeight(product.weight,product.length,product.width,product.height),[product]);
 const priceResult=useMemo(()=>calculatePrice(price),[price]);
 function updateImage(v:string){setImage(v);if(!v)setGenerated([]);}
 function clear(){if(!window.confirm('Clear this project and remove its locally saved data?'))return;clearProject();setProduct(defaultProduct);setPrice(defaultPrice);setImage('');setGenerated([]);setToast('Project cleared.');}
 function nav(id:string){setActive(id);document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});setMobileOpen(false)}
 const navItems=[['dashboard','Dashboard','⌂'],['upload','Add Product','＋'],['images','Catalog Images','✦'],['shipping','Shipping','▣'],['price','Price Calculator','₹'],['details','Product Details','◉'],['catalog','Downloads','↓']];
 const productReady=Boolean(product.name||image);
 return <div className="app-shell">
  <header className="app-header">
   <div className="header-inner">
    <button className="brand" onClick={()=>nav('dashboard')} aria-label="Go to dashboard"><span className="brand-mark">S</span><span><strong>Seller Studio</strong><small>Supplier workspace</small></span></button>
    <div className="header-search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search seller tools" aria-label="Search seller tools"/></div>
    <div className="header-actions"><span className="status-pill">● Saved</span><button className="icon-button mobile-menu" onClick={()=>setMobileOpen(!mobileOpen)} aria-label="Open menu">☰</button><button className="clear-button" onClick={clear}>Reset</button><div className="profile-chip"><span>S</span><small>Seller</small></div></div>
   </div>
   {mobileOpen&&<nav className="mobile-nav">{navItems.map(([id,label,icon])=><button key={id} className={active===id?'active':''} onClick={()=>nav(id)}><span>{icon}</span>{label}</button>)}</nav>}
  </header>

  <div className="app-layout">
   <aside className="sidebar">
    <div className="seller-card"><div className="seller-avatar">S</div><div><strong>Seller Workspace</strong><span>Catalog tools · Local data</span></div></div>
    <nav className="side-nav">{navItems.map(([id,label,icon])=><button key={id} className={active===id?'active':''} onClick={()=>nav(id)}><span className="nav-icon">{icon}</span><span>{label}</span>{active===id&&<b>›</b>}</button>)}</nav>
    <div className="side-tip"><strong>Seller tip</strong><p>Complete product details before creating your final catalog images and selling price.</p></div>
   </aside>

   <main className="content">
    <section id="dashboard" className="section-anchor">
     <div className="welcome-row"><div><span className="eyebrow">SELLER CENTER</span><h1>Good business starts with a <em>great catalog.</em></h1><p>Manage your product photo, catalog images, pricing and shipping estimates from one seller workspace.</p></div><button className="primary-action welcome-add" onClick={()=>nav('upload')}>＋ Add Product</button></div>

     <div className="metric-grid">
      <div className="metric-card"><span className="metric-icon pink">📦</span><div><small>PRODUCT</small><strong>{product.name||'Not added'}</strong><span>{productReady?'Workspace ready':'Add your first product'}</span></div></div>
      <div className="metric-card"><span className="metric-icon green">₹</span><div><small>SUGGESTED PRICE</small><strong>{priceResult.requiredPrice>0?`₹${priceResult.requiredPrice.toFixed(0)}`:'—'}</strong><span>Based on entered costs</span></div></div>
      <div className="metric-card"><span className="metric-icon orange">⚖</span><div><small>CHARGEABLE WEIGHT</small><strong>{charge.toFixed(2)} kg</strong><span>Actual / volumetric</span></div></div>
      <div className="metric-card"><span className="metric-icon purple">✦</span><div><small>CATALOG IMAGES</small><strong>{generated.length}/5</strong><span>{generated.length?'Ready to review':'Not generated'}</span></div></div>
     </div>

     <div className="seller-hero"><div><span className="hero-label">SELLER GROWTH TOOLKIT</span><h2>Make every product listing look ready to sell.</h2><p>Use the same simple workflow: add product → create catalog images → calculate price → check shipping.</p><div className="hero-actions"><button className="primary-action" onClick={()=>nav('upload')}>Start listing</button><button className="secondary-action" onClick={()=>nav('images')}>Create catalog</button></div></div><div className="hero-stack"><div className="stack-card"><span>CATALOG</span><strong>{generated.length?`${generated.length} images ready`:'Create 5 layouts'}</strong></div><div className="stack-card offset"><span>PRICE</span><strong>{priceResult.requiredPrice>0?`₹${priceResult.requiredPrice.toFixed(0)}`:'Add costs'}</strong></div></div></div>

     <div className="section-title-row"><div><h2>Quick actions</h2><p>Frequently used seller tools</p></div><span className="demo-badge">PRIVATE WORKSPACE</span></div>
     <div className="quick-grid">
      <button onClick={()=>nav('upload')} className="quick-card"><span className="quick-icon pink">＋</span><strong>Add Product</strong><small>Upload product photo and start a listing</small><b>Open →</b></button>
      <button onClick={()=>nav('images')} className="quick-card"><span className="quick-icon purple">✦</span><strong>Catalog Images</strong><small>Generate five marketplace-ready layouts</small><b>Open →</b></button>
      <button onClick={()=>nav('price')} className="quick-card"><span className="quick-icon green">₹</span><strong>Price Calculator</strong><small>Estimate selling price, fees and profit</small><b>Open →</b></button>
      <button onClick={()=>nav('shipping')} className="quick-card"><span className="quick-icon orange">▣</span><strong>Shipping Helper</strong><small>Check actual and volumetric weight</small><b>Open →</b></button>
     </div>

     <div className="workflow-card"><div className="workflow-head"><div><h2>Listing progress</h2><p>Follow these steps for a complete product workspace.</p></div><strong>{[product.name,image,generated.length>0,priceResult.requiredPrice>0,product.category].filter(Boolean).length}/5</strong></div><div className="progress-track"><span style={{width:`${([product.name,image,generated.length>0,priceResult.requiredPrice>0,product.category].filter(Boolean).length/5)*100}%`}}/></div><div className="progress-steps"><span className={image?'done':''}>1. Photo</span><span className={generated.length?'done':''}>2. Catalog</span><span className={priceResult.requiredPrice>0?'done':''}>3. Price</span><span className={product.category?'done':''}>4. Details</span><span className={productReady?'done':''}>5. Review</span></div></div>

     <div className="dashboard-heading"><div><h2>Workspace overview</h2><p>Tap a card to jump directly to a tool.</p></div></div>
     <Dashboard product={product} suggestedProfit={priceResult.requiredPrice} chargeable={charge} generatedCount={generated.length} onNavigate={nav}/>
    </section>

    <Section id="upload" title="1. Add Product" subtitle="Start with a clear JPG, PNG or WEBP product photo."><UploadCard image={image} onImage={updateImage} onError={setToast}/></Section>
    <Section id="images" title="2. Catalog Images" subtitle="Create five marketplace-ready demo layouts from your uploaded image."><ImageGenerator original={image} category={product.category} productName={product.name} model={model} setModel={setModel} background={background} setBackground={setBackground} customBackground={customBackground} setCustomBackground={setCustomBackground} generated={generated} setGenerated={setGenerated} onError={setToast}/></Section>
    <Section id="shipping" title="3. Shipping Helper" subtitle="Compare actual and volumetric weight. Shipping values are estimates."><ShippingHelper product={product} onChange={setProduct}/></Section>
    <Section id="price" title="4. Price Calculator" subtitle="Combine product cost, marketplace charges, GST and your desired profit."><PriceCalculator value={price} onChange={v=>{setPrice(v);setProduct(p=>({...p,productCost:v.productCost,sellingPrice:p.sellingPrice}))}} onApply={v=>{setProduct(p=>({...p,sellingPrice:v}));setToast(`Selling price set to ₹${v.toFixed(0)}.`)}}/></Section>
    <Section id="details" title="5. Product Details" subtitle="Keep product details ready for your catalog. HSN is never invented automatically."><ProductDetails value={product} onChange={p=>{setProduct(p);setPrice(x=>({...x,productCost:p.productCost}))}}/></Section>
    <Section id="catalog" title="6. Downloads" subtitle="Download generated images individually or together."><div className="catalog-card"><div><div className="catalog-icon">↓</div><h3>Catalog package</h3><p>{generated.length?`${generated.length} generated image${generated.length===1?'':'s'} ready to download.`:'Generate catalog images first to create your package.'}</p></div>{generated.length>0?<button className="primary-action" onClick={()=>{for(const x of generated){const a=document.createElement('a');a.href=x.url;a.download=`${x.title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}.jpg`;a.click();}}}>↓ Download all</button>:<button className="secondary-action" onClick={()=>nav('images')}>Create images →</button>}</div></Section>
    <footer className="app-footer">Seller Studio is a private catalog and pricing workspace. Price and shipping calculations are estimates; actual marketplace fees, taxes and shipping charges may vary.</footer>
   </main>
  </div>
  <nav className="bottom-nav">{navItems.slice(0,5).map(([id,label,icon])=><button key={id} className={active===id?'active':''} onClick={()=>nav(id)}><span>{icon}</span><small>{label.split(' ')[0]}</small></button>)}</nav>
  <Toast message={toast} onClose={()=>setToast(null)}/>
 </div>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);