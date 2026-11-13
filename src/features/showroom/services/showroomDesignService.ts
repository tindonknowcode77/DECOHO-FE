import { getAccessToken } from "@/src/features/auth/services/session";

export type SavedDesignItem = {
  instanceId: string;
  productId: string;
  name: string;
  modelUrl: string;
  position: [number, number, number];
  rotationY: number;
  scale: number;
};

export type SavedShowroomDesign = {
  _id: string;
  name: string;
  showroomId: string;
  showroomName: string;
  items: SavedDesignItem[];
  updatedAt: string;
  source: "cloud" | "local";
};

const LOCAL_DESIGNS_KEY = "decoho_saved_showroom_designs";

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "/backend-api").replace(/\/$/, "");
}

function readLocalDesigns(): SavedShowroomDesign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_DESIGNS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((item) => ({ ...item, source: "local" as const }))
      : [];
  } catch {
    return [];
  }
}

function writeLocalDesigns(designs: SavedShowroomDesign[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_DESIGNS_KEY, JSON.stringify(designs));
}

export async function listSavedShowroomDesigns(): Promise<SavedShowroomDesign[]> {
  const token = getAccessToken();
  const localDesigns = readLocalDesigns();

  if (!token) {
    return localDesigns;
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/showrooms/designs`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return localDesigns;
    }
    const cloudData = (await response.json()) as Array<
      Omit<SavedShowroomDesign, "source">
    >;
    const cloudDesigns: SavedShowroomDesign[] = (Array.isArray(cloudData) ? cloudData : []).map(
      (design) => ({
        ...design,
        source: "cloud",
      }),
    );
    return [...cloudDesigns, ...localDesigns];
  } catch {
    return localDesigns;
  }
}

export async function saveShowroomDesign(payload: {
  designId?: string;
  designSource?: "cloud" | "local";
  name: string;
  showroomId: string;
  showroomName: string;
  items: SavedDesignItem[];
}): Promise<SavedShowroomDesign> {
  const token = getAccessToken();

  if (token && (!payload.designId || payload.designSource === "cloud")) {
    const isUpdate = Boolean(payload.designId && payload.designSource === "cloud");
    const endpoint = isUpdate
      ? `${getApiBaseUrl()}/showrooms/designs/${encodeURIComponent(payload.designId!)}`
      : `${getApiBaseUrl()}/showrooms/designs`;

    const response = await fetch(endpoint, {
      method: isUpdate ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: payload.name,
        showroomId: payload.showroomId,
        showroomName: payload.showroomName,
        items: payload.items,
      }),
    });

    if (response.ok) {
      const saved = (await response.json()) as Omit<SavedShowroomDesign, "source">;
      return { ...saved, source: "cloud" };
    }
  }

  // Fallback lưu trên trình duyệt nếu chưa đăng nhập hoặc bản thiết kế đang ở local
  const localDesigns = readLocalDesigns();
  const now = new Date().toISOString();

  if (payload.designId && payload.designSource === "local") {
    const next = localDesigns.map((d) =>
      d._id === payload.designId
        ? {
            ...d,
            name: payload.name,
            showroomId: payload.showroomId,
            showroomName: payload.showroomName,
            items: payload.items,
            updatedAt: now,
          }
        : d,
    );
    writeLocalDesigns(next);
    const updated = next.find((d) => d._id === payload.designId);
    if (updated) return updated;
  }

  const created: SavedShowroomDesign = {
    _id: `local-design-${Date.now()}`,
    name: payload.name,
    showroomId: payload.showroomId,
    showroomName: payload.showroomName,
    items: payload.items,
    updatedAt: now,
    source: "local",
  };
  writeLocalDesigns([created, ...localDesigns]);
  return created;
}

export async function deleteSavedShowroomDesign(
  designId: string,
  source: "cloud" | "local",
): Promise<void> {
  if (source === "local") {
    const next = readLocalDesigns().filter((d) => d._id !== designId);
    writeLocalDesigns(next);
    return;
  }

  const token = getAccessToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để xóa thiết kế đã đồng bộ.");
  }

  const response = await fetch(
    `${getApiBaseUrl()}/showrooms/designs/${encodeURIComponent(designId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error("Không thể xóa thiết kế này.");
  }
}
