"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { updateProductSpaceImage } from "../services/productSpaceService";
import type { ProductSpace } from "../types";

export default function MoodboardImageEditor({ space, onChange }: { space: ProductSpace; onChange: (space: ProductSpace) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const lock = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const timer = setTimeout(() => setPreview(url), 0);
    return () => { clearTimeout(timer); URL.revokeObjectURL(url); };
  }, [file]);
  async function save() {
    if (!file || lock.current) return;
    lock.current = true; setBusy(true); setError(""); setMessage("");
    try {
      const updated = await updateProductSpaceImage(String(space._id ?? space.id ?? ""), file);
      onChange(updated); setFile(null); setPreview("");
      if (input.current) input.current.value = "";
      setMessage("Đã cập nhật ảnh moodboard.");
    } catch (e) { setError(e instanceof Error ? e.message : "Không tải được ảnh. Vui lòng thử lại."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <section className="rounded-xl border border-[#dedfd2] bg-[#faf8f2] p-5">
    <h3 className="font-bold">Ảnh moodboard</h3>
    <p className="mb-4 mt-1 text-xs leading-6 text-[#77816f]">Chọn ảnh JPG, PNG hoặc WEBP, tối đa 10 MB. Các điểm ghim được giữ nguyên; hãy kiểm tra lại vị trí sau khi đổi ảnh.</p>
    <input ref={input} aria-label="Chọn ảnh moodboard" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#e4eadf] file:px-4 file:py-2 file:text-[#2f6f5e]" onChange={e => {
      const next = e.target.files?.[0]; if (!next) return;
      setError(""); setMessage("");
      if (!["image/jpeg", "image/png", "image/webp"].includes(next.type) || next.size > 10 * 1024 * 1024) {
        setError("Vui lòng chọn ảnh JPG, PNG hoặc WEBP không quá 10 MB."); e.target.value = ""; return;
      }
      setPreview(""); setFile(next);
    }} />
    {file && preview && <div className="relative mt-4 h-64 overflow-hidden rounded-xl bg-white"><Image src={preview} alt="Ảnh moodboard mới chưa lưu" fill unoptimized className="object-contain" /></div>}
    {file && <div className="mt-4 flex items-center gap-3"><button type="button" disabled={busy} onClick={() => void save()} className="rounded-lg bg-[#2f6f5e] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Đang cập nhật ảnh…" : "Lưu ảnh mới"}</button><button type="button" disabled={busy} onClick={() => { setFile(null); setPreview(""); setError(""); if (input.current) input.current.value = ""; }} className="text-sm underline">Hủy chọn ảnh</button></div>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="mt-3 text-sm text-[#2f6f5e]">{message}</p>}
  </section>;
}
