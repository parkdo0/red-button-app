import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import type { ApiError } from "@/types/api";

/**
 * Axios 공통 인스턴스
 * - baseURL: 자동 (/api prefix)
 * - 에러 인터셉터: 서버 에러 메시지 추출
 * - 타임아웃: 10초
 */
const api = axios.create({
  baseURL: "/api",
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── 응답 인터셉터: 에러 메시지 정규화 ───
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiError>) => {
    // 서버가 내려준 에러 메시지 우선 사용
    const serverMsg = error.response?.data?.error;
    const status = error.response?.status;

    const message =
      serverMsg ??
      (status === 404
        ? "요청한 리소스를 찾을 수 없습니다."
        : status === 400
          ? "잘못된 요청입니다."
          : status === 500
            ? "서버 오류가 발생했습니다."
            : error.message || "알 수 없는 오류가 발생했습니다.");

    // 에러에 정규화된 메시지 설정
    const enrichedError = new Error(message);
    (enrichedError as any).status = status;
    (enrichedError as any).original = error;
    return Promise.reject(enrichedError);
  }
);

export default api;

/**
 * 타입 안전한 GET 헬퍼
 */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.get<T>(url, config);
  return res.data;
}

/**
 * 타입 안전한 POST 헬퍼
 */
export async function apiPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.post<T>(url, data, config);
  return res.data;
}

/**
 * 타입 안전한 PATCH 헬퍼
 */
export async function apiPatch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.patch<T>(url, data, config);
  return res.data;
}

/**
 * 타입 안전한 PUT 헬퍼
 */
export async function apiPut<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.put<T>(url, data, config);
  return res.data;
}

/**
 * 타입 안전한 DELETE 헬퍼
 */
export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.delete<T>(url, config);
  return res.data;
}
