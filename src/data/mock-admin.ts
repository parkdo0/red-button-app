/**
 * 관리자 시스템 Mock 데이터
 * 본사(HQ) + 매장(Store) 2계층 구조
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
// 매장 목록
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

export const MOCK_STORES: StoreInfo[] = [
  { id: 1, name: "수원점", address: "경기도 수원시 팔달구 인계로 123", phone: "031-123-4567", isActive: true, tableCount: 35, gameCount: 42, todayOrders: 28, todayRevenue: 456000 },
  { id: 2, name: "강남점", address: "서울특별시 강남구 테헤란로 456", phone: "02-234-5678", isActive: true, tableCount: 40, gameCount: 50, todayOrders: 45, todayRevenue: 780000 },
  { id: 3, name: "홍대점", address: "서울특별시 마포구 와우산로 789", phone: "02-345-6789", isActive: true, tableCount: 30, gameCount: 38, todayOrders: 35, todayRevenue: 620000 },
  { id: 4, name: "부산서면점", address: "부산광역시 부산진구 서면로 321", phone: "051-456-7890", isActive: false, tableCount: 25, gameCount: 30, todayOrders: 0, todayRevenue: 0 },
];

// ============================================
// 매장별 게임 보유 현황
// ============================================
export interface StoreGameEntry {
  storeId: number;
  gameId: number;
  gameTitle: string;
  isVisible: boolean;
  shelfLocation: string | null; // null이면 마스터 기본값
  masterShelfLoc: string;       // 본사 기본 진열 위치
}

/** 수원점 게임 보유 현황 (20개 중 15개 보유) */
export const MOCK_STORE_GAMES: StoreGameEntry[] = [
  { storeId: 1, gameId: 1,  gameTitle: "라스베가스",  isVisible: true,  shelfLocation: null,    masterShelfLoc: "ㄱㄴㄷ-3" },
  { storeId: 1, gameId: 2,  gameTitle: "금지어 게임", isVisible: true,  shelfLocation: null,    masterShelfLoc: "ㄱㄴㄷ-5" },
  { storeId: 1, gameId: 3,  gameTitle: "루미큐브",    isVisible: true,  shelfLocation: null,    masterShelfLoc: "ㄱㄴㄷ-1" },
  { storeId: 1, gameId: 4,  gameTitle: "도미니언",    isVisible: true,  shelfLocation: "ㅁ-2",  masterShelfLoc: "ㄴㄷㄹ-2" },
  { storeId: 1, gameId: 7,  gameTitle: "스트라이크",  isVisible: true,  shelfLocation: null,    masterShelfLoc: "ㅁㅂㅅ-1" },
  { storeId: 1, gameId: 8,  gameTitle: "꼬꼬미노",   isVisible: true,  shelfLocation: null,    masterShelfLoc: "ㄱㄴㄷ-6" },
  { storeId: 1, gameId: 9,  gameTitle: "꼬치의 달인", isVisible: true,  shelfLocation: null,    masterShelfLoc: "ㄱㄴㄷ-6" },
  { storeId: 1, gameId: 10, gameTitle: "꿈의 대화",   isVisible: false, shelfLocation: null,    masterShelfLoc: "ㅁㅂㅅ-3" },
  { storeId: 1, gameId: 12, gameTitle: "텔레스트레이션", isVisible: true, shelfLocation: null,  masterShelfLoc: "ㅇㅈㅊ-1" },
  { storeId: 1, gameId: 13, gameTitle: "코드네임",    isVisible: true,  shelfLocation: null,    masterShelfLoc: "ㅇㅈㅊ-2" },
  { storeId: 1, gameId: 14, gameTitle: "스플렌더",    isVisible: true,  shelfLocation: null,    masterShelfLoc: "ㅇㅈㅊ-5" },
  { storeId: 1, gameId: 16, gameTitle: "라이헌트",    isVisible: true,  shelfLocation: null,    masterShelfLoc: "ㅁㅂㅅ-6" },
  { storeId: 1, gameId: 18, gameTitle: "카탄",        isVisible: true,  shelfLocation: null,    masterShelfLoc: "ㅋㅌㅍ-3" },
  { storeId: 1, gameId: 19, gameTitle: "카멜업",      isVisible: true,  shelfLocation: null,    masterShelfLoc: "ㅁㅂㅅ-2" },
  { storeId: 1, gameId: 20, gameTitle: "러브레터",    isVisible: true,  shelfLocation: null,    masterShelfLoc: "ㅇㅈㅊ-3" },
];

