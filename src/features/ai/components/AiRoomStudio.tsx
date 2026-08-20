"use client";

import Image from "next/image";
import { useState } from "react";
import { getAccessToken } from "@/src/features/auth/services/session";

export default function AiRoomStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function selectFile(nextFile: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setFile(nextFile); setPreview(nextFile ? URL.createObjectURL(nextFile) : "");
    setResult(null); setError("");
  }

  async function scan() {
    if (!file) { setError("Vui lòng chọn một ảnh nội thất."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const form = new FormData(); form.append("image", file);
      const token = getAccessToken();
      const base = process.env.NEXT_PUBLIC_API_URL ?? "/backend-api";
      const response = await fetch(`${base}/ai-scanner/scan`, { method: "POST", body: form, headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message ?? "AI không thể phân tích ảnh.");
      setResult(body);
    } catch (value) { setError(value instanceof Error ? value.message : "Không thể kết nối AI Scanner."); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-[#f5f1ea] px-5 py-12"><div className="mx-auto max-w-5xl"><p className="text-xs font-bold uppercase tracking-widest text-[#a76227]">AI Product Scanner</p><h1 className="mt-2 text-4xl font-black">Quét sản phẩm trong ảnh</h1><p className="mt-3 text-neutral-600">Tải ảnh căn phòng lên để AI nhận diện đồ nội thất và trả về dữ liệu từ backend.</p><div className="mt-8 grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border bg-white p-6"><label className="block cursor-pointer rounded-xl border-2 border-dashed p-8 text-center"><span className="font-bold">Chọn ảnh từ thiết bị</span><input accept="image/*" className="sr-only" onChange={(event) => selectFile(event.target.files?.[0] ?? null)} type="file" /></label>{preview ? <Image alt="Ảnh cần quét" className="mt-5 h-72 w-full rounded-xl object-contain" height={600} src={preview} unoptimized width={800} /> : <div className="mt-5 grid h-72 place-items-center rounded-xl bg-neutral-100 text-neutral-500">Chưa có ảnh</div>}<button className="mt-5 w-full rounded-lg bg-[#17211b] px-5 py-3 font-bold text-white disabled:opacity-50" disabled={!file || loading} onClick={() => void scan()} type="button">{loading ? "Đang phân tích..." : "Quét bằng AI"}</button></section><section className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-black">Kết quả nhận diện</h2>{error ? <p className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">{error}</p> : result ? <pre className="mt-5 max-h-[480px] overflow-auto rounded-xl bg-[#17211b] p-5 text-xs text-white">{JSON.stringify(result, null, 2)}</pre> : <p className="mt-5 text-neutral-500">Kết quả thật từ Gemini sẽ hiển thị tại đây.</p>}</section></div></div></main>;
}
