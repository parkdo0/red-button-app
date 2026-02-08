/**
 * Mock 데이터 (DB 연결 전 UI 개발용)
 * DB 연동 시 API 호출로 교체 예정
 */

// ============================================
// 게임 관련
// ============================================

export interface GameTag {
  group: string;  // "player_count" | "genre" | "theme"
  value: string;
}

export interface Game {
  id: number;
  categoryName: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  minPlayers: number;
  maxPlayers: number;
  playTime: number | null;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  tags: GameTag[];
}

export const MOCK_GAMES: Game[] = [
  {
    id: 1, categoryName: "전략", title: "카탄",
    description: "자원을 모으고 교역하며 카탄 섬을 개척하는 전략 보드게임. 주사위를 굴려 자원을 얻고, 도로와 마을을 건설하여 승리 포인트를 획득합니다.",
    thumbnailUrl: "/images/games/catan.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_catan",
    minPlayers: 3, maxPlayers: 4, playTime: 75, difficulty: "MEDIUM",
    tags: [{ group: "player_count", value: "3~4인" }, { group: "genre", value: "전략" }, { group: "theme", value: "중세" }],
  },
  {
    id: 2, categoryName: "전략", title: "스플렌더",
    description: "보석 토큰을 수집하고 발전 카드를 구매하여 점수를 모으는 엔진 빌딩 게임.",
    thumbnailUrl: "/images/games/splendor.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_splendor",
    minPlayers: 2, maxPlayers: 4, playTime: 30, difficulty: "EASY",
    tags: [{ group: "player_count", value: "2인" }, { group: "player_count", value: "3~4인" }, { group: "genre", value: "전략" }],
  },
  {
    id: 3, categoryName: "추리", title: "클루",
    description: "살인 사건의 범인, 흉기, 장소를 추리하는 고전 보드게임.",
    thumbnailUrl: "/images/games/clue.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_clue",
    minPlayers: 3, maxPlayers: 6, playTime: 45, difficulty: "EASY",
    tags: [{ group: "player_count", value: "3~4인" }, { group: "player_count", value: "5인 이상" }, { group: "genre", value: "추리" }],
  },
  {
    id: 4, categoryName: "추리", title: "디셉션: 홍콩 살인사건",
    description: "법의학자의 힌트를 통해 살인범을 찾아내는 정체 숨김 추리 게임.",
    thumbnailUrl: "/images/games/deception.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_deception",
    minPlayers: 4, maxPlayers: 12, playTime: 20, difficulty: "MEDIUM",
    tags: [{ group: "player_count", value: "3~4인" }, { group: "player_count", value: "5인 이상" }, { group: "genre", value: "추리" }, { group: "genre", value: "블러핑" }],
  },
  {
    id: 5, categoryName: "파티", title: "텔레스트레이션",
    description: "그림과 단어를 번갈아 전달하며 벌어지는 유쾌한 파티 게임.",
    thumbnailUrl: "/images/games/telestrations.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_telestrations",
    minPlayers: 4, maxPlayers: 8, playTime: 30, difficulty: "EASY",
    tags: [{ group: "player_count", value: "3~4인" }, { group: "player_count", value: "5인 이상" }, { group: "genre", value: "파티" }, { group: "theme", value: "일상" }],
  },
  {
    id: 6, categoryName: "파티", title: "코드네임",
    description: "팀 대결로 스파이마스터의 힌트를 통해 코드명을 맞추는 단어 게임.",
    thumbnailUrl: "/images/games/codenames.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_codenames",
    minPlayers: 4, maxPlayers: 8, playTime: 15, difficulty: "EASY",
    tags: [{ group: "player_count", value: "3~4인" }, { group: "player_count", value: "5인 이상" }, { group: "genre", value: "파티" }],
  },
  {
    id: 7, categoryName: "협동", title: "팬데믹",
    description: "전 세계에 퍼지는 전염병을 막기 위해 팀원이 협력하는 협동 게임.",
    thumbnailUrl: "/images/games/pandemic.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_pandemic",
    minPlayers: 2, maxPlayers: 4, playTime: 45, difficulty: "MEDIUM",
    tags: [{ group: "player_count", value: "2인" }, { group: "player_count", value: "3~4인" }, { group: "genre", value: "협동" }, { group: "genre", value: "전략" }],
  },
  {
    id: 8, categoryName: "카드", title: "러브레터",
    description: "단 16장의 카드로 펼치는 심리전. 공주에게 편지를 전달하라!",
    thumbnailUrl: "/images/games/loveletter.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_loveletter",
    minPlayers: 2, maxPlayers: 4, playTime: 20, difficulty: "EASY",
    tags: [{ group: "player_count", value: "2인" }, { group: "player_count", value: "3~4인" }, { group: "genre", value: "블러핑" }, { group: "theme", value: "중세" }],
  },
];

/** 필터 옵션 (사이드바 UI용) */
export const FILTER_OPTIONS = {
  player_count: ["2인", "3~4인", "5인 이상"],
  genre: ["전략", "추리", "파티", "블러핑", "협동"],
  difficulty: ["EASY", "MEDIUM", "HARD", "EXPERT"],
} as const;

