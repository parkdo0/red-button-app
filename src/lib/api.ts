/**
 * 클라이언트 API 함수 모음
 * 모든 Client Component에서 이 파일을 import 하여 사용
 *
 * @example
 * import { gameApi, orderApi } from "@/lib/api";
 * const games = await gameApi.list({ genre: "전략" });
 * const order = await orderApi.create({ storeId: 1, tableId: 1, items: [...] });
 */
import { apiGet, apiPost, apiPatch, apiDelete } from "./axios";
import type {
  GameListItem,
  GameDetailResponse,
  CreateGameRequest,
  UpdateGameRequest,
  MenuItemResponse,
  CreateMenuRequest,
  UpdateMenuRequest,
  OrderResponse,
  CreateOrderRequest,
  UpdateOrderRequest,
  ChatMessageResponse,
  SendChatRequest,
  SessionResponse,
  CheckInRequest,
  TagResponse,
  CreateTagRequest,
  StoreResponse,
  UpdateStoreRequest,
  EventResponse,
  CreateEventRequest,
  UpdateEventRequest,
  StoreGameRequest,
  StoreMenuRequest,
  ApiSuccessResponse,
} from "@/types/api";

// ============================================
// 게임 API
// ============================================
export const gameApi = {
  /** 게임 목록 (필터링 지원) */
  list(params?: {
    search?: string;
    genre?: string;
    playerCount?: string;
    difficulty?: string;
    playTime?: string;
  }) {
    return apiGet<GameListItem[]>("/games", { params });
  },

  /** 게임 상세 */
  get(id: number) {
    return apiGet<GameDetailResponse>(`/games/${id}`);
  },

  /** 게임 생성 (Admin) */
  create(data: CreateGameRequest) {
    return apiPost<GameListItem>("/games", data);
  },

  /** 게임 수정 (Admin) */
  update(id: number, data: UpdateGameRequest) {
    return apiPatch<GameListItem>(`/games/${id}`, data);
  },

  /** 게임 삭제 (Admin) - soft delete */
  delete(id: number) {
    return apiDelete<ApiSuccessResponse>(`/games/${id}`);
  },
};

// ============================================
// 메뉴 API
// ============================================
export const menuApi = {
  /** 메뉴 목록 */
  list(params?: { category?: string }) {
    return apiGet<MenuItemResponse[]>("/menus", { params });
  },

  /** 메뉴 생성 (Admin) */
  create(data: CreateMenuRequest) {
    return apiPost<MenuItemResponse>("/menus", data);
  },

  /** 메뉴 수정 (Admin) */
  update(id: number, data: UpdateMenuRequest) {
    return apiPatch<MenuItemResponse>(`/menus/${id}`, data);
  },

  /** 메뉴 삭제 (Admin) - soft delete */
  delete(id: number) {
    return apiDelete<ApiSuccessResponse>(`/menus/${id}`);
  },
};

// ============================================
// 주문 API
// ============================================
export const orderApi = {
  /** 주문 목록 */
  list(params?: { storeId?: number; tableId?: number; status?: string }) {
    return apiGet<OrderResponse[]>("/orders", { params });
  },

  /** 주문 생성 */
  create(data: CreateOrderRequest) {
    return apiPost<OrderResponse>("/orders", data);
  },

  /** 주문 상태 변경 (Admin) */
  updateStatus(id: number, data: UpdateOrderRequest) {
    return apiPatch<OrderResponse>(`/orders/${id}`, data);
  },

  /** 결제 콜백 (VAN사 연동 포인트) */
  processPayment(id: number, data: { status: "COMPLETED" | "FAILED"; transactionId?: string }) {
    return apiPost<{ success: boolean; orderId: number; paymentStatus: string }>(`/orders/${id}/payment`, data);
  },
};

// ============================================
// 채팅 API
// ============================================
export const chatApi = {
  /** 채팅 메시지 목록 */
  list(params: { storeId: number; tableNo: string }) {
    return apiGet<ChatMessageResponse[]>("/chat", { params });
  },

  /** 메시지 전송 */
  send(data: SendChatRequest) {
    return apiPost<ChatMessageResponse>("/chat", data);
  },
};

