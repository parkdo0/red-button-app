/**
 * 관리자 사이드바 네비게이션 SVG 아이콘
 * Lucide 스타일, 16x16, currentColor 사용
 */
import type { ReactNode } from "react";

const s = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

// ─── 본사 (HQ) ───

/** 대시보드 — 격자 차트 */
export function IconDashboard() {
  return (
    <svg {...s}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="4" rx="1" />
      <rect x="14" y="11" width="7" height="10" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

/** 게임 관리 — 게임패드 */
export function IconGames() {
  return (
    <svg {...s}>
      <rect x="2" y="6" width="20" height="12" rx="3" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="6" y1="12" x2="10" y2="12" />
      <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** 메뉴 관리 — 접시+포크 */
export function IconMenus() {
  return (
    <svg {...s}>
      <circle cx="12" cy="13" r="8" />
      <circle cx="12" cy="13" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <path d="M4.93 4.93l2.12 2.12" />
      <path d="M19.07 4.93l-2.12 2.12" />
    </svg>
  );
}

/** 추천 편성 — 별 */
export function IconStar() {
  return (
    <svg {...s}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/** 이벤트 관리 — 메가폰 */
export function IconEvents() {
  return (
    <svg {...s}>
      <path d="M3 11l18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

/** 매장 현황 — 건물 */
export function IconStores() {
  return (
    <svg {...s}>
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V11l-6-4" />
      <path d="M9 9h1" />
      <path d="M9 13h1" />
      <path d="M9 17h1" />
    </svg>
  );
}

/** 태그 관리 — 태그 */
export function IconTags() {
  return (
    <svg {...s}>
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** 쿠폰 관리 — 티켓 */
export function IconCoupons() {
  return (
    <svg {...s}>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
      <line x1="13" y1="5" x2="13" y2="9" strokeDasharray="2 2" />
      <line x1="13" y1="15" x2="13" y2="19" strokeDasharray="2 2" />
    </svg>
  );
}

/** 고객 의견 — 메일함 */
export function IconFeedback() {
  return (
    <svg {...s}>
      <path d="M22 12h-6l-2 3H10l-2-3H2" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

// ─── 매장 (Store) ───

/** 주문 관리 — 클립보드 */
export function IconOrders() {
  return (
    <svg {...s}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

/** 테이블 현황 — 그리드/테이블 */
export function IconTables() {
  return (
    <svg {...s}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

/** 카운터 쪽지 — 채팅 */
export function IconChat() {
  return (
    <svg {...s}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="13" y2="13" />
    </svg>
  );
}

/** 매장 설정 — 기어 */
export function IconSettings() {
  return (
    <svg {...s}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// ─── 공통 / 기타 ───

/** 매장 선택 안내 — 매장 아이콘 */
export function IconStorefront() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V11l-6-4" />
      <path d="M9 9h1" />
      <path d="M9 13h1" />
      <path d="M9 17h1" />
    </svg>
  );
}

/**
 * 아이콘 맵 — NavItemDef에서 key로 참조
 */
export const NAV_ICONS: Record<string, ReactNode> = {
  dashboard: <IconDashboard />,
  games: <IconGames />,
  menus: <IconMenus />,
  star: <IconStar />,
  events: <IconEvents />,
  stores: <IconStores />,
  tags: <IconTags />,
  coupons: <IconCoupons />,
  feedback: <IconFeedback />,
  orders: <IconOrders />,
  tables: <IconTables />,
  chat: <IconChat />,
  settings: <IconSettings />,
};
