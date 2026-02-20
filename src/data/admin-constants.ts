/**
 * 관리자 시스템 상수, 타입 정의
 * mock-admin.ts에서 순수 상수/타입만 분리 (MOCK 데이터 없음)
 */

// ============================================
// 관리자 계정
// ============================================
export type AdminRole = "HQ_ADMIN" | "STORE_MANAGER" | "STORE_STAFF";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: AdminRole;
  storeId: number | null;
  storeName: string | null;
}

/** 임시 관리자 정보 (인증 구현 전) */
export const CURRENT_ADMIN: AdminUser = {
  id: 1,
  email: "admin@redbutton.co.kr",
  name: "김본사",
  role: "HQ_ADMIN",
  storeId: null,
  storeName: null,
};

export const CURRENT_STORE_ADMIN: AdminUser = {
  id: 2,
  email: "suwon@redbutton.co.kr",
  name: "이수원",
  role: "STORE_MANAGER",
  storeId: 1,
  storeName: "수원점",
};

// ============================================
// 매장 타입
// ============================================
export interface StoreInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  tableCount: number;
  gameCount: number;
  todayOrders: number;
  todayRevenue: number;
}

// ============================================
// 매장별 게임 보유 현황 타입
// ============================================
export interface StoreGameEntry {
  storeId: number;
  gameId: number;
  gameTitle: string;
  isVisible: boolean;
  shelfLocation: string | null;
  masterShelfLoc: string;
}

// ============================================
// 주문 관리 타입
// ============================================
export interface AdminOrderItem {
  menuName: string;
  quantity: number;
  subTotal: number;
  options: string[];
}

export interface AdminOrder {
  id: number;
  tableNo: string;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "COMPLETED" | "CANCELLED";
  totalPrice: number;
  orderedAt: string;
  items: AdminOrderItem[];
}

// ============================================
// 테이블 현황 타입
// ============================================
export interface TableStatus {
  id: number;
  tableNo: string;
  seats: number;
  status: "empty" | "occupied" | "reserved";
  guestCount: number | null;
  checkInAt: string | null;
  elapsedMinutes: number | null;
}

// ============================================
// 상수
// ============================================

export const ORDER_STATUS_FLOW: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const ADMIN_ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "신규 주문",
  CONFIRMED: "접수 완료",
  PREPARING: "준비 중",
  COMPLETED: "완료",
  CANCELLED: "취소됨",
};

export const ADMIN_ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-700 border-orange-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  PREPARING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
};
