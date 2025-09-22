import { getCurrentUser } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  authenticated?: boolean;
};

export interface ApiErrorPayload {
  message: string;
  details?: unknown;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function buildQueryString(query?: Record<string, unknown>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, String(item)));
      } else {
        params.append(key, String(value));
      }
    });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function httpRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, headers = {}, authenticated = true } = options;
  const url = `${API_BASE_URL}${path}${buildQueryString(query)}`;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (authenticated) {
    const user = getCurrentUser();
    if (user?.token) {
      finalHeaders.Authorization = `Bearer ${user.token}`;
    }
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const payload = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const errorPayload: ApiErrorPayload | undefined = payload?.error ?? payload;
    throw new ApiError(
      response.status,
      errorPayload?.message || response.statusText,
      errorPayload?.details ?? payload,
    );
  }

  return (payload?.data ?? payload) as T;
}

export type ApiSuccess<T> = {
  status: 'success';
  data: T;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};
