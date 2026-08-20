export function Section({id,title,subtitle,children}:{id?:string;title:string;subtitle?:string;children:React.ReactNode}){
 return <section id={id} className="scroll-mt-24"><div className="mb-4"><h2 className="text-xl font-extrabold tracking-tight text-gray-900">{title}</h2>{subtitle&&<p className="mt-1 text-sm text-gray-500">{subtitle}</p>}</div>{children}</section>
}
