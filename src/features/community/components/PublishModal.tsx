"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { apiClient } from "@/src/services/axios";
import { getAccessToken } from "@/src/features/auth/services/session";
import type { CommunityPost } from "../types";
import { communityError, normalizePost } from "../services/community-data";
import CommunityDialog from "./CommunityDialog";

type Preview = { file: File; url: string; video: boolean };
const accepted = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export default function PublishModal({
  close,
  onCreated,
}: {
  close: () => void;
  onCreated: (post: CommunityPost) => void;
}) {
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const urls = useRef(new Set<string>());
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const allocated = urls.current;
    return () => {
      allocated.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function addFiles(files: FileList | null) {
    if (!files || lock.current) return;
    const selected = Array.from(files);
    if (selected.length + urls.current.size > 10) {
      setError("Mỗi bài viết được đính kèm tối đa 10 ảnh hoặc video.");
      return;
    }
    if (selected.some((file) => !accepted.includes(file.type))) {
      setError("Hãy chọn ảnh JPEG, PNG, WEBP hoặc video MP4, WEBM, MOV.");
      return;
    }
    if (
      selected.some(
        (file) =>
          file.size > (file.type.startsWith("video/") ? 50 : 10) * 1024 * 1024,
      )
    ) {
      setError("Ảnh tối đa 10 MB; video tối đa 50 MB.");
      return;
    }
    const next = selected.map((file) => {
      const url = URL.createObjectURL(file);
      urls.current.add(url);
      return { file, url, video: file.type.startsWith("video/") };
    });
    setPreviews((old) => [...old, ...next]);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const token = getAccessToken();
    if (!token) {
      setError("Vui lòng đăng nhập để đăng bài.");
      return;
    }
    if (!description.trim()) {
      setError("Hãy viết vài dòng về không gian của bạn.");
      return;
    }
    if (!previews.length) {
      setError("Hãy thêm ít nhất một ảnh hoặc video.");
      return;
    }
    const data = new FormData(event.currentTarget);
    data.set("description", description.trim());
    previews.forEach((item) => data.append("files", item.file));
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const post = normalizePost(
        await apiClient.post("/community/posts", data, { token }),
      );
      if (!post._id) throw new Error("Invalid post response");
      onCreated(post);
      close();
    } catch (error) {
      setError(
        communityError(
          error,
          "Chưa thể đăng bài. Nội dung vẫn được giữ lại, bạn thử lại nhé.",
        ),
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <CommunityDialog
      title="Chia sẻ không gian của bạn"
      onClose={close}
      busy={busy}
    >
      <form onSubmit={submit} className="overflow-y-auto p-6">
        <p className="mb-5 text-sm leading-6 text-[#74796e]">
          Một góc nhà, một ý tưởng hay một câu chuyện. Cảm hứng bắt đầu từ những
          điều nhỏ.
        </p>
        <fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
          <label className="block text-sm font-semibold">
            Câu chuyện của bạn
            <textarea
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              maxLength={3000}
              rows={4}
              placeholder="Bạn đã biến góc nhỏ này thành nơi yêu thích như thế nào?"
              className="mt-2 block w-full resize-y rounded-2xl border border-[#deded4] bg-white p-4 font-normal outline-none focus:border-[#2f6f5e]"
            />
            <span className="mt-1 block text-right text-xs font-normal text-[#777d73]">
              {description.length}/3000
            </span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Không gian
              <select
                name="roomType"
                required
                defaultValue=""
                className="mt-2 block w-full rounded-xl border border-[#deded4] bg-white p-3 font-normal"
              >
                <option value="" disabled>
                  Chọn không gian
                </option>
                {[
                  "Phòng khách",
                  "Phòng ngủ",
                  "Phòng bếp",
                  "Góc làm việc",
                  "Ban công & sân vườn",
                  "Không gian khác",
                ].map((room) => (
                  <option key={room}>{room}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Chủ đề{" "}
              <span className="font-normal text-[#777d73]">(tùy chọn)</span>
              <input
                name="hashtags"
                maxLength={200}
                placeholder="decor, nhanho, cozy"
                className="mt-2 block w-full rounded-xl border border-[#deded4] bg-white p-3 font-normal"
              />
            </label>
          </div>
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              addFiles(event.dataTransfer.files);
            }}
            className="rounded-2xl border border-dashed border-[#a5b6a0] bg-[#f0f4ec]"
          >
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="flex w-full flex-col items-center gap-2 p-6 text-[#365f47]"
            >
              <ImagePlus size={28} />
              <span className="text-sm font-semibold">Thêm ảnh hoặc video</span>
              <span className="text-xs text-[#777d73]">
                Kéo thả hoặc chọn tệp · Tối đa 10 tệp
              </span>
              <span className="text-xs text-[#777d73]">
                Ảnh ≤ 10 MB · Video ≤ 50 MB
              </span>
            </button>
            <input
              ref={input}
              type="file"
              accept={accepted.join(",")}
              multiple
              className="sr-only"
              tabIndex={-1}
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </div>
          {!!previews.length && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {previews.map((item) => (
                <div
                  key={item.url}
                  className="relative aspect-square overflow-hidden rounded-xl bg-[#eceee6]"
                >
                  {item.video ? (
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <Image
                      src={item.url}
                      alt={item.file.name}
                      fill
                      sizes="150px"
                      unoptimized
                      className="object-cover"
                    />
                  )}
                  <button
                    type="button"
                    aria-label={`Xóa ${item.file.name}`}
                    className="absolute right-1 top-1 rounded-full bg-black/65 p-1.5 text-white"
                    onClick={() => {
                      URL.revokeObjectURL(item.url);
                      urls.current.delete(item.url);
                      setPreviews((old) =>
                        old.filter((p) => p.url !== item.url),
                      );
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </fieldset>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#2f6f5e] p-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy && <LoaderCircle size={18} className="animate-spin" />}
          {busy ? "Đang đăng bài…" : "Đăng bài viết"}
        </button>
      </form>
    </CommunityDialog>
  );
}
