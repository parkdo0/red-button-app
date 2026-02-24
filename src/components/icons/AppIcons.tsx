/**
 * 고객용 앱 SVG 아이콘
 * 이용 정보, 쿠폰 등 고객 페이지에서 사용
 */

/** Wi-Fi 아이콘 (이용 정보 카드) */
export function IconWifi({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

/** 이용 안내 아이콘 (책/가이드) */
export function IconGuide({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

/** 고객 의견 아이콘 (말풍선+펜) */
export function IconCustomerFeedback({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-primary">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

/** 시계 아이콘 (이용 시간, 모달 등) */
export function IconClock({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/** 축하/파티 아이콘 (쿠폰 등) */
export function IconCelebration({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.8 11.3L2 22l10.7-3.79" />
      <path d="M4 3h.01" />
      <path d="M22 8h.01" />
      <path d="M15 2h.01" />
      <path d="M22 20h.01" />
      <path d="M22 2l-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
      <path d="M22 13l-1.34-.45a2.9 2.9 0 0 0-3.12 1.96v0c-.34.86-1.32 1.3-2.18.96" />
    </svg>
  );
}

// ─── 게임 키트 아이콘 ───

/** 룰렛/슬롯머신 아이콘 (벌칙 룰렛) */
export function IconRoulette({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="3" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="21" />
      <line x1="3" y1="12" x2="8" y2="12" />
      <line x1="16" y1="12" x2="21" y2="12" />
      <line x1="5.64" y1="5.64" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="18.36" y2="18.36" />
      <path d="M12 1v0" stroke="white" strokeWidth="3" />
    </svg>
  );
}

/** 선 정하기 아이콘 (화살표+별) */
export function IconFirstPicker({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="white" fillOpacity="0.2" />
    </svg>
  );
}

/** 팀 정하기 아이콘 (미플 2개) */
export function IconTeamPicker({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>
      <circle cx="9" cy="7" r="3" fill="white" fillOpacity="0.2" />
      <path d="M9 13c-4 0-6 2-6 4v1h12v-1c0-2-2-4-6-4z" fill="white" fillOpacity="0.2" />
      <circle cx="17" cy="7" r="2.5" fill="white" fillOpacity="0.15" />
      <path d="M17 12c-2.5 0-4.5 1.5-4.5 3.5" />
      <path d="M22 17.5v-1c0-1.5-1.5-3-3.5-3.5" />
    </svg>
  );
}
