/**
 * 주문 내역 Mock 데이터
 * DB 연동 시 GET /api/orders 호출로 교체
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
  orderedAt: string; // ISO date string
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
  PENDING: "bg-yellow-600/20 text-yellow-400",
  CONFIRMED: "bg-blue-600/20 text-blue-400",
  PREPARING: "bg-purple-600/20 text-purple-400",
  COMPLETED: "bg-green-600/20 text-green-400",
  CANCELLED: "bg-red-600/20 text-red-400",
};

export const MOCK_ORDERS: OrderHistory[] = [
  {
    id: 1,
    status: "PREPARING",
    totalPrice: 17400,
    orderedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10분 전
    items: [
      {
        menuName: "로제 떡볶이",
        basePrice: 8900,
        quantity: 1,
        subTotal: 10400,
        options: [
          { optionName: "매운맛", extraPrice: 0 },
          { optionName: "치즈", extraPrice: 1500 },
        ],
      },
      {
        menuName: "콜라",
        basePrice: 2500,
        quantity: 2,
        subTotal: 5000,
        options: [],
      },
      {
        menuName: "사이다",
        basePrice: 2000,
        quantity: 1,
        subTotal: 2000,
        options: [],
      },
    ],
  },
  {
    id: 2,
    status: "COMPLETED",
    totalPrice: 9500,
    orderedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45분 전
    items: [
      {
        menuName: "감자튀김",
        basePrice: 4500,
        quantity: 1,
        subTotal: 6000,
        options: [
          { optionName: "라지", extraPrice: 1500 },
        ],
      },
      {
        menuName: "아메리카노",
        basePrice: 3500,
        quantity: 1,
        subTotal: 3500,
        options: [],
      },
    ],
  },
];
