import type { ProductInfo } from '../types';

export function ProductDetails({value,onChange}:{value:ProductInfo;onChange:(v:ProductInfo)=>void}){
 const set=(k:keyof ProductInfo,v:string)=>onChange({...value,[k]:k==='name'||k==='category'||k==='hsn'?v:Math.max(0,Number(v)||0)} as ProductInfo);
 return <div className="card p-4 sm:p-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <Field label="Product name *"><input className="input" value={value.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Cotton Kurti" maxLength={120}/></Field>
  <Field label="Category *"><input className="input" value={value.category} onChange={e=>set('category',e.target.value)} placeholder="e.g. Women clothing" maxLength={80}/></Field>
  <Field label="HSN code"><input className="input" value={value.hsn} onChange={e=>set('hsn',e.target.value.replace(/[^0-9]/g,'').slice(0,8))} placeholder="Enter only if known" inputMode="numeric"/></Field>
  <Num label="Product cost (₹)" value={value.productCost} onChange={v=>set('productCost',v)} />
  <Num label="Selling price (₹)" value={value.sellingPrice} onChange={v=>set('sellingPrice',v)} />
  <Num label="Weight (g)" value={value.weight} onChange={v=>set('weight',v)} />
  <Num label="Length (cm)" value={value.length} onChange={v=>set('length',v)} />
  <Num label="Width (cm)" value={value.width} onChange={v=>set('width',v)} />
  <Num label="Height (cm)" value={value.height} onChange={v=>set('height',v)} />
 </div><p className="mt-4 text-xs text-gray-500">HSN is not auto-invented. Verify the correct HSN from your tax professional or an authorized/current source.</p></div>
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label><span className="label">{label}</span>{children}</label>}
function Num({label,value,onChange}:{label:string;value:number;onChange:(v:string)=>void}){return <Field label={label}><input className="input" type="number" min="0" step="0.01" value={value||''} onChange={e=>onChange(e.target.value)}/></Field>}
