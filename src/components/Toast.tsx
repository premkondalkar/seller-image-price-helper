import { useEffect } from 'react';

export function Toast({message,onClose}:{message:string|null;onClose:()=>void}) {
  useEffect(()=>{ if(!message) return; const t=setTimeout(onClose,3500); return ()=>clearTimeout(t); },[message,onClose]);
  if(!message) return null;
  return <div role="status" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl">{message}</div>;
}
