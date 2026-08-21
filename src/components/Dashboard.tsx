import type { ProductInfo } from '../types';

export function Dashboard({product,suggestedProfit,chargeable,generatedCount,onNavigate}:{product:ProductInfo;suggestedProfit:number;chargeable:number;generatedCount:number;onNavigate:(id:string)=>void}){
 const cards=[
  {title:'Product',value:product.name||'Add product',hint:product.name?'Ready to edit':'Start with product details',icon:'📦',id:'details'},
  {title:'Suggested price',value:suggestedProfit>0?`₹${suggestedProfit.toFixed(0)}`:'—',hint:suggestedProfit>0?'Based on your costs':'Enter your costs',icon:'₹',id:'price'},
  {title:'Chargeable weight',value:`${chargeable.toFixed(2)} kg`,hint:'Actual / volumetric estimate',icon:'⚖',id:'shipping'},
  {title:'Catalog images',value:String(generatedCount),hint:generatedCount?'Images ready':'Generate 5 layouts',icon:'✦',id:'images'}
 ];
 return <div className="dashboard-grid">{cards.map(card=><button key={card.id} onClick={()=>onNavigate(card.id)} className="dashboard-card"><span className="dashboard-card-icon">{card.icon}</span><span className="dashboard-card-title">{card.title}</span><strong>{card.value}</strong><small>{card.hint}</small><span className="dashboard-open">Open →</span></button>)}</div>
}
