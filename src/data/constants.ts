/**
 * 공용 상수, 타입 정의, 유틸리티
 * mock.ts에서 순수 상수/타입만 분리 (MOCK 데이터 없음)
 */

// ============================================
// 게임 관련 타입 + 상수
// ============================================

/** 난이도 6단계 (실제 앱 기준) */
export type Difficulty = "VERY_EASY" | "EASY" | "NORMAL" | "SEMI_HARD" | "HARD" | "EXTREME";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  VERY_EASY: "Very Easy",
  EASY: "Easy",
  NORMAL: "Normal",
  SEMI_HARD: "Semi-Hard",
  HARD: "Hard",
  EXTREME: "Extreme",
};

export interface GameTag {
  group: string;
  value: string;
}

export interface Game {
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
  tags: GameTag[];
}

export interface GameCategory {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  games: Game[];
}

// ─────────────────────────────────────
// 필터 옵션 (실제 앱 기준)
// ─────────────────────────────────────
export const FILTER_OPTIONS = {
  genre: [
    "초보", "중수", "고수", "커플", "단체", "패밀리", "어린이", "전략",
    "손기술/순발력", "추리/방탈출", "주사위/운빨", "심리/눈치", "마피아",
    "협상/거래", "협동/팀전", "복불복/내기", "예능/퀴즈", "대화", "베팅", "머더미스테리",
  ],
  playerCount: ["2인", "3인", "4인", "5인", "6인", "7인", "8인 이상"],
  difficulty: ["VERY_EASY", "EASY", "NORMAL", "SEMI_HARD", "HARD", "EXTREME"] as Difficulty[],
  playTime: ["15분 이내", "15-30분", "30-60분", "60분 이상"],
} as const;

// ============================================
// F&B 메뉴 관련 타입 + 상수
// ============================================

export interface MenuOption {
  id: number;
  name: string;
  extraPrice: number;
  isAvailable: boolean;
}

export interface MenuOptionGroup {
  id: number;
  name: string;
  isRequired: boolean;
  maxSelect: number;
  options: MenuOption[];
}

export interface MenuItem {
  id: number;
  categoryName: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  isAvailable: boolean;
  isNew: boolean;
  isBest: boolean;
  optionGroups: MenuOptionGroup[];
}

/** 실제 앱 기준 F&B 카테고리 탭 */
export const FOOD_CATEGORIES = ["NEW", "BEST", "음료", "푸드", "벌칙메뉴", "MD상품"] as const;

// ============================================
// 유틸리티
// ============================================

/** 가격 포맷 (e.g. 8,900원) */
export function formatPrice(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}
