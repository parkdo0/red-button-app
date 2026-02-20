/**
 * API 응답/요청 공통 타입
 */

// ============================================
// 공통
// ============================================

export interface ApiError {
  error: string;
}

export interface ApiSuccessResponse {
  success: true;
  message?: string;
}

// ============================================
// 게임 관련
// ============================================

export type Difficulty = "VERY_EASY" | "EASY" | "NORMAL" | "SEMI_HARD" | "HARD" | "EXTREME";

export interface GameTagResponse {
  group: string;
  value: string;
}

export interface GameListItem {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  minPlayers: number;
  maxPlayers: number;
  recommendedPlayers: string;
  playTime: number | null;
  playTimeCategory: string;
  difficulty: Difficulty;
  shelfLocation: string;
  hashtags: string[];
  tags: GameTagResponse[];
}

export interface GameDetailResponse extends GameListItem {
  similarGames: {
    id: number;
    title: string;
    minPlayers: number;
    maxPlayers: number;
    difficulty: Difficulty;
    thumbnailUrl: string;
    tags: GameTagResponse[];
  }[];
}

export interface CreateGameRequest {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  minPlayers: number;
  maxPlayers: number;
  recommendedPlayers: string;
  playTime?: number;
  playTimeCategory?: string;
  difficulty: Difficulty;
  defaultShelfLoc?: string;
  tagIds?: number[];
  hashtags?: string[];
}

export interface UpdateGameRequest extends Partial<CreateGameRequest> {}

// ============================================
// 메뉴 관련
// ============================================

export interface MenuOptionResponse {
  id: number;
  name: string;
  extraPrice: number;
  isAvailable: boolean;
}

export interface MenuOptionGroupResponse {
  id: number;
  name: string;
  isRequired: boolean;
  maxSelect: number;
  options: MenuOptionResponse[];
}

export interface MenuItemResponse {
  id: number;
  categoryName: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  isActive: boolean;
  isNew: boolean;
  isBest: boolean;
  optionGroups: MenuOptionGroupResponse[];
}

export interface CreateMenuRequest {
  categoryId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
  isNew?: boolean;
  isBest?: boolean;
}

export interface UpdateMenuRequest extends Partial<CreateMenuRequest> {
  isActive?: boolean;
  displayOrder?: number;
}

// ============================================
// 주문 관련
// ============================================

export type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "COMPLETED" | "CANCELLED";

export interface CreateOrderItemRequest {
  menuId: number;
  quantity: number;
  selectedOptionIds: number[];
}

export interface CreateOrderRequest {
  storeId: number;
  tableId: number;
  memo?: string;
  items: CreateOrderItemRequest[];
}

export interface UpdateOrderRequest {
  status: OrderStatus;
}

export interface OrderItemResponse {
  id: number;
  menuName: string;
  basePrice: number;
  quantity: number;
  subTotal: number;
  options: { optionName: string; extraPrice: number }[];
}

export interface OrderResponse {
  id: number;
  storeId: number;
  tableId: number;
  status: OrderStatus;
  totalPrice: number;
  memo: string | null;
  orderedAt: string;
  items: OrderItemResponse[];
}

// ============================================
// 채팅 관련
// ============================================

export type ChatSender = "CUSTOMER" | "STAFF";

export interface ChatMessageResponse {
  id: number;
  storeId: number;
  tableNo: string;
  sender: ChatSender;
  message: string;
  createdAt: string;
}

export interface SendChatRequest {
  storeId: number;
  tableNo: string;
  sender: ChatSender;
  message: string;
}

// ============================================
// 세션 관련
// ============================================

export interface SessionResponse {
  id: number;
  storeId: number;
  tableId: number;
  checkInAt: string;
  checkOutAt: string | null;
  guestCount: number;
}

export interface CheckInRequest {
  storeId: number;
  tableId: number;
  guestCount?: number;
}

// ============================================
// 태그 관련
// ============================================

export interface TagResponse {
  id: number;
  group: string;
  value: string;
  displayOrder: number;
}

export interface CreateTagRequest {
  group: string;
  value: string;
  displayOrder?: number;
}

// ============================================
// 매장 관련
// ============================================

export interface StoreResponse {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  wifiId: string | null;
  wifiPw: string | null;
  openTime: string | null;
  closeTime: string | null;
  isActive: boolean;
}

export interface UpdateStoreRequest {
  name?: string;
  address?: string;
  phone?: string;
  wifiId?: string;
  wifiPw?: string;
  openTime?: string;
  closeTime?: string;
  isActive?: boolean;
}

// ============================================
// 이벤트 관련
// ============================================

export interface EventResponse {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  order: number;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  order?: number;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  isActive?: boolean;
}

// ============================================
// 매장별 설정 관련
// ============================================

export interface StoreGameRequest {
  gameId: number;
  storeId: number;
  isVisible?: boolean;
  shelfLocation?: string;
}

export interface StoreMenuRequest {
  menuId: number;
  storeId: number;
  isAvailable?: boolean;
  priceOverride?: number;
}
