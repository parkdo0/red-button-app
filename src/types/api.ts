/**
 * API 응답/요청 공통 타입
 * Mock → DB 전환 시 API 응답 타입으로 활용
 */

// ============================================
// 게임 관련
// ============================================

export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

export interface GameTagResponse {
  group: string;
  value: string;
}

export interface GameListItem {
  id: number;
  categoryName: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  minPlayers: number;
  maxPlayers: number;
  playTime: number | null;
  difficulty: Difficulty;
  tags: GameTagResponse[];
}

export interface SimilarGame {
  id: number;
  title: string;
  categoryName: string;
  minPlayers: number;
  maxPlayers: number;
  difficulty: Difficulty;
  thumbnailUrl: string;
}

export interface GameDetailResponse extends GameListItem {
  similarGames: SimilarGame[];
}

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
  isAvailable: boolean;
  optionGroups: MenuOptionGroupResponse[];
}

// ============================================
// 주문 관련
// ============================================

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "COMPLETED"
  | "CANCELLED";

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

export interface OrderItemOptionResponse {
  optionName: string;
  extraPrice: number;
}

export interface OrderItemResponse {
  menuName: string;
  basePrice: number;
  quantity: number;
  subTotal: number;
  options: OrderItemOptionResponse[];
}

export interface OrderResponse {
  id: number;
  status: OrderStatus;
  totalPrice: number;
  orderedAt: string;
  items: OrderItemResponse[];
}

// ============================================
// API 에러
// ============================================

export interface ApiError {
  error: string;
}
