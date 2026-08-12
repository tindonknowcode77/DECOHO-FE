"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAccessToken, getSessionUser } from "@/src/features/auth/services/session";

type ModuleConfig={id:string;label:string;endpoint?:string;group:string};
const modules:ModuleConfig[]=[
  {id:"dashboard",label:"Dashboard",endpoint:"/admin/dashboard",group:"Tổng quan"},
  {id:"users",label:"Người dùng",endpoint:"/admin/users",group:"Tài khoản"},
  {id:"suppliers",label:"Supplier",endpoint:"/admin/suppliers",group:"Tài khoản"},
  {id:"products",label:"Sản phẩm",endpoint:"/products/admin/all",group:"Thương mại"},
  {id:"categories",label:"Danh mục",endpoint:"/categories",group:"Thương mại"},
  {id:"brands",label:"Thương hiệu",endpoint:"/brands/admin/all",group:"Thương mại"},
  {id:"orders",label:"Đơn hàng",endpoint:"/orders/admin/all",group:"Thương mại"},
  {id:"payments",label:"Thanh toán",endpoint:"/payments/admin",group:"Thương mại"},
  {id:"promotions",label:"Khuyến mãi",endpoint:"/promotions/admin/all",group:"Thương mại"},
  {id:"moodboard",label:"Product Space",endpoint:"/product-spaces/admin/all",group:"Không gian và AI"},
  {id:"showroom",label:"Showroom 3D",endpoint:"/showrooms/admin/all",group:"Không gian và AI"},
  {id:"scanner",label:"AI Product Scanner",endpoint:"/ai-scanner/admin/history",group:"Không gian và AI"},
  {id:"reviews",label:"Đánh giá",endpoint:"/reviews/admin/all",group:"Chăm sóc"},
  {id:"complaints",label:"Khiếu nại",endpoint:"/support-tickets/admin/all",group:"Chăm sóc"},
  {id:"content",label:"Nội dung website",endpoint:"/website-content/admin/all",group:"Nội dung"},
  {id:"notifications",label:"Thông báo",group:"Nội dung"},
  {id:"reports",label:"Báo cáo thống kê",group:"Hệ thống"},
  {id:"staff",label:"Nhân viên và phân quyền",endpoint:"/admin/users?role=STAFF",group:"Hệ thống"},
  {id:"activity",label:"Nhật ký hoạt động",group:"Hệ thống"},
  {id:"settings",label:"Cài đặt hệ thống",group:"Hệ thống"},
];

function apiBase(){return(process.env.NEXT_PUBLIC_API_URL??"http://localhost:3000/api").replace(/\/$/,"");}
function idOf(value:Record<string,unknown>){return String(value._id??value.id??value.roomId??value.ticketCode??value.orderCode??"");}
function titleOf(value:Record<string,unknown>){return String(value.title??value.name??value.code??value.ticketCode??value.orderCode??value.originalFileName??value.email??idOf(value)??"Bản ghi");}
function summaryOf(value:Record<string,unknown>){const keys=["status","role","type","email","roomType","model","price","rating","priority"];return keys.filter((key)=>value[key]!==undefined).map((key)=>`${key}: ${String(value[key])}`).join(" · ");}

