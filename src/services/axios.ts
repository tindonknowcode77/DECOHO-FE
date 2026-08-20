const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/backend-api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiRequestOptions = Omit<RequestInit, "body" | "method"> & {
  token?: string;
};

function buildUrl(path: string) {
  if (path.startsWith("http")) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function serializeBody<TBody>(body?: TBody): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (body instanceof FormData || body instanceof URLSearchParams || typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
}

async function request<TResponse>(
  path: string,
  method: string,
  body?: BodyInit,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const headers = new Headers(options.headers);

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    body,
    headers,
    method,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string | string[] }
      | null;
    const detail = Array.isArray(payload?.message)
      ? payload.message.join(". ")
      : payload?.message;
    throw new ApiError(
      detail ?? `API request failed with status ${response.status}`,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export const apiClient = {
  delete: <TResponse>(path: string, options?: ApiRequestOptions) =>
    request<TResponse>(path, "DELETE", undefined, options),
  get: <TResponse>(path: string, options?: ApiRequestOptions) =>
    request<TResponse>(path, "GET", undefined, options),
  patch: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: ApiRequestOptions,
  ) => request<TResponse>(path, "PATCH", serializeBody(body), options),
  post: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: ApiRequestOptions,
  ) => request<TResponse>(path, "POST", serializeBody(body), options),
  put: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: ApiRequestOptions,
  ) => request<TResponse>(path, "PUT", serializeBody(body), options),
};
