import { useAuthStore } from '@/stores/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}
interface ApiErrorEnvelope {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include', // sends the httpOnly refresh cookie
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  const body = (await res.json()) as ApiSuccessEnvelope<T> | ApiErrorEnvelope;

  if (!res.ok || !body.success) {
    const err = (body as ApiErrorEnvelope).error;
    throw new ApiError(err?.code ?? 'UNKNOWN_ERROR', err?.message ?? 'Something went wrong.', err?.details);
  }

  return body.data;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data ?? {}),
    }),
  patch: <T>(path: string, data?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(data ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