export default function AdminCenterView(){
  const[active,setActive]=useState("dashboard");const[data,setData]=useState<unknown>(null);const[loading,setLoading]=useState(false);const[error,setError]=useState("");const[query,setQuery]=useState("");
  const current=modules.find((item)=>item.id===active)??modules[0];const user=getSessionUser();
  const load=useCallback(async()=>{if(!current.endpoint){setData([]);setError("");return;}setLoading(true);setError("");try{const token=getAccessToken();const response=await fetch(`${apiBase()}${current.endpoint}`,{cache:"no-store",headers:{Accept:"application/json",...(token?{Authorization:`Bearer ${token}`}:{})}});const body=await response.json().catch(()=>null);if(!response.ok)throw new Error(body?.message??`Không thể tải dữ liệu (${response.status}).`);setData(body);}catch(value){setData(null);setError(value instanceof Error?value.message:"Không thể kết nối backend.");}finally{setLoading(false);}},[current.endpoint]);
  useEffect(()=>{const timer=window.setTimeout(()=>{void load()},0);return()=>window.clearTimeout(timer)},[load]);
  const rows=useMemo(()=>{const source=Array.isArray(data)?data:Array.isArray((data as{items?:unknown[]})?.items)?(data as{items:unknown[]}).items:[];return source.filter((item)=>JSON.stringify(item).toLowerCase().includes(query.toLowerCase())) as Record<string,unknown>[]},[data,query]);
  const groups=[...new Set(modules.map((item)=>item.group))];
  if(!user||!["admin","super_admin","staff"].includes(user.role??""))return <main className="grid min-h-screen place-items-center bg-[#f5f1ea] p-6"><div className="max-w-md rounded-2xl border bg-white p-8 text-center"><h1 className="text-2xl font-black">Cần quyền quản trị</h1><p className="mt-3 text-sm text-[#687069]">Đăng nhập bằng tài khoản Admin hoặc Staff đã được cấp quyền.</p><Link className="mt-5 inline-block rounded-lg bg-[#17211b] px-5 py-3 text-sm font-bold text-white" href="/login">Đăng nhập</Link></div></main>;
  return <main className="min-h-screen bg-[#f5f1ea] text-[#17211b]"><div className="grid min-h-screen lg:grid-cols-[280px_1fr]"><aside className="bg-[#17211b] p-5 text-white"><Link className="text-2xl font-black" href="/">DECOHO</Link><p className="mt-1 text-xs text-white/50">Admin Center</p><nav className="mt-8 space-y-6">{groups.map((group)=><section key={group}><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/35">{group}</p>{modules.filter((item)=>item.group===group).map((item)=><button className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left text-sm ${active===item.id?"bg-[#dca451] font-black text-[#17211b]":"text-white/70 hover:bg-white/10"}`} key={item.id} onClick={()=>setActive(item.id)} type="button">{item.label}</button>)}</section>)}</nav></aside><section><header className="flex items-center justify-between border-b bg-white px-6 py-4"><div><h1 className="text-xl font-black">{current.label}</h1><p className="text-xs text-[#777e77]">Dữ liệu trực tiếp từ DECOHO Backend</p></div><div className="text-right text-sm"><strong>{user.name}</strong><p className="text-xs uppercase text-[#777e77]">{user.role}</p></div></header><div className="p-5 sm:p-8"><div className="flex flex-col justify-between gap-3 sm:flex-row"><input className="h-11 rounded-lg border bg-white px-4 text-sm sm:w-80" onChange={(event)=>setQuery(event.target.value)} placeholder="Tìm trong dữ liệu..." value={query}/><button className="h-11 rounded-lg bg-[#2f6f5e] px-5 text-sm font-bold text-white" onClick={()=>void load()} type="button">Tải lại</button></div>{loading?<div className="mt-6 rounded-xl border bg-white p-12 text-center text-sm">Đang tải dữ liệu...</div>:error?<div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>:rows.length?<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((item,index)=><article className="rounded-xl border bg-white p-5 shadow-sm" key={idOf(item)||index}><div className="flex items-start justify-between gap-3"><h2 className="font-black">{titleOf(item)}</h2><span className="rounded bg-[#f2eee7] px-2 py-1 text-[10px]">{idOf(item)}</span></div><p className="mt-3 text-xs leading-5 text-[#687069]">{summaryOf(item)||"Không có thông tin tóm tắt."}</p></article>)}</div>:<div className="mt-6 rounded-xl border bg-white p-12 text-center"><h2 className="font-black">Chưa có dữ liệu</h2><p className="mt-2 text-sm text-[#777e77]">Module này không sử dụng dữ liệu mẫu. Dữ liệu sẽ xuất hiện khi backend có bản ghi thật.</p></div>}</div></section></div></main>;
}
