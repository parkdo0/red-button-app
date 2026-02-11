/**
 * 관리자 페이지 Mock 데이터
 * DB 연동 시 API 호출로 교체
 */

// ============================================
// 주문 관련
// ============================================

export type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "COMPLETED" | "CANCELLED";

export interface AdminOrderItem {
  menuName: string;
  quantity: number;
  subTotal: number;
  options: string[];
}

export interface AdminOrder {
  id: number;
  tableNumber: string;
  status: OrderStatus;
  totalPrice: number;
  orderedAt: string;
  items: AdminOrderItem[];
}

/** 상태 전이 규칙: 현재 상태 → 가능한 다음 상태 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "접수 대기",
  CONFIRMED: "접수 완료",
  PREPARING: "준비 중",
  COMPLETED: "완료",
  CANCELLED: "취소됨",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-badge/12 text-yellow-badge border-yellow-badge/30",
  CONFIRMED: "bg-blue-500/12 text-blue-400 border-blue-500/30",
  PREPARING: "bg-purple-500/12 text-purple-400 border-purple-500/30",
  COMPLETED: "bg-green-badge/12 text-green-badge border-green-badge/30",
  CANCELLED: "bg-red-primary/12 text-red-primary border-red-primary/30",
};

/** 다음 상태 버튼 텍스트 */
export const NEXT_ACTION_LABEL: Record<OrderStatus, string> = {
  PENDING: "접수 확인",
  CONFIRMED: "준비 시작",
  PREPARING: "완료 처리",
  COMPLETED: "",
  CANCELLED: "",
};

// ============================================
// 직원 호출 관련
// ============================================

export interface StaffCall {
  id: number;
  tableNumber: string;
  calledAt: string;
  acknowledged: boolean;       // 직원 확인 여부
  acknowledgedAt?: string;     // 확인 시각
}

// ============================================
// 테이블 관련
// ============================================

export interface TableInfo {
  number: string;
  zone: string;               // 구역 (A, B, C ...)
  isOccupied: boolean;
  startedAt?: string;          // 이용 시작 시간
  currentOrderCount: number;
  totalSpent: number;
}

// ============================================
// Mock 데이터
// ============================================

const now = Date.now();

export const MOCK_ADMIN_ORDERS: AdminOrder[] = [
  {
    id: 101,
    tableNumber: "A1",
    status: "PENDING",
    totalPrice: 17400,
    orderedAt: new Date(now - 2 * 60 * 1000).toISOString(), // 2분 전
    items: [
      { menuName: "로제 떡볶이", quantity: 1, subTotal: 10400, options: ["매운맛", "치즈 추가"] },
      { menuName: "콜라", quantity: 2, subTotal: 5000, options: [] },
      { menuName: "사이다", quantity: 1, subTotal: 2000, options: [] },
    ],
  },
  {
    id: 102,
    tableNumber: "B3",
    status: "PENDING",
    totalPrice: 12500,
    orderedAt: new Date(now - 5 * 60 * 1000).toISOString(), // 5분 전
    items: [
      { menuName: "감자튀김", quantity: 2, subTotal: 9000, options: [] },
      { menuName: "아메리카노", quantity: 1, subTotal: 3500, options: ["아이스"] },
    ],
  },
  {
    id: 103,
    tableNumber: "A4",
    status: "CONFIRMED",
    totalPrice: 8900,
    orderedAt: new Date(now - 8 * 60 * 1000).toISOString(),
    items: [
      { menuName: "로제 떡볶이", quantity: 1, subTotal: 8900, options: ["순한맛"] },
    ],
  },
  {
    id: 104,
    tableNumber: "C2",
    status: "PREPARING",
    totalPrice: 21400,
    orderedAt: new Date(now - 15 * 60 * 1000).toISOString(),
    items: [
      { menuName: "치즈볼", quantity: 2, subTotal: 7000, options: [] },
      { menuName: "로제 떡볶이", quantity: 1, subTotal: 10400, options: ["매운맛", "치즈 추가"] },
      { menuName: "콜라", quantity: 2, subTotal: 4000, options: [] },
    ],
  },
  {
    id: 105,
    tableNumber: "B1",
    status: "COMPLETED",
    totalPrice: 9500,
    orderedAt: new Date(now - 40 * 60 * 1000).toISOString(),
    items: [
      { menuName: "감자튀김", quantity: 1, subTotal: 6000, options: ["라지"] },
      { menuName: "아메리카노", quantity: 1, subTotal: 3500, options: [] },
    ],
  },
  {
    id: 106,
    tableNumber: "A2",
    status: "COMPLETED",
    totalPrice: 15000,
    orderedAt: new Date(now - 55 * 60 * 1000).toISOString(),
    items: [
      { menuName: "떡볶이 세트", quantity: 1, subTotal: 12500, options: [] },
      { menuName: "사이다", quantity: 1, subTotal: 2500, options: [] },
    ],
  },
];

