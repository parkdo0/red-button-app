/**
 * Mock 데이터 (DB 연결 전 UI 개발용)
 * 실제 레드버튼 태블릿 앱 기준으로 구성
 */

// ============================================
// 게임 관련
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
  group: string; // "genre" | "player_count" | "play_time"
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
  recommendedPlayers: string; // "3-5인" (추천 인원)
  playTime: number | null;
  playTimeCategory: string; // "15-30분"
  difficulty: Difficulty;
  shelfLocation: string; // 진열 위치 "ㄱㄴㄷ-6"
  hashtags: string[]; // ["#내 것도 내 거", "#네 것도 내 거"]
  tags: GameTag[];
}

/** 추천 게임 카테고리 (홈 화면용) - 실제 앱처럼 풍부한 설명 */
export interface GameCategory {
  id: string;
  title: string; // 메인 타이틀 (큰 글씨)
  subtitle: string; // 부제목 or 설명
  emoji: string;
  games: Game[];
}

// ─────────────────────────────────────
// 필터 옵션 (실제 앱 기준 - 사진 08)
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

// ─────────────────────────────────────
// 게임 데이터 (실제 앱에서 확인된 게임 포함)
// ─────────────────────────────────────
export const MOCK_GAMES: Game[] = [
  // 입문자 추천 게임
  {
    id: 1, title: "라스베가스",
    description: "주사위 8개로 여러분의 배짱을 테스트해 보세요. 운빨의 쾌감과 실패의 후회가 공존하는 게임!",
    thumbnailUrl: "/images/games/lasvegas.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_lasvegas",
    minPlayers: 2, maxPlayers: 5, recommendedPlayers: "3-5인",
    playTime: 30, playTimeCategory: "15-30분", difficulty: "EASY",
    shelfLocation: "ㄱㄴㄷ-3",
    hashtags: ["감성", "내가 못 먹으면", "아무도 못먹어!"],
    tags: [
      { group: "genre", value: "초보" }, { group: "genre", value: "주사위/운빨" },
      { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" },
      { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" },
    ],
  },
  {
    id: 2, title: "금지어 게임",
    description: "제시된 단어를 금지어를 사용하지 않고 설명해야 하는 스피드 퀴즈 게임!",
    thumbnailUrl: "/images/games/forbidden.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_forbidden",
    minPlayers: 4, maxPlayers: 8, recommendedPlayers: "4-8인",
    playTime: 25, playTimeCategory: "15-30분", difficulty: "EASY",
    shelfLocation: "ㄱㄴㄷ-5",
    hashtags: ["망설이는 순간", "감점되는", "스피드 퀴즈 게임"],
    tags: [
      { group: "genre", value: "초보" }, { group: "genre", value: "예능/퀴즈" },
      { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" },
      { group: "player_count", value: "6인" }, { group: "player_count", value: "7인" },
      { group: "player_count", value: "8인 이상" },
    ],
  },
  {
    id: 3, title: "루미큐브",
    description: "숫자 타일을 조합하여 세트를 만들고 가장 먼저 모든 타일을 내려놓는 국민게임!",
    thumbnailUrl: "/images/games/rummikub.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_rummikub",
    minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인",
    playTime: 45, playTimeCategory: "30-60분", difficulty: "EASY",
    shelfLocation: "ㄱㄴㄷ-1",
    hashtags: ["쪼개고 붙이고 합치고", "숫자조합", "국민게임"],
    tags: [
      { group: "genre", value: "초보" }, { group: "genre", value: "전략" },
      { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" },
      { group: "player_count", value: "4인" },
    ],
  },
  // 전략 게임
  {
    id: 4, title: "도미니언",
    description: "카드를 구매하고 덱을 빌딩하여 가장 많은 승점을 모으는 덱빌딩의 시초! 전략의 정석을 느껴보세요.",
    thumbnailUrl: "/images/games/dominion.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_dominion",
    minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인",
    playTime: 30, playTimeCategory: "30-60분", difficulty: "SEMI_HARD",
    shelfLocation: "ㄴㄷㄹ-2",
    hashtags: ["전략의 정석", "조합과 콤보의 맛"],
    tags: [
      { group: "genre", value: "중수" }, { group: "genre", value: "전략" },
      { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" },
      { group: "player_count", value: "4인" },
    ],
  },
  {
    id: 5, title: "파워그리드",
    description: "발전소를 사들이고 도시에 전력을 공급하는 경제 전략 게임. 탄탄한 현실 반영이 매력!",
    thumbnailUrl: "/images/games/powergrid.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_powergrid",
    minPlayers: 2, maxPlayers: 6, recommendedPlayers: "3-6인",
    playTime: 120, playTimeCategory: "60분 이상", difficulty: "HARD",
    shelfLocation: "ㄴㄷㄹ-4",
    hashtags: ["전력회사 운영", "탄탄한 현실 반영", "명품 전략"],
    tags: [
      { group: "genre", value: "고수" }, { group: "genre", value: "전략" }, { group: "genre", value: "협상/거래" },
      { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" },
      { group: "player_count", value: "5인" }, { group: "player_count", value: "6인" },
    ],
  },
  {
    id: 6, title: "임호텝",
    description: "고대 이집트 건축가가 되어 피라미드와 신전을 건설하라! 제한된 상황에서 최선의 노력을.",
    thumbnailUrl: "/images/games/imhotep.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_imhotep",
    minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인",
    playTime: 40, playTimeCategory: "30-60분", difficulty: "NORMAL",
    shelfLocation: "ㄴㄷㄹ-5",
    hashtags: ["제한된 상황", "최선의 노력", "눈치와 타이밍"],
    tags: [
      { group: "genre", value: "중수" }, { group: "genre", value: "전략" },
      { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" },
      { group: "player_count", value: "4인" },
    ],
  },
  // 운빨/파티 게임
  {
    id: 7, title: "스트라이크",
    description: "주사위를 던져 같은 눈을 모으는 간단하지만 짜릿한 운빨 게임! 잭팟이 터지는 순간!",
    thumbnailUrl: "/images/games/strike.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_strike",
    minPlayers: 2, maxPlayers: 5, recommendedPlayers: "2-5인",
    playTime: 15, playTimeCategory: "15분 이내", difficulty: "VERY_EASY",
    shelfLocation: "ㅁㅂㅅ-1",
    hashtags: ["완전 럭키비키", "잭팟", "운빨 한판"],
    tags: [
      { group: "genre", value: "초보" }, { group: "genre", value: "주사위/운빨" }, { group: "genre", value: "복불복/내기" },
      { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" },
      { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" },
    ],
  },
  {
    id: 8, title: "꼬꼬미노",
    description: "주사위 8개로 여러분의 배짱을 테스트해 보세요. 운빨의 쾌감과 실패의 후회가 공존하는 게임!",
    thumbnailUrl: "/images/games/heckmeck.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_heckmeck",
    minPlayers: 2, maxPlayers: 7, recommendedPlayers: "3-5인",
    playTime: 20, playTimeCategory: "15-30분", difficulty: "EASY",
    shelfLocation: "ㄱㄴㄷ-6",
    hashtags: ["#내 것도 내 거", "#네 것도 내 거", "#다 내꺼"],
    tags: [
      { group: "genre", value: "초보" }, { group: "genre", value: "주사위/운빨" },
      { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" },
      { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" },
      { group: "player_count", value: "6인" }, { group: "player_count", value: "7인" },
    ],
  },
  // 손기술/순발력
  {
    id: 9, title: "꼬치의 달인",
    description: "손님이 주문한 꼬치를 빠르게 만들어 봅시다! 눈을 크게 뜨고, 작은 토핑 하나까지 놓치지 마세요.",
    thumbnailUrl: "/images/games/skewers.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_skewers",
    minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인",
    playTime: 15, playTimeCategory: "15분 이내", difficulty: "VERY_EASY",
    shelfLocation: "ㄱㄴㄷ-6",
    hashtags: ["#재료를 꽂는", "#손이 안보이겠어"],
    tags: [
      { group: "genre", value: "초보" }, { group: "genre", value: "손기술/순발력" },
      { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" },
      { group: "player_count", value: "4인" },
    ],
  },
  // 추리
  {
    id: 10, title: "꿈의 대화",
    description: "서로의 꿈 속으로 들어가 단어의 연결고리를 찾아내는 추리 게임. 마피아와는 또 다른 재미!",
    thumbnailUrl: "/images/games/dreamtalk.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_dreamtalk",
    minPlayers: 4, maxPlayers: 10, recommendedPlayers: "4-8인",
    playTime: 30, playTimeCategory: "15-30분", difficulty: "EASY",
    shelfLocation: "ㅁㅂㅅ-3",
    hashtags: ["단어 추리", "마피아"],
    tags: [
      { group: "genre", value: "추리/방탈출" }, { group: "genre", value: "심리/눈치" },
      { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" },
      { group: "player_count", value: "6인" }, { group: "player_count", value: "7인" },
      { group: "player_count", value: "8인 이상" },
    ],
  },
  {
    id: 11, title: "디셉션: 홍콩 살인사건",
    description: "법의학자의 힌트를 통해 살인범을 찾아내는 정체 숨김 추리 게임.",
    thumbnailUrl: "/images/games/deception.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_deception",
    minPlayers: 4, maxPlayers: 12, recommendedPlayers: "5-8인",
    playTime: 20, playTimeCategory: "15-30분", difficulty: "NORMAL",
    shelfLocation: "ㅁㅂㅅ-4",
    hashtags: ["범인은 이 중에", "추리의 쾌감"],
    tags: [
      { group: "genre", value: "추리/방탈출" }, { group: "genre", value: "마피아" }, { group: "genre", value: "심리/눈치" },
      { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" },
      { group: "player_count", value: "6인" }, { group: "player_count", value: "7인" },
      { group: "player_count", value: "8인 이상" },
    ],
  },
  // 대화/파티
  {
    id: 12, title: "텔레스트레이션",
    description: "그림과 단어를 번갈아 전달하며 벌어지는 유쾌한 파티 게임. 내 그림을 왜 못 알아보지?!",
    thumbnailUrl: "/images/games/telestrations.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_telestrations",
    minPlayers: 4, maxPlayers: 8, recommendedPlayers: "4-8인",
    playTime: 30, playTimeCategory: "15-30분", difficulty: "VERY_EASY",
    shelfLocation: "ㅇㅈㅊ-1",
    hashtags: ["그림 실력 무관", "웃음 보장"],
    tags: [
      { group: "genre", value: "초보" }, { group: "genre", value: "대화" }, { group: "genre", value: "예능/퀴즈" },
      { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" },
      { group: "player_count", value: "6인" }, { group: "player_count", value: "7인" },
      { group: "player_count", value: "8인 이상" },
    ],
  },
  {
    id: 13, title: "코드네임",
    description: "팀 대결로 스파이마스터의 힌트 한 단어로 여러 코드명을 맞추는 단어 추리 게임.",
    thumbnailUrl: "/images/games/codenames.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_codenames",
    minPlayers: 4, maxPlayers: 8, recommendedPlayers: "4-8인",
    playTime: 15, playTimeCategory: "15분 이내", difficulty: "EASY",
    shelfLocation: "ㅇㅈㅊ-2",
    hashtags: ["단어 하나로", "팀 대결"],
    tags: [
      { group: "genre", value: "초보" }, { group: "genre", value: "대화" }, { group: "genre", value: "협동/팀전" },
      { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" },
      { group: "player_count", value: "6인" }, { group: "player_count", value: "7인" },
      { group: "player_count", value: "8인 이상" },
    ],
  },
  // 커플
  {
    id: 14, title: "스플렌더",
    description: "보석 토큰을 수집하고 발전 카드를 구매하여 점수를 모으는 엔진 빌딩 게임.",
    thumbnailUrl: "/images/games/splendor.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_splendor",
    minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-3인",
    playTime: 30, playTimeCategory: "30-60분", difficulty: "EASY",
    shelfLocation: "ㅇㅈㅊ-5",
    hashtags: ["보석 수집", "엔진 빌딩"],
    tags: [
      { group: "genre", value: "커플" }, { group: "genre", value: "전략" },
      { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" },
      { group: "player_count", value: "4인" },
    ],
  },
  {
    id: 15, title: "패치워크",
    description: "두 사람이 천 조각을 모아 가장 아름다운 퀼트를 완성하는 2인 전용 전략 게임.",
    thumbnailUrl: "/images/games/patchwork.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_patchwork",
    minPlayers: 2, maxPlayers: 2, recommendedPlayers: "2인",
    playTime: 30, playTimeCategory: "15-30분", difficulty: "EASY",
    shelfLocation: "ㅇㅈㅊ-6",
    hashtags: ["둘만의 시간", "퀼트 대결"],
    tags: [
      { group: "genre", value: "커플" }, { group: "genre", value: "전략" },
      { group: "player_count", value: "2인" },
    ],
  },
  // 마피아/블러핑
  {
    id: 16, title: "라이헌트",
    description: "이것은 보통의 마피아 게임이 아닙니다. 숨겨진 트롤이 몰래 혼돈을 부추기고 있습니다!",
    thumbnailUrl: "/images/games/liehunt.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_liehunt",
    minPlayers: 3, maxPlayers: 8, recommendedPlayers: "4-7인",
    playTime: 20, playTimeCategory: "15-30분", difficulty: "EASY",
    shelfLocation: "ㅁㅂㅅ-6",
    hashtags: ["트롤을 찾아라", "거짓말 탐지"],
    tags: [
      { group: "genre", value: "마피아" }, { group: "genre", value: "심리/눈치" },
      { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" },
      { group: "player_count", value: "5인" }, { group: "player_count", value: "6인" },
      { group: "player_count", value: "7인" }, { group: "player_count", value: "8인 이상" },
    ],
  },
  // 협동
  {
    id: 17, title: "팬데믹",
    description: "전 세계에 퍼지는 전염병을 막기 위해 팀원이 협력하는 협동 게임.",
    thumbnailUrl: "/images/games/pandemic.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_pandemic",
    minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인",
    playTime: 45, playTimeCategory: "30-60분", difficulty: "SEMI_HARD",
    shelfLocation: "ㅋㅌㅍ-1",
    hashtags: ["함께 살아남자", "협동의 묘미"],
    tags: [
      { group: "genre", value: "협동/팀전" }, { group: "genre", value: "전략" },
      { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" },
      { group: "player_count", value: "4인" },
    ],
  },
  {
    id: 18, title: "카탄",
    description: "자원을 모으고 교역하며 카탄 섬을 개척하는 전략 보드게임의 바이블.",
    thumbnailUrl: "/images/games/catan.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_catan",
    minPlayers: 3, maxPlayers: 4, recommendedPlayers: "3-4인",
    playTime: 75, playTimeCategory: "60분 이상", difficulty: "NORMAL",
    shelfLocation: "ㅋㅌㅍ-3",
    hashtags: ["자원 교역", "섬 개척", "보드게임의 정석"],
    tags: [
      { group: "genre", value: "중수" }, { group: "genre", value: "전략" }, { group: "genre", value: "협상/거래" },
      { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" },
    ],
  },
  // 베팅
  {
    id: 19, title: "카멜업",
    description: "낙타 경주에 베팅하며 짜릿한 도박의 쾌감을 느껴보세요! 누가 1등일까?",
    thumbnailUrl: "/images/games/camelup.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_camelup",
    minPlayers: 3, maxPlayers: 8, recommendedPlayers: "3-6인",
    playTime: 30, playTimeCategory: "15-30분", difficulty: "EASY",
    shelfLocation: "ㅁㅂㅅ-2",
    hashtags: ["낙타 경주", "배팅의 쾌감"],
    tags: [
      { group: "genre", value: "베팅" }, { group: "genre", value: "주사위/운빨" },
      { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" },
      { group: "player_count", value: "5인" }, { group: "player_count", value: "6인" },
      { group: "player_count", value: "7인" }, { group: "player_count", value: "8인 이상" },
    ],
  },
  {
    id: 20, title: "러브레터",
    description: "단 16장의 카드로 펼치는 심리전. 공주에게 편지를 전달하라!",
    thumbnailUrl: "/images/games/loveletter.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example_loveletter",
    minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인",
    playTime: 20, playTimeCategory: "15-30분", difficulty: "EASY",
    shelfLocation: "ㅇㅈㅊ-3",
    hashtags: ["심리전", "16장의 마법"],
    tags: [
      { group: "genre", value: "커플" }, { group: "genre", value: "심리/눈치" },
      { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" },
      { group: "player_count", value: "4인" },
    ],
  },
];

// ─────────────────────────────────────
// 추천 카테고리 (홈 화면 가로 스크롤 Row)
// 실제 앱처럼 감성적인 카테고리 제목 사용
// ─────────────────────────────────────
export const GAME_CATEGORIES: GameCategory[] = [
  {
    id: "beginner",
    title: "입문자를 위해 엄선한\n재미보장 보드게임",
    subtitle: "보드게임이 처음이시라면, 이 게임 어떠세요?",
    emoji: "🎲",
    games: MOCK_GAMES.filter((g) => [1, 2, 3, 8, 9, 7].includes(g.id)),
  },
  {
    id: "strategy",
    title: "수 싸움의 미학\n전략게임.zip",
    subtitle: "",
    emoji: "😏",
    games: MOCK_GAMES.filter((g) => [4, 5, 6, 18, 14].includes(g.id)),
  },
  {
    id: "lucky",
    title: "완전 럭키비키잖아?\n잭팟이 터지는 순간",
    subtitle: "",
    emoji: "🍀",
    games: MOCK_GAMES.filter((g) => [7, 8, 19, 1].includes(g.id)),
  },
  {
    id: "party",
    title: "다 같이 떠들어!\n단체 파티게임 모음",
    subtitle: "",
    emoji: "🎉",
    games: MOCK_GAMES.filter((g) => [2, 12, 13, 10, 16].includes(g.id)),
  },
  {
    id: "couple",
    title: "둘만의 보드게임\n커플 추천 TOP",
    subtitle: "",
    emoji: "💕",
    games: MOCK_GAMES.filter((g) => [15, 14, 20, 3].includes(g.id)),
  },
];

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
  isNew: boolean;
  isBest: boolean;
  optionGroups: MenuOptionGroup[];
}

/** 실제 앱 기준 F&B 카테고리 탭 */
export const FOOD_CATEGORIES = ["NEW", "BEST", "음료", "푸드", "벌칙메뉴", "MD상품"] as const;

export const MOCK_MENUS: MenuItem[] = [
  // 푸드 (실제 앱에서 확인된 메뉴)
  {
    id: 1, categoryName: "푸드", name: "마라떡볶이",
    description: "얼얼한 마라소스에 쫄깃한 떡볶이",
    imageUrl: "/images/menu/mara-tteok.jpg", basePrice: 9500, isAvailable: true,
    isNew: true, isBest: false,
    optionGroups: [
      {
        id: 1, name: "맛 선택", isRequired: true, maxSelect: 1,
        options: [
          { id: 1, name: "순한맛", extraPrice: 0, isAvailable: true },
          { id: 2, name: "보통맛", extraPrice: 0, isAvailable: true },
          { id: 3, name: "매운맛", extraPrice: 0, isAvailable: true },
        ],
      },
    ],
  },
  {
    id: 2, categoryName: "푸드", name: "피자떡볶이",
    description: "치즈 듬뿍 피자소스 떡볶이",
    imageUrl: "/images/menu/pizza-tteok.jpg", basePrice: 9500, isAvailable: true,
    isNew: true, isBest: false,
    optionGroups: [],
  },
  {
    id: 3, categoryName: "푸드", name: "크리스피 콜팝",
    description: "바삭한 치킨과 콜라의 환상 콤보",
    imageUrl: "/images/menu/crispy-colpop.jpg", basePrice: 6500, isAvailable: true,
    isNew: true, isBest: true,
    optionGroups: [],
  },
  {
    id: 4, categoryName: "푸드", name: "매콤마요 콜팝",
    description: "매콤한 양념과 마요네즈의 조화",
    imageUrl: "/images/menu/spicy-mayo-colpop.jpg", basePrice: 6500, isAvailable: true,
    isNew: true, isBest: false,
    optionGroups: [],
  },
  {
    id: 5, categoryName: "푸드", name: "치즈볼",
    description: "겉바속촉 모짜렐라 치즈볼 6개",
    imageUrl: "/images/menu/cheese-ball.jpg", basePrice: 5500, isAvailable: true,
    isNew: false, isBest: true,
    optionGroups: [],
  },
  {
    id: 6, categoryName: "푸드", name: "감자튀김",
    description: "바삭한 감자튀김",
    imageUrl: "/images/menu/fries.jpg", basePrice: 4500, isAvailable: true,
    isNew: false, isBest: true,
    optionGroups: [
      {
        id: 4, name: "사이즈", isRequired: true, maxSelect: 1,
        options: [
          { id: 10, name: "레귤러", extraPrice: 0, isAvailable: true },
          { id: 11, name: "라지", extraPrice: 1500, isAvailable: true },
        ],
      },
    ],
  },
  // 음료
  {
    id: 7, categoryName: "음료", name: "스트로베리 레몬티",
    description: "상큼한 딸기와 레몬의 만남",
    imageUrl: "/images/menu/strawberry-lemon.jpg", basePrice: 5500, isAvailable: true,
    isNew: true, isBest: false,
    optionGroups: [],
  },
  {
    id: 8, categoryName: "음료", name: "제로 복숭아 아이스티",
    description: "제로 칼로리 복숭아 아이스티",
    imageUrl: "/images/menu/peach-icetea.jpg", basePrice: 4300, isAvailable: true,
    isNew: false, isBest: true,
    optionGroups: [],
  },
  {
    id: 9, categoryName: "음료", name: "콜라",
    description: "", imageUrl: "/images/menu/cola.jpg", basePrice: 2500, isAvailable: true,
    isNew: false, isBest: false,
    optionGroups: [],
  },
  {
    id: 10, categoryName: "음료", name: "사이다",
    description: "", imageUrl: "/images/menu/cider.jpg", basePrice: 2500, isAvailable: true,
    isNew: false, isBest: false,
    optionGroups: [],
  },
  {
    id: 11, categoryName: "음료", name: "아메리카노",
    description: "", imageUrl: "/images/menu/americano.jpg", basePrice: 3500, isAvailable: true,
    isNew: false, isBest: false,
    optionGroups: [],
  },
  {
    id: 12, categoryName: "음료", name: "자몽에이드",
    description: "", imageUrl: "/images/menu/grapefruit.jpg", basePrice: 4500, isAvailable: true,
    isNew: false, isBest: false,
    optionGroups: [],
  },
  // 벌칙메뉴
  {
    id: 13, categoryName: "벌칙메뉴", name: "데스 초콜릿",
    description: "매운맛 초콜릿 러시안 룰렛",
    imageUrl: "/images/menu/death-choco.jpg", basePrice: 3000, isAvailable: true,
    isNew: false, isBest: true,
    optionGroups: [],
  },
  {
    id: 14, categoryName: "벌칙메뉴", name: "벌칙 젤리",
    description: "달콤할까 쓸까? 복불복 젤리",
    imageUrl: "/images/menu/penalty-jelly.jpg", basePrice: 2500, isAvailable: true,
    isNew: false, isBest: false,
    optionGroups: [],
  },
  // MD상품
  {
    id: 15, categoryName: "MD상품", name: "레드버튼 텀블러",
    description: "레드버튼 로고 텀블러",
    imageUrl: "/images/menu/tumbler.jpg", basePrice: 15000, isAvailable: true,
    isNew: false, isBest: false,
    optionGroups: [],
  },
];

/** 가격 포맷 (e.g. 8,900원) */
export function formatPrice(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}
