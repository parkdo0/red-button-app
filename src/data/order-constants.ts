/**
 * 주문 관련 상수, 타입 정의
 * mock-orders.ts에서 순수 상수/타입만 분리 (MOCK 데이터 없음)
 */

export interface OrderHistoryItem {
  menuName: string;
  basePrice: number;
  quantity: number;
  subTotal: number;
  options: { optionName: string; extraPrice: number }[];
}

export interface OrderHistory {
  id: number;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "COMPLETED" | "CANCELLED";
  totalPrice: number;
  orderedAt: string;
  items: OrderHistoryItem[];
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "접수 대기",
  CONFIRMED: "접수 완료",
  PREPARING: "준비 중",
  COMPLETED: "완료",
  CANCELLED: "취소됨",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-badge/12 text-yellow-badge",
  CONFIRMED: "bg-blue-500/12 text-blue-400",
  PREPARING: "bg-purple-500/12 text-purple-400",
  COMPLETED: "bg-green-badge/12 text-green-badge",
  CANCELLED: "bg-red-primary/12 text-red-primary",
};