// ============================================
// 주문 관리 (매장용) - 실시간 스타일
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

export const MOCK_ADMIN_ORDERS: AdminOrder[] = [
  {
    id: 127, tableNo: "31", status: "PENDING", totalPrice: 14500,
    orderedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    items: [
      { menuName: "마라떡볶이", quantity: 1, subTotal: 9500, options: ["매운맛"] },
      { menuName: "콜라", quantity: 2, subTotal: 5000, options: [] },
    ],
  },
  {
    id: 126, tableNo: "15", status: "PENDING", totalPrice: 23800,
    orderedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    items: [
      { menuName: "크리스피 콜팝", quantity: 3, subTotal: 19500, options: [] },
      { menuName: "제로 복숭아 아이스티", quantity: 1, subTotal: 4300, options: [] },
    ],
  },
  {
    id: 125, tableNo: "7", status: "PREPARING", totalPrice: 9500,
    orderedAt: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
    items: [
      { menuName: "피자떡볶이", quantity: 1, subTotal: 9500, options: [] },
    ],
  },
  {
    id: 124, tableNo: "22", status: "PREPARING", totalPrice: 18000,
    orderedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    items: [
      { menuName: "마라떡볶이", quantity: 1, subTotal: 9500, options: ["보통맛"] },
      { menuName: "감자튀김", quantity: 1, subTotal: 6000, options: ["라지"] },
      { menuName: "콜라", quantity: 1, subTotal: 2500, options: [] },
    ],
  },
  {
    id: 123, tableNo: "3", status: "CONFIRMED", totalPrice: 11000,
    orderedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    items: [
      { menuName: "치즈볼", quantity: 2, subTotal: 11000, options: [] },
    ],
  },
  {
    id: 122, tableNo: "18", status: "COMPLETED", totalPrice: 8000,
    orderedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    items: [
      { menuName: "아메리카노", quantity: 1, subTotal: 3500, options: [] },
      { menuName: "자몽에이드", quantity: 1, subTotal: 4500, options: [] },
    ],
  },
  {
    id: 121, tableNo: "11", status: "COMPLETED", totalPrice: 15500,
    orderedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    items: [
      { menuName: "마라떡볶이", quantity: 1, subTotal: 9500, options: ["순한맛"] },
      { menuName: "크리스피 콜팝", quantity: 1, subTotal: 6000, options: [] },
    ],
  },
];

// ============================================
// 테이블 현황 (매장용)
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

export const MOCK_TABLE_STATUS: TableStatus[] = Array.from({ length: 35 }, (_, i) => {
  const tableNo = String(i + 1);
  const isOccupied = [1, 3, 7, 11, 15, 18, 22, 25, 28, 31].includes(i + 1);
  const elapsed = isOccupied ? Math.floor(Math.random() * 120) + 10 : null;
  return {
    id: i + 1,
    tableNo,
    seats: i % 5 === 0 ? 6 : 4,
    status: isOccupied ? "occupied" as const : "empty" as const,
    guestCount: isOccupied ? Math.floor(Math.random() * 4) + 2 : null,
    checkInAt: isOccupied ? new Date(Date.now() - (elapsed ?? 0) * 60 * 1000).toISOString() : null,
    elapsedMinutes: elapsed,
  };
});

// ============================================
// 유틸
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