// ============================================
// 세션 API
// ============================================
export const sessionApi = {
  /** 활성 세션 조회 */
  getActive(params: { storeId: number; tableNo: string }) {
    return apiGet<SessionResponse | null>("/sessions/active", { params });
  },

  /** 체크인 */
  checkIn(data: CheckInRequest) {
    return apiPost<SessionResponse>("/sessions", data);
  },

  /** 체크아웃 */
  checkOut(id: number) {
    return apiPatch<SessionResponse>(`/sessions/${id}`, { action: "checkout" });
  },
};

// ============================================
// 태그 API (Admin)
// ============================================
export const tagApi = {
  list() {
    return apiGet<TagResponse[]>("/tags");
  },

  create(data: CreateTagRequest) {
    return apiPost<TagResponse>("/tags", data);
  },

  update(id: number, data: Partial<CreateTagRequest>) {
    return apiPatch<TagResponse>(`/tags/${id}`, data);
  },

  delete(id: number) {
    return apiDelete<ApiSuccessResponse>(`/tags/${id}`);
  },
};

// ============================================
// 매장 API (Admin)
// ============================================
export const storeApi = {
  list() {
    return apiGet<StoreResponse[]>("/stores");
  },

  get(id: number) {
    return apiGet<StoreResponse>(`/stores/${id}`);
  },

  update(id: number, data: UpdateStoreRequest) {
    return apiPatch<StoreResponse>(`/stores/${id}`, data);
  },
};

// ============================================
// 이벤트 API (Admin)
// ============================================
export const eventApi = {
  list() {
    return apiGet<EventResponse[]>("/events");
  },

  create(data: CreateEventRequest) {
    return apiPost<EventResponse>("/events", data);
  },

  update(id: number, data: UpdateEventRequest) {
    return apiPatch<EventResponse>(`/events/${id}`, data);
  },

  delete(id: number) {
    return apiDelete<ApiSuccessResponse>(`/events/${id}`);
  },
};

// ============================================
// 매장별 게임/메뉴 설정 (Admin)
// ============================================
export const storeGameApi = {
  /** 매장 게임 목록 (전체 게임 + 매장 설정 병합) */
  list(storeId: number) {
    return apiGet<unknown[]>("/store-games", { params: { storeId } });
  },

  /** 매장 게임 표시/숨김, 진열위치 설정 */
  upsert(data: StoreGameRequest) {
    return apiPost<ApiSuccessResponse>("/store-games", data);
  },

  /** 매장 게임 설정 삭제 */
  delete(storeId: number, gameId: number) {
    return apiDelete<ApiSuccessResponse>(`/store-games?storeId=${storeId}&gameId=${gameId}`);
  },
};

export const storeMenuApi = {
  /** 매장 메뉴 목록 (전체 메뉴 + 매장 설정 병합) */
  list(storeId: number) {
    return apiGet<unknown[]>("/store-menus", { params: { storeId } });
  },

  /** 매장 메뉴 가용성, 가격 오버라이드 */
  upsert(data: StoreMenuRequest) {
    return apiPost<ApiSuccessResponse>("/store-menus", data);
  },

  /** 매장 메뉴 설정 삭제 */
  delete(storeId: number, menuId: number) {
    return apiDelete<ApiSuccessResponse>(`/store-menus?storeId=${storeId}&menuId=${menuId}`);
  },
};

// ============================================
// 테이블 API (Admin)
// ============================================
export const tableApi = {
  /** 테이블 현황 조회 */
  list(storeId: number) {
    return apiGet<unknown[]>("/tables", { params: { storeId } });
  },
};

// ============================================
// 추천 카테고리 API (Admin)
// ============================================
export const recommendApi = {
  list() {
    return apiGet<unknown[]>("/recommend");
  },

  create(data: { title: string; subtitle?: string; emoji?: string; order?: number; gameIds?: number[] }) {
    return apiPost<unknown>("/recommend", data);
  },

  update(id: number, data: { title?: string; subtitle?: string; emoji?: string; order?: number; gameIds?: number[] }) {
    return apiPatch<unknown>(`/recommend/${id}`, data);
  },

  delete(id: number) {
    return apiDelete<ApiSuccessResponse>(`/recommend/${id}`);
  },
};

// ============================================
// 대시보드 API (Admin)
// ============================================
export const dashboardApi = {
  /** 매장 대시보드 */
  store(storeId: number) {
    return apiGet<unknown>("/dashboard/store", { params: { storeId } });
  },

  /** 본사 대시보드 */
  hq() {
    return apiGet<unknown>("/dashboard/hq");
  },
};
