import { useRef, useState } from 'react';
import { normalizeImage, validateImage } from '../lib/image';

export function UploadCard({image,onImage,onError}:{image:string;onImage:(v:string)=>void;onError:(v:string)=>void}){
 const inputRef=useRef<HTMLInputElement>(null); const [drag,setDrag]=useState(false); const [busy,setBusy]=useState(false);
 async function process(file?:File){ if(!file)return; const err=validateImage(file); if(err){onError(err);return;} setBusy(true); try{onImage(await normalizeImage(file));}catch(e){onError(e instanceof Error?e.message:'Could not process image.');}finally{setBusy(false);} }
 return <div className="card p-4 sm:p-6">
   {!image ? <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);void process(e.dataTransfer.files?.[0])}} className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${drag?'border-blue-500 bg-blue-50':'border-gray-300 bg-gray-50'}`}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-2xl text-white">↑</div><h3 className="font-bold">Upload one product photo</h3><p className="mt-1 text-sm text-gray-500">JPG, JPEG, PNG or WEBP • max 10 MB</p>
      <button className="btn btn-primary mt-5" onClick={()=>inputRef.current?.click()} disabled={busy}>{busy?'Processing…':'Choose image'}</button><input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>void process(e.target.files?.[0])}/>
   </div> : <div className="grid gap-4 md:grid-cols-[240px_1fr] md:items-center"><div className="overflow-hidden rounded-2xl bg-gray-100"><img src={image} alt="Uploaded product preview" className="h-64 w-full object-contain"/></div><div><span className="badge bg-emerald-100 text-emerald-700">Original preserved locally</span><h3 className="mt-2 text-lg font-bold">Product photo ready</h3><p className="mt-1 text-sm text-gray-500">A compressed working copy is used for processing. Your original upload is never overwritten.</p><div className="mt-4 flex flex-wrap gap-2"><button className="btn btn-secondary" onClick={()=>inputRef.current?.click()} disabled={busy}>{busy?'Processing…':'Replace image'}</button><button className="btn btn-danger" onClick={()=>onImage('')} disabled={busy}>Remove</button></div><input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>void process(e.target.files?.[0])}/></div></div>}
 </div>
}