export const MOCK_STAFF_CALLS: StaffCall[] = [
  {
    id: 1,
    tableNumber: "A1",
    calledAt: new Date(now - 1 * 60 * 1000).toISOString(), // 1분 전
    acknowledged: false,
  },
  {
    id: 2,
    tableNumber: "C2",
    calledAt: new Date(now - 3 * 60 * 1000).toISOString(), // 3분 전
    acknowledged: false,
  },
  {
    id: 3,
    tableNumber: "B1",
    calledAt: new Date(now - 12 * 60 * 1000).toISOString(), // 12분 전
    acknowledged: true,
    acknowledgedAt: new Date(now - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    tableNumber: "A4",
    calledAt: new Date(now - 30 * 60 * 1000).toISOString(),
    acknowledged: true,
    acknowledgedAt: new Date(now - 28 * 60 * 1000).toISOString(),
  },
];

export const MOCK_TABLES: TableInfo[] = [
  { number: "A1", zone: "A", isOccupied: true, startedAt: new Date(now - 65 * 60 * 1000).toISOString(), currentOrderCount: 2, totalSpent: 26900 },
  { number: "A2", zone: "A", isOccupied: true, startedAt: new Date(now - 90 * 60 * 1000).toISOString(), currentOrderCount: 1, totalSpent: 15000 },
  { number: "A3", zone: "A", isOccupied: false, currentOrderCount: 0, totalSpent: 0 },
  { number: "A4", zone: "A", isOccupied: true, startedAt: new Date(now - 30 * 60 * 1000).toISOString(), currentOrderCount: 1, totalSpent: 8900 },
  { number: "B1", zone: "B", isOccupied: true, startedAt: new Date(now - 50 * 60 * 1000).toISOString(), currentOrderCount: 1, totalSpent: 9500 },
  { number: "B2", zone: "B", isOccupied: false, currentOrderCount: 0, totalSpent: 0 },
  { number: "B3", zone: "B", isOccupied: true, startedAt: new Date(now - 20 * 60 * 1000).toISOString(), currentOrderCount: 1, totalSpent: 12500 },
  { number: "B4", zone: "B", isOccupied: false, currentOrderCount: 0, totalSpent: 0 },
  { number: "C1", zone: "C", isOccupied: false, currentOrderCount: 0, totalSpent: 0 },
  { number: "C2", zone: "C", isOccupied: true, startedAt: new Date(now - 45 * 60 * 1000).toISOString(), currentOrderCount: 1, totalSpent: 21400 },
  { number: "C3", zone: "C", isOccupied: false, currentOrderCount: 0, totalSpent: 0 },
  { number: "C4", zone: "C", isOccupied: false, currentOrderCount: 0, totalSpent: 0 },
];

// ============================================
// 유틸 함수
// ============================================

/** 경과 시간 포맷 (예: "2분 전", "1시간 전") */
export function timeAgo(isoStr: string): string {
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

/** 시:분 포맷 */
export function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}
