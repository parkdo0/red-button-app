import type { ApiError } from "@/types/api";

/**
 * API fetch 유틸리티
 * Mock → DB 전환 시 페이지에서 import 해서 사용
 *
 * @example
 * const games = await fetchApi<GameListItem[]>("/api/games?genre=전략");
 */
export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body: ApiError = await res.json().catch(() => ({
      error: `HTTP ${res.status}: ${res.statusText}`,
    }));
    throw new Error(body.error);
  }

  return res.json();
}

/**
 * POST 헬퍼
 *
 * @example
 * const order = await postApi<OrderResponse>("/api/orders", { storeId: 1, ... });
 */
export async function postApi<T>(url: string, body: unknown): Promise<T> {
  return fetchApi<T>(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