/** 난이도 한글 라벨 */
export const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: "쉬움",
  MEDIUM: "보통",
  HARD: "어려움",
  EXPERT: "전문가",
};

/** 카테고리별 게임 그룹핑 (넷플릭스 스타일 행 구성용) */
export function getGamesByCategory(): { category: string; games: Game[] }[] {
  const categoryMap = new Map<string, Game[]>();
  for (const game of MOCK_GAMES) {
    const list = categoryMap.get(game.categoryName) ?? [];
    list.push(game);
    categoryMap.set(game.categoryName, list);
  }
  return Array.from(categoryMap.entries()).map(([category, games]) => ({
    category,
    games,
  }));
}

// ============================================
// F&B 메뉴 관련
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
  optionGroups: MenuOptionGroup[];
}

export const FOOD_CATEGORIES = ["떡볶이", "스낵", "음료"] as const;

export const MOCK_MENUS: MenuItem[] = [
  // 떡볶이
  {
    id: 1, categoryName: "떡볶이", name: "로제 떡볶이",
    description: "부드러운 크림 로제 소스에 쫄깃한 떡볶이",
    imageUrl: "/images/menu/rose-tteok.jpg", basePrice: 8900, isAvailable: true,
    optionGroups: [
      {
        id: 1, name: "맛 선택", isRequired: true, maxSelect: 1,
        options: [
          { id: 1, name: "순한맛", extraPrice: 0, isAvailable: true },
          { id: 2, name: "보통맛", extraPrice: 0, isAvailable: true },
          { id: 3, name: "매운맛", extraPrice: 0, isAvailable: true },
        ],
      },
      {
        id: 2, name: "토핑 추가", isRequired: false, maxSelect: 3,
        options: [
          { id: 4, name: "치즈", extraPrice: 1500, isAvailable: true },
          { id: 5, name: "베이컨", extraPrice: 2000, isAvailable: true },
          { id: 6, name: "떡 추가", extraPrice: 1000, isAvailable: true },
        ],
      },
    ],
  },
  {
    id: 2, categoryName: "떡볶이", name: "오리지널 떡볶이",
    description: "매콤달콤한 전통 떡볶이",
    imageUrl: "/images/menu/original-tteok.jpg", basePrice: 7500, isAvailable: true,
    optionGroups: [
      {
        id: 3, name: "맛 선택", isRequired: true, maxSelect: 1,
        options: [
          { id: 7, name: "보통맛", extraPrice: 0, isAvailable: true },
          { id: 8, name: "매운맛", extraPrice: 0, isAvailable: true },
          { id: 9, name: "극매운맛", extraPrice: 500, isAvailable: true },
        ],
      },
    ],
  },
  // 스낵
  {
    id: 3, categoryName: "스낵", name: "치즈볼",
    description: "겉바속촉 모짜렐라 치즈볼 6개",
    imageUrl: "/images/menu/cheese-ball.jpg", basePrice: 5500, isAvailable: true,
    optionGroups: [],
  },
  {
    id: 4, categoryName: "스낵", name: "감자튀김",
    description: "바삭한 감자튀김",
    imageUrl: "/images/menu/fries.jpg", basePrice: 4500, isAvailable: true,
    optionGroups: [
      {
        id: 4, name: "사이즈", isRequired: true, maxSelect: 1,
        options: [
          { id: 10, name: "레귤러", extraPrice: 0, isAvailable: true },
          { id: 11, name: "라지", extraPrice: 1500, isAvailable: true },
        ],
      },
      {
        id: 5, name: "소스 선택", isRequired: false, maxSelect: 2,
        options: [
          { id: 12, name: "케첩", extraPrice: 0, isAvailable: true },
          { id: 13, name: "치즈소스", extraPrice: 500, isAvailable: true },
          { id: 14, name: "갈릭소스", extraPrice: 500, isAvailable: true },
        ],
      },
    ],
  },
  {
    id: 5, categoryName: "스낵", name: "소떡소떡",
    description: "소시지와 떡의 환상 조합",
    imageUrl: "/images/menu/soteok.jpg", basePrice: 4000, isAvailable: true,
    optionGroups: [],
  },
  // 음료
  {
    id: 6, categoryName: "음료", name: "콜라",
    description: "", imageUrl: "/images/menu/cola.jpg", basePrice: 2500, isAvailable: true,
    optionGroups: [],
  },
  {
    id: 7, categoryName: "음료", name: "사이다",
    description: "", imageUrl: "/images/menu/cider.jpg", basePrice: 2500, isAvailable: true,
    optionGroups: [],
  },
  {
    id: 8, categoryName: "음료", name: "아메리카노",
    description: "", imageUrl: "/images/menu/americano.jpg", basePrice: 3500, isAvailable: true,
    optionGroups: [],
  },
  {
    id: 9, categoryName: "음료", name: "자몽에이드",
    description: "", imageUrl: "/images/menu/grapefruit.jpg", basePrice: 4500, isAvailable: true,
    optionGroups: [],
  },
  {
    id: 10, categoryName: "음료", name: "망고스무디",
    description: "", imageUrl: "/images/menu/mango.jpg", basePrice: 5000, isAvailable: false,
    optionGroups: [],
  },
];

/** 가격 포맷 (e.g. 8,900원) */
export function formatPrice(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}
