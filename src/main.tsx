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

 useEffect(()=>{try{saveProject({product,price,originalImageDataUrl:image,generated,model,background,customBackground,updatedAt:Date.now()});}catch(e){setToast(e instanceof Error?e.message:'Could not save project.');}},[product,price,image,generated,model,background,customBackground]);
 const charge=useMemo(()=>chargeableWeight(product.weight,product.length,product.width,product.height),[product]);
 const priceResult=useMemo(()=>calculatePrice(price),[price]);
 function updateImage(v:string){setImage(v);if(!v)setGenerated([]);}
 function clear(){if(!window.confirm('Clear this project and remove its locally saved data?'))return;clearProject();setProduct(defaultProduct);setPrice(defaultPrice);setImage('');setGenerated([]);setToast('Project cleared.');}
 function nav(id:string){setActive(id);document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});setMobileOpen(false)}
 const navItems=[['dashboard','Dashboard','⌂'],['upload','Upload Product','＋'],['images','Catalog Images','✦'],['shipping','Shipping Helper','▣'],['price','Price Calculator','₹'],['details','Product Details','◉'],['catalog','Download Catalog','↓']];
 return <div className="app-shell">
  <header className="app-header">
   <div className="header-inner">
    <button className="brand" onClick={()=>nav('dashboard')} aria-label="Go to dashboard"><span className="brand-mark">S</span><span><strong>Seller Studio</strong><small>Image & Price Helper</small></span></button>
    <div className="header-actions"><span className="status-pill">● Saved locally</span><button className="icon-button mobile-menu" onClick={()=>setMobileOpen(!mobileOpen)} aria-label="Open menu">☰</button><button className="clear-button" onClick={clear}>Clear</button></div>
   </div>
   {mobileOpen&&<nav className="mobile-nav">{navItems.map(([id,label,icon])=><button key={id} className={active===id?'active':''} onClick={()=>nav(id)}><span>{icon}</span>{label}</button>)}</nav>}
  </header>

  <div className="app-layout">
   <aside className="sidebar">
    <div className="seller-card"><div className="seller-avatar">S</div><div><strong>Seller Workspace</strong><span>Catalog tools</span></div></div>
    <nav className="side-nav">{navItems.map(([id,label,icon])=><button key={id} className={active===id?'active':''} onClick={()=>nav(id)}><span className="nav-icon">{icon}</span><span>{label}</span>{active===id&&<b>›</b>}</button>)}</nav>
    <div className="side-tip"><strong>Quick tip</strong><p>Add your product photo first, then complete price and shipping details.</p></div>
   </aside>

   <main className="content">
    <section id="dashboard" className="section-anchor">
     <div className="hero-card">
      <div><span className="eyebrow">SELLER DASHBOARD</span><h1>Build a better catalog.<br/><em>Sell with confidence.</em></h1><p>Upload your product, create catalog-ready images, estimate shipping and find a practical selling price — all in one place.</p><div className="hero-actions"><button className="primary-action" onClick={()=>nav('upload')}>＋ Add Product</button><button className="secondary-action" onClick={()=>nav('price')}>₹ Calculate Price</button></div></div>
      <div className="hero-illustration"><div className="phone-preview"><div className="preview-top">Seller Studio <span>⋮</span></div><div className="preview-image">{image?<img src={image} alt="Product preview"/>:<span>📦</span>}</div><div className="preview-line wide"/><div className="preview-line"/><div className="preview-price">₹{product.sellingPrice>0?product.sellingPrice.toFixed(0):'—'}</div></div></div>
     </div>
     <div className="dashboard-heading"><div><h2>Overview</h2><p>Your current product workspace</p></div><span className="demo-badge">DEMO MODE</span></div>
     <Dashboard product={product} suggestedProfit={priceResult.requiredPrice} chargeable={charge} generatedCount={generated.length} onNavigate={nav}/>
    </section>

    <Section id="upload" title="1. Upload Product" subtitle="Start with a clear JPG, PNG or WEBP product photo."><UploadCard image={image} onImage={updateImage} onError={setToast}/></Section>
    <Section id="images" title="2. Generate Catalog Images" subtitle="Create five marketplace-ready demo layouts from your uploaded image."><ImageGenerator original={image} category={product.category} productName={product.name} model={model} setModel={setModel} background={background} setBackground={setBackground} customBackground={customBackground} setCustomBackground={setCustomBackground} generated={generated} setGenerated={setGenerated} onError={setToast}/></Section>
    <Section id="shipping" title="3. Shipping Cost Helper" subtitle="Compare actual and volumetric weight. Shipping values are estimates."><ShippingHelper product={product} onChange={setProduct}/></Section>
    <Section id="price" title="4. Selling Price Calculator" subtitle="Combine product cost, marketplace charges, GST and your desired profit."><PriceCalculator value={price} onChange={v=>{setPrice(v);setProduct(p=>({...p,productCost:v.productCost,sellingPrice:p.sellingPrice}))}} onApply={v=>{setProduct(p=>({...p,sellingPrice:v}));setToast(`Selling price set to ₹${v.toFixed(0)}.`)}}/></Section>
    <Section id="details" title="5. Product Information" subtitle="Keep product details ready for your catalog. HSN is never invented automatically."><ProductDetails value={product} onChange={p=>{setProduct(p);setPrice(x=>({...x,productCost:p.productCost}))}}/></Section>
    <Section id="catalog" title="6. Download Catalog" subtitle="Download generated images individually or together."><div className="catalog-card"><div><div className="catalog-icon">↓</div><h3>Catalog package</h3><p>{generated.length?`${generated.length} generated image${generated.length===1?'':'s'} ready to download.`:'Generate catalog images first to create your package.'}</p></div>{generated.length>0?<button className="primary-action" onClick={()=>{for(const x of generated){const a=document.createElement('a');a.href=x.url;a.download=`${x.title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}.jpg`;a.click();}}}>↓ Download all</button>:<button className="secondary-action" onClick={()=>nav('images')}>Create images →</button>}</div></Section>
    <footer className="app-footer">Price and shipping calculations are estimates. Actual marketplace fees, shipping charges, taxes and discounts may vary. This app does not scrape marketplaces or bypass marketplace rules.</footer>
   </main>
  </div>
  <nav className="bottom-nav">{navItems.slice(0,5).map(([id,label,icon])=><button key={id} className={active===id?'active':''} onClick={()=>nav(id)}><span>{icon}</span><small>{label.split(' ')[0]}</small></button>)}</nav>
  <Toast message={toast} onClose={()=>setToast(null)}/>
 </div>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
