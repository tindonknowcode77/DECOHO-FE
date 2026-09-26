// Service gọi API BE moodboards — module riêng, không liên kết với product-space.

import type { Moodboard, MoodboardProductsResponse } from '../types';

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? '/backend-api';
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return [] as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return [] as unknown as T;
  }
}

export async function fetchMoodboards(): Promise<Moodboard[]> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/moodboards`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Máy chủ trả về ${res.status}`);
  }
  const body = await readJson<Moodboard[] | { items: Moodboard[] }>(res);
  return Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : [];
}

export async function fetchMoodboardById(id: string): Promise<Moodboard> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/moodboards/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Máy chủ trả về ${res.status}`);
  }
  return readJson<Moodboard>(res);
}

export async function fetchMoodboardProducts(id: string): Promise<MoodboardProductsResponse> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/moodboards/${id}/products`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Máy chủ trả về ${res.status}`);
  }
  return readJson<MoodboardProductsResponse>(res);
}
