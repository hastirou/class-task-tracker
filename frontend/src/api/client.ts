import type { ApiError } from '../types';

const TOKEN_KEY = 'token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: Array<{ field: string; message: string }>;

  constructor(status: number, apiError: ApiError) {
    super(apiError.message);
    this.status = status;
    this.code = apiError.code;
    this.details = apiError.details;
  }
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    const extra = options.headers as Record<string, string>;
    for (const key of Object.keys(extra)) {
      headers[key] = extra[key];
    }
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`/api/v1${path}`, { ...options, headers });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      // SAFETY: hardcoded path, not user-controlled — no open redirect risk
      window.location.assign('/login');
    }
    throw new ApiClientError(res.status, body.error);
  }

  return body as T;
};

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
