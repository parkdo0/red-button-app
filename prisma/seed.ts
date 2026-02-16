import {
  PrismaClient,
  CategoryType,
  Difficulty,
  AdminRole,
  OrderStatus,
  MessageSender,
} from "@prisma/client";

import dotenv from "dotenv";
import { PrismaMysql } from "@prisma/adapter-mysql";
import mysql from "mysql2/promise";

dotenv.config();

// Prisma 7: adapter 패턴으로 DB 연결
const pool = mysql.createPool(process.env.DATABASE_URL!);
const adapter = new PrismaMysql(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔄 기존 데이터 초기화...");
  // 의존 관계 역순으로 삭제
  await prisma.orderItemOption.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.tableSession.deleteMany();
  await prisma.storeMenu.deleteMany();
  await prisma.storeGame.deleteMany();
  await prisma.recommendCategoryItem.deleteMany();
  await prisma.recommendCategory.deleteMany();
  await prisma.gameHashtag.deleteMany();
  await prisma.gameTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.game.deleteMany();
  await prisma.menuOption.deleteMany();
  await prisma.menuOptionGroup.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.category.deleteMany();
  await prisma.event.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.table.deleteMany();
  await prisma.store.deleteMany();

  // ============================================
  // 1. 매장 (4개)
  // ============================================
  const stores = await Promise.all([
    prisma.store.create({
      data: { name: "수원점", address: "경기도 수원시 팔달구 인계로 123", phone: "031-123-4567", wifiId: "redbutton", wifiPw: "red2563799", openTime: "10:00", closeTime: "23:00" },
    }),
    prisma.store.create({
      data: { name: "강남점", address: "서울특별시 강남구 테헤란로 456", phone: "02-234-5678", wifiId: "redbutton", wifiPw: "red1234567", openTime: "10:00", closeTime: "24:00" },
    }),
    prisma.store.create({
      data: { name: "홍대점", address: "서울특별시 마포구 와우산로 789", phone: "02-345-6789", wifiId: "redbutton", wifiPw: "red7891234", openTime: "11:00", closeTime: "24:00" },
    }),
    prisma.store.create({
      data: { name: "부산서면점", address: "부산광역시 부산진구 서면로 321", phone: "051-456-7890", wifiId: "redbutton", wifiPw: "red3214567", openTime: "10:00", closeTime: "23:00", isActive: false },
    }),
  ]);
  const [suwon, gangnam, hongdae, busan] = stores;
  console.log(`✅ 매장 ${stores.length}개 생성`);

  // ============================================
  // 2. 테이블 (수원점 35개, 강남 40개, 홍대 30개, 부산 25개)
  // ============================================
  const tableConfigs: { storeId: number; count: number }[] = [
    { storeId: suwon.id, count: 35 },
    { storeId: gangnam.id, count: 40 },
    { storeId: hongdae.id, count: 30 },
    { storeId: busan.id, count: 25 },
  ];
  for (const { storeId, count } of tableConfigs) {
    await prisma.table.createMany({
      data: Array.from({ length: count }, (_, i) => ({
        storeId,
        tableNo: String(i + 1),
        seats: (i + 1) % 5 === 0 ? 6 : 4,
      })),
    });
  }
  console.log("✅ 테이블 130개 생성");

  // ============================================
  // 3. 관리자 계정
  // ============================================
  await prisma.adminUser.createMany({
    data: [
      { email: "admin@redbutton.co.kr", password: "$2b$10$placeholder_hq_hash", name: "김본사", role: AdminRole.HQ_ADMIN, storeId: null },
      { email: "suwon@redbutton.co.kr", password: "$2b$10$placeholder_suwon_hash", name: "이수원", role: AdminRole.STORE_MANAGER, storeId: suwon.id },
      { email: "gangnam@redbutton.co.kr", password: "$2b$10$placeholder_gangnam_hash", name: "박강남", role: AdminRole.STORE_MANAGER, storeId: gangnam.id },
      { email: "hongdae@redbutton.co.kr", password: "$2b$10$placeholder_hongdae_hash", name: "최홍대", role: AdminRole.STORE_MANAGER, storeId: hongdae.id },
      { email: "staff1@redbutton.co.kr", password: "$2b$10$placeholder_staff_hash", name: "정직원", role: AdminRole.STORE_STAFF, storeId: suwon.id },
    ],
  });
  console.log("✅ 관리자 5명 생성");

  // ============================================
  // 4. F&B 카테고리
  // ============================================
  const categories = await Promise.all([
    prisma.category.create({ data: { type: CategoryType.FOOD, name: "푸드", displayOrder: 0 } }),
    prisma.category.create({ data: { type: CategoryType.FOOD, name: "음료", displayOrder: 1 } }),
    prisma.category.create({ data: { type: CategoryType.FOOD, name: "벌칙메뉴", displayOrder: 2 } }),
    prisma.category.create({ data: { type: CategoryType.FOOD, name: "MD상품", displayOrder: 3 } }),
  ]);
  const [catFood, catDrink, catPenalty, catMD] = categories;
  console.log("✅ 카테고리 4개 생성");

  // ============================================
  // 5. 태그 (장르 20개 + 인원수 7개)
  // ============================================
  const genreTags = [
    "초보", "중수", "고수", "커플", "단체", "패밀리", "어린이", "전략",
    "손기술/순발력", "추리/방탈출", "주사위/운빨", "심리/눈치", "마피아",
    "협상/거래", "협동/팀전", "복불복/내기", "예능/퀴즈", "대화", "베팅", "머더미스테리",
  ];
  const playerTags = ["2인", "3인", "4인", "5인", "6인", "7인", "8인 이상"];

  const allTagData = [
    ...genreTags.map((v, i) => ({ group: "genre", value: v, displayOrder: i })),
    ...playerTags.map((v, i) => ({ group: "player_count", value: v, displayOrder: i })),
  ];
  await prisma.tag.createMany({ data: allTagData });
  const allTags = await prisma.tag.findMany();
  const tagMap = new Map(allTags.map((t) => [`${t.group}:${t.value}`, t.id]));
  const tagId = (group: string, value: string) => tagMap.get(`${group}:${value}`)!;
  console.log(`✅ 태그 ${allTags.length}개 생성`);

  // ============================================
  // 6. 보드게임 20개 + 태그 + 해시태그
  // ============================================
  interface GameSeed {
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
    defaultShelfLoc: string;
    hashtags: string[];
    genreTags: string[];
    playerTags: string[];
  }

  const gamesData: GameSeed[] = [
    {
      title: "라스베가스", description: "주사위 8개로 여러분의 배짱을 테스트해 보세요. 운빨의 쾌감과 실패의 후회가 공존하는 게임!",
      thumbnailUrl: "/images/games/lasvegas.jpg", videoUrl: "https://www.youtube.com/watch?v=example_lasvegas",
      minPlayers: 2, maxPlayers: 5, recommendedPlayers: "3-5인", playTime: 30, playTimeCategory: "15-30분",
      difficulty: Difficulty.EASY, defaultShelfLoc: "ㄱㄴㄷ-3",
      hashtags: ["감성", "내가 못 먹으면", "아무도 못먹어!"],
      genreTags: ["초보", "주사위/운빨"], playerTags: ["2인", "3인", "4인", "5인"],
    },
    {
      title: "금지어 게임", description: "제시된 단어를 금지어를 사용하지 않고 설명해야 하는 스피드 퀴즈 게임!",
      thumbnailUrl: "/images/games/forbidden.jpg", videoUrl: "https://www.youtube.com/watch?v=example_forbidden",
      minPlayers: 4, maxPlayers: 8, recommendedPlayers: "4-8인", playTime: 25, playTimeCategory: "15-30분",
      difficulty: Difficulty.EASY, defaultShelfLoc: "ㄱㄴㄷ-5",
      hashtags: ["망설이는 순간", "감점되는", "스피드 퀴즈 게임"],
      genreTags: ["초보", "예능/퀴즈"], playerTags: ["4인", "5인", "6인", "7인", "8인 이상"],
    },
    {
      title: "루미큐브", description: "숫자 타일을 조합하여 세트를 만들고 가장 먼저 모든 타일을 내려놓는 국민게임!",
      thumbnailUrl: "/images/games/rummikub.jpg", videoUrl: "https://www.youtube.com/watch?v=example_rummikub",
      minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인", playTime: 45, playTimeCategory: "30-60분",
      difficulty: Difficulty.EASY, defaultShelfLoc: "ㄱㄴㄷ-1",
      hashtags: ["쪼개고 붙이고 합치고", "숫자조합", "국민게임"],
      genreTags: ["초보", "전략"], playerTags: ["2인", "3인", "4인"],
    },
    {
      title: "도미니언", description: "카드를 구매하고 덱을 빌딩하여 가장 많은 승점을 모으는 덱빌딩의 시초!",
      thumbnailUrl: "/images/games/dominion.jpg", videoUrl: "https://www.youtube.com/watch?v=example_dominion",
      minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인", playTime: 30, playTimeCategory: "30-60분",
      difficulty: Difficulty.SEMI_HARD, defaultShelfLoc: "ㄴㄷㄹ-2",
      hashtags: ["전략의 정석", "조합과 콤보의 맛"],
      genreTags: ["중수", "전략"], playerTags: ["2인", "3인", "4인"],
    },
    {
      title: "파워그리드", description: "발전소를 사들이고 도시에 전력을 공급하는 경제 전략 게임.",
      thumbnailUrl: "/images/games/powergrid.jpg", videoUrl: "https://www.youtube.com/watch?v=example_powergrid",
      minPlayers: 2, maxPlayers: 6, recommendedPlayers: "3-6인", playTime: 120, playTimeCategory: "60분 이상",
      difficulty: Difficulty.HARD, defaultShelfLoc: "ㄴㄷㄹ-4",
      hashtags: ["전력회사 운영", "탄탄한 현실 반영", "명품 전략"],
      genreTags: ["고수", "전략", "협상/거래"], playerTags: ["3인", "4인", "5인", "6인"],
    },
    {
      title: "임호텝", description: "고대 이집트 건축가가 되어 피라미드와 신전을 건설하라!",
      thumbnailUrl: "/images/games/imhotep.jpg", videoUrl: "https://www.youtube.com/watch?v=example_imhotep",
      minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인", playTime: 40, playTimeCategory: "30-60분",
      difficulty: Difficulty.NORMAL, defaultShelfLoc: "ㄴㄷㄹ-5",
      hashtags: ["제한된 상황", "최선의 노력", "눈치와 타이밍"],
      genreTags: ["중수", "전략"], playerTags: ["2인", "3인", "4인"],
    },
    {
      title: "스트라이크", description: "주사위를 던져 같은 눈을 모으는 간단하지만 짜릿한 운빨 게임!",
      thumbnailUrl: "/images/games/strike.jpg", videoUrl: "https://www.youtube.com/watch?v=example_strike",
      minPlayers: 2, maxPlayers: 5, recommendedPlayers: "2-5인", playTime: 15, playTimeCategory: "15분 이내",
      difficulty: Difficulty.VERY_EASY, defaultShelfLoc: "ㅁㅂㅅ-1",
      hashtags: ["완전 럭키비키", "잭팟", "운빨 한판"],
      genreTags: ["초보", "주사위/운빨", "복불복/내기"], playerTags: ["2인", "3인", "4인", "5인"],
    },
    {
      title: "꼬꼬미노", description: "주사위 8개로 여러분의 배짱을 테스트해 보세요. 운빨의 쾌감과 실패의 후회가 공존하는 게임!",
      thumbnailUrl: "/images/games/heckmeck.jpg", videoUrl: "https://www.youtube.com/watch?v=example_heckmeck",
      minPlayers: 2, maxPlayers: 7, recommendedPlayers: "3-5인", playTime: 20, playTimeCategory: "15-30분",
      difficulty: Difficulty.EASY, defaultShelfLoc: "ㄱㄴㄷ-6",
      hashtags: ["내 것도 내 거", "네 것도 내 거", "다 내꺼"],
      genreTags: ["초보", "주사위/운빨"], playerTags: ["2인", "3인", "4인", "5인", "6인", "7인"],
    },
    {
      title: "꼬치의 달인", description: "손님이 주문한 꼬치를 빠르게 만들어 봅시다!",
      thumbnailUrl: "/images/games/skewers.jpg", videoUrl: "https://www.youtube.com/watch?v=example_skewers",
      minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인", playTime: 15, playTimeCategory: "15분 이내",
      difficulty: Difficulty.VERY_EASY, defaultShelfLoc: "ㄱㄴㄷ-6",
      hashtags: ["재료를 꽂는", "손이 안보이겠어"],
      genreTags: ["초보", "손기술/순발력"], playerTags: ["2인", "3인", "4인"],
    },
    {
      title: "꿈의 대화", description: "서로의 꿈 속으로 들어가 단어의 연결고리를 찾아내는 추리 게임.",
      thumbnailUrl: "/images/games/dreamtalk.jpg", videoUrl: "https://www.youtube.com/watch?v=example_dreamtalk",
      minPlayers: 4, maxPlayers: 10, recommendedPlayers: "4-8인", playTime: 30, playTimeCategory: "15-30분",
      difficulty: Difficulty.EASY, defaultShelfLoc: "ㅁㅂㅅ-3",
      hashtags: ["단어 추리", "마피아"],
      genreTags: ["추리/방탈출", "심리/눈치"], playerTags: ["4인", "5인", "6인", "7인", "8인 이상"],
    },
    {
      title: "디셉션: 홍콩 살인사건", description: "법의학자의 힌트를 통해 살인범을 찾아내는 정체 숨김 추리 게임.",
      thumbnailUrl: "/images/games/deception.jpg", videoUrl: "https://www.youtube.com/watch?v=example_deception",
      minPlayers: 4, maxPlayers: 12, recommendedPlayers: "5-8인", playTime: 20, playTimeCategory: "15-30분",
      difficulty: Difficulty.NORMAL, defaultShelfLoc: "ㅁㅂㅅ-4",
      hashtags: ["범인은 이 중에", "추리의 쾌감"],
      genreTags: ["추리/방탈출", "마피아", "심리/눈치"], playerTags: ["4인", "5인", "6인", "7인", "8인 이상"],
    },
    {
      title: "텔레스트레이션", description: "그림과 단어를 번갈아 전달하며 벌어지는 유쾌한 파티 게임.",
      thumbnailUrl: "/images/games/telestrations.jpg", videoUrl: "https://www.youtube.com/watch?v=example_telestrations",
      minPlayers: 4, maxPlayers: 8, recommendedPlayers: "4-8인", playTime: 30, playTimeCategory: "15-30분",
      difficulty: Difficulty.VERY_EASY, defaultShelfLoc: "ㅇㅈㅊ-1",
      hashtags: ["그림 실력 무관", "웃음 보장"],
      genreTags: ["초보", "대화", "예능/퀴즈"], playerTags: ["4인", "5인", "6인", "7인", "8인 이상"],
    },
    {
      title: "코드네임", description: "팀 대결로 스파이마스터의 힌트 한 단어로 여러 코드명을 맞추는 단어 추리 게임.",
      thumbnailUrl: "/images/games/codenames.jpg", videoUrl: "https://www.youtube.com/watch?v=example_codenames",
      minPlayers: 4, maxPlayers: 8, recommendedPlayers: "4-8인", playTime: 15, playTimeCategory: "15분 이내",
      difficulty: Difficulty.EASY, defaultShelfLoc: "ㅇㅈㅊ-2",
      hashtags: ["단어 하나로", "팀 대결"],
      genreTags: ["초보", "대화", "협동/팀전"], playerTags: ["4인", "5인", "6인", "7인", "8인 이상"],
    },
    {
      title: "스플렌더", description: "보석 토큰을 수집하고 발전 카드를 구매하여 점수를 모으는 엔진 빌딩 게임.",
      thumbnailUrl: "/images/games/splendor.jpg", videoUrl: "https://www.youtube.com/watch?v=example_splendor",
      minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-3인", playTime: 30, playTimeCategory: "30-60분",
      difficulty: Difficulty.EASY, defaultShelfLoc: "ㅇㅈㅊ-5",
      hashtags: ["보석 수집", "엔진 빌딩"],
      genreTags: ["커플", "전략"], playerTags: ["2인", "3인", "4인"],
    },
    {
      title: "패치워크", description: "두 사람이 천 조각을 모아 가장 아름다운 퀼트를 완성하는 2인 전용 전략 게임.",
      thumbnailUrl: "/images/games/patchwork.jpg", videoUrl: "https://www.youtube.com/watch?v=example_patchwork",
      minPlayers: 2, maxPlayers: 2, recommendedPlayers: "2인", playTime: 30, playTimeCategory: "15-30분",
      difficulty: Difficulty.EASY, defaultShelfLoc: "ㅇㅈㅊ-6",
      hashtags: ["둘만의 시간", "퀼트 대결"],
      genreTags: ["커플", "전략"], playerTags: ["2인"],
    },
    {
      title: "라이헌트", description: "이것은 보통의 마피아 게임이 아닙니다. 숨겨진 트롤이 몰래 혼돈을 부추기고 있습니다!",
      thumbnailUrl: "/images/games/liehunt.jpg", videoUrl: "https://www.youtube.com/watch?v=example_liehunt",
      minPlayers: 3, maxPlayers: 8, recommendedPlayers: "4-7인", playTime: 20, playTimeCategory: "15-30분",
      difficulty: Difficulty.EASY, defaultShelfLoc: "ㅁㅂㅅ-6",
      hashtags: ["트롤을 찾아라", "거짓말 탐지"],
      genreTags: ["마피아", "심리/눈치"], playerTags: ["3인", "4인", "5인", "6인", "7인", "8인 이상"],
    },
    {
      title: "팬데믹", description: "전 세계에 퍼지는 전염병을 막기 위해 팀원이 협력하는 협동 게임.",
      thumbnailUrl: "/images/games/pandemic.jpg", videoUrl: "https://www.youtube.com/watch?v=example_pandemic",
      minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인", playTime: 45, playTimeCategory: "30-60분",
      difficulty: Difficulty.SEMI_HARD, defaultShelfLoc: "ㅋㅌㅍ-1",
      hashtags: ["함께 살아남자", "협동의 묘미"],
      genreTags: ["협동/팀전", "전략"], playerTags: ["2인", "3인", "4인"],
    },
    {
      title: "카탄", description: "자원을 모으고 교역하며 카탄 섬을 개척하는 전략 보드게임의 바이블.",
      thumbnailUrl: "/images/games/catan.jpg", videoUrl: "https://www.youtube.com/watch?v=example_catan",
      minPlayers: 3, maxPlayers: 4, recommendedPlayers: "3-4인", playTime: 75, playTimeCategory: "60분 이상",
      difficulty: Difficulty.NORMAL, defaultShelfLoc: "ㅋㅌㅍ-3",
      hashtags: ["자원 교역", "섬 개척", "보드게임의 정석"],
      genreTags: ["중수", "전략", "협상/거래"], playerTags: ["3인", "4인"],
    },
    {
      title: "카멜업", description: "낙타 경주에 베팅하며 짜릿한 도박의 쾌감을 느껴보세요!",
      thumbnailUrl: "/images/games/camelup.jpg", videoUrl: "https://www.youtube.com/watch?v=example_camelup",
      minPlayers: 3, maxPlayers: 8, recommendedPlayers: "3-6인", playTime: 30, playTimeCategory: "15-30분",
      difficulty: Difficulty.EASY, defaultShelfLoc: "ㅁㅂㅅ-2",
      hashtags: ["낙타 경주", "배팅의 쾌감"],
      genreTags: ["베팅", "주사위/운빨"], playerTags: ["3인", "4인", "5인", "6인", "7인", "8인 이상"],
    },
    {
      title: "러브레터", description: "단 16장의 카드로 펼치는 심리전. 공주에게 편지를 전달하라!",
      thumbnailUrl: "/images/games/loveletter.jpg", videoUrl: "https://www.youtube.com/watch?v=example_loveletter",
      minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인", playTime: 20, playTimeCategory: "15-30분",
      difficulty: Difficulty.EASY, defaultShelfLoc: "ㅇㅈㅊ-3",
      hashtags: ["심리전", "16장의 마법"],
      genreTags: ["커플", "심리/눈치"], playerTags: ["2인", "3인", "4인"],
    },
  ];

  const gameIds: number[] = [];
  for (const g of gamesData) {
    const { hashtags, genreTags: gTags, playerTags: pTags, ...fields } = g;
    const game = await prisma.game.create({ data: fields });
    gameIds.push(game.id);

    // 태그 연결
    const tagConnections = [
      ...gTags.map((v) => ({ gameId: game.id, tagId: tagId("genre", v) })),
      ...pTags.map((v) => ({ gameId: game.id, tagId: tagId("player_count", v) })),
    ];
    await prisma.gameTag.createMany({ data: tagConnections });

    // 해시태그
    await prisma.gameHashtag.createMany({
      data: hashtags.map((text, i) => ({ gameId: game.id, text, order: i })),
    });
  }
  console.log(`✅ 게임 ${gameIds.length}개 + 태그/해시태그 연결 완료`);

  // ============================================
  // 7. 매장별 게임 보유 (수원점 15개)
  // ============================================
  const suwonGameIndices = [0, 1, 2, 3, 6, 7, 8, 9, 11, 12, 13, 15, 17, 18, 19]; // 0-based
  const shelfOverrides: Record<number, string> = { 3: "ㅁ-2" }; // 도미니언만 오버라이드
  await prisma.storeGame.createMany({
    data: suwonGameIndices.map((idx) => ({
      storeId: suwon.id,
      gameId: gameIds[idx],
      isVisible: idx !== 9, // 꿈의 대화만 비노출
      shelfLocation: shelfOverrides[idx] ?? null,
    })),
  });
  console.log("✅ 수원점 게임 보유 15개 설정");

  // ============================================
  // 8. 추천 카테고리 (홈 화면 Row)
  // ============================================
  const recCats = [
    { title: "입문자를 위해 엄선한 재미보장 보드게임", subtitle: "보드게임이 처음이시라면, 이 게임 어떠세요?", emoji: "🎲", gameIndices: [0, 1, 2, 7, 8, 6] },
    { title: "수 싸움의 미학 전략게임.zip", subtitle: "", emoji: "😏", gameIndices: [3, 4, 5, 17, 13] },
    { title: "완전 럭키비키잖아? 잭팟이 터지는 순간", subtitle: "", emoji: "🍀", gameIndices: [6, 7, 18, 0] },
    { title: "다 같이 떠들어! 단체 파티게임 모음", subtitle: "", emoji: "🎉", gameIndices: [1, 11, 12, 9, 15] },
    { title: "둘만의 보드게임 커플 추천 TOP", subtitle: "", emoji: "💕", gameIndices: [14, 13, 19, 2] },
  ];
  for (let i = 0; i < recCats.length; i++) {
    const rc = recCats[i];
    const cat = await prisma.recommendCategory.create({
      data: { title: rc.title, subtitle: rc.subtitle, emoji: rc.emoji, order: i, isActive: true },
    });
    await prisma.recommendCategoryItem.createMany({
      data: rc.gameIndices.map((gIdx, j) => ({ categoryId: cat.id, gameId: gameIds[gIdx], order: j })),
    });
  }
  console.log("✅ 추천 카테고리 5개 생성");

  // ============================================
  // 9. F&B 메뉴 + 옵션
  // ============================================
  // 푸드
  const mara = await prisma.menu.create({
    data: {
      categoryId: catFood.id, name: "마라떡볶이", description: "얼얼한 마라소스에 쫄깃한 떡볶이",
      imageUrl: "/images/menu/mara-tteok.jpg", basePrice: 9500, isNew: true, displayOrder: 0,
      optionGroups: {
        create: [{
          name: "맛 선택", isRequired: true, maxSelect: 1, displayOrder: 0,
          options: { create: [
            { name: "순한맛", extraPrice: 0, displayOrder: 0 },
            { name: "보통맛", extraPrice: 0, displayOrder: 1 },
            { name: "매운맛", extraPrice: 0, displayOrder: 2 },
          ]},
        }],
      },
    },
  });
  const pizza = await prisma.menu.create({
    data: { categoryId: catFood.id, name: "피자떡볶이", description: "치즈 듬뿍 피자소스 떡볶이", imageUrl: "/images/menu/pizza-tteok.jpg", basePrice: 9500, isNew: true, displayOrder: 1 },
  });
  const crispy = await prisma.menu.create({
    data: { categoryId: catFood.id, name: "크리스피 콜팝", description: "바삭한 치킨과 콜라의 환상 콤보", imageUrl: "/images/menu/crispy-colpop.jpg", basePrice: 6500, isNew: true, isBest: true, displayOrder: 2 },
  });
  await prisma.menu.create({
    data: { categoryId: catFood.id, name: "매콤마요 콜팝", description: "매콤한 양념과 마요네즈의 조화", imageUrl: "/images/menu/spicy-mayo-colpop.jpg", basePrice: 6500, isNew: true, displayOrder: 3 },
  });
  const cheeseBall = await prisma.menu.create({
    data: { categoryId: catFood.id, name: "치즈볼", description: "겉바속촉 모짜렐라 치즈볼 6개", imageUrl: "/images/menu/cheese-ball.jpg", basePrice: 5500, isBest: true, displayOrder: 4 },
  });
  await prisma.menu.create({
    data: {
      categoryId: catFood.id, name: "감자튀김", description: "바삭한 감자튀김", imageUrl: "/images/menu/fries.jpg", basePrice: 4500, isBest: true, displayOrder: 5,
      optionGroups: {
        create: [{
          name: "사이즈", isRequired: true, maxSelect: 1, displayOrder: 0,
          options: { create: [
            { name: "레귤러", extraPrice: 0, displayOrder: 0 },
            { name: "라지", extraPrice: 1500, displayOrder: 1 },
          ]},
        }],
      },
    },
  });

  // 음료
  const strawberry = await prisma.menu.create({
    data: { categoryId: catDrink.id, name: "스트로베리 레몬티", description: "상큼한 딸기와 레몬의 만남", imageUrl: "/images/menu/strawberry-lemon.jpg", basePrice: 5500, isNew: true, displayOrder: 0 },
  });
  const peachTea = await prisma.menu.create({
    data: { categoryId: catDrink.id, name: "제로 복숭아 아이스티", description: "제로 칼로리 복숭아 아이스티", imageUrl: "/images/menu/peach-icetea.jpg", basePrice: 4300, isBest: true, displayOrder: 1 },
  });
  const cola = await prisma.menu.create({
    data: { categoryId: catDrink.id, name: "콜라", description: "", imageUrl: "/images/menu/cola.jpg", basePrice: 2500, displayOrder: 2 },
  });
  await prisma.menu.create({ data: { categoryId: catDrink.id, name: "사이다", description: "", imageUrl: "/images/menu/cider.jpg", basePrice: 2500, displayOrder: 3 } });
  const americano = await prisma.menu.create({ data: { categoryId: catDrink.id, name: "아메리카노", description: "", imageUrl: "/images/menu/americano.jpg", basePrice: 3500, displayOrder: 4 } });
  const grapefruit = await prisma.menu.create({ data: { categoryId: catDrink.id, name: "자몽에이드", description: "", imageUrl: "/images/menu/grapefruit.jpg", basePrice: 4500, displayOrder: 5 } });

  // 벌칙메뉴
  await prisma.menu.create({ data: { categoryId: catPenalty.id, name: "데스 초콜릿", description: "매운맛 초콜릿 러시안 룰렛", imageUrl: "/images/menu/death-choco.jpg", basePrice: 3000, isBest: true, displayOrder: 0 } });
  await prisma.menu.create({ data: { categoryId: catPenalty.id, name: "벌칙 젤리", description: "달콤할까 쓸까? 복불복 젤리", imageUrl: "/images/menu/penalty-jelly.jpg", basePrice: 2500, displayOrder: 1 } });

  // MD상품
  await prisma.menu.create({ data: { categoryId: catMD.id, name: "레드버튼 텀블러", description: "레드버튼 로고 텀블러", imageUrl: "/images/menu/tumbler.jpg", basePrice: 15000, displayOrder: 0 } });

  console.log("✅ F&B 메뉴 15개 + 옵션 생성 완료");

  // ============================================
  // 10. 매장별 메뉴 설정 (수원점)
  // ============================================
  const allMenus = await prisma.menu.findMany();
  await prisma.storeMenu.createMany({
    data: allMenus.map((m) => ({ storeId: suwon.id, menuId: m.id, isAvailable: true })),
  });
  console.log("✅ 수원점 메뉴 전체 등록");

  // ============================================
  // 11. 이벤트 배너
  // ============================================
  await prisma.event.createMany({
    data: [
      { title: "LIAR & TROLL SHOW", subtitle: "레드버튼 오리지널 게임 세번째 시리즈 공개!", imageUrl: "/images/events/liehunt.jpg", order: 1, isActive: true, startDate: new Date("2026-01-15"), endDate: new Date("2026-03-31") },
      { title: "Feel the NEW Tasty Rush!", subtitle: "새로운 맛의 짜릿한 순간을 느껴봐!", imageUrl: "/images/events/tasty-rush.jpg", order: 2, isActive: true, startDate: new Date("2026-02-01"), endDate: new Date("2026-02-28") },
      { title: "발렌타인 커플 이벤트", subtitle: "커플 보드게임 추천 + 음료 할인", imageUrl: "/images/events/valentine.jpg", order: 3, isActive: true, startDate: new Date("2026-02-10"), endDate: new Date("2026-02-16") },
    ],
  });
  console.log("✅ 이벤트 3개 생성");

  // ============================================
  // 12. 샘플 주문 (수원점)
  // ============================================
  const suwonTables = await prisma.table.findMany({ where: { storeId: suwon.id }, orderBy: { tableNo: "asc" } });
  const tbl = (no: string) => suwonTables.find((t) => t.tableNo === no)!;

  // 주문 1: 31번 테이블 - PENDING
  await prisma.order.create({
    data: {
      storeId: suwon.id, tableId: tbl("31").id, status: OrderStatus.PENDING, totalPrice: 14500,
      items: {
        create: [
          { menuId: mara.id, menuName: "마라떡볶이", basePrice: 9500, quantity: 1, subTotal: 9500 },
          { menuId: cola.id, menuName: "콜라", basePrice: 2500, quantity: 2, subTotal: 5000 },
        ],
      },
    },
  });

  // 주문 2: 15번 테이블 - PENDING
  await prisma.order.create({
    data: {
      storeId: suwon.id, tableId: tbl("15").id, status: OrderStatus.PENDING, totalPrice: 23800,
      items: {
        create: [
          { menuId: crispy.id, menuName: "크리스피 콜팝", basePrice: 6500, quantity: 3, subTotal: 19500 },
          { menuId: peachTea.id, menuName: "제로 복숭아 아이스티", basePrice: 4300, quantity: 1, subTotal: 4300 },
        ],
      },
    },
  });

  // 주문 3: 7번 - PREPARING
  await prisma.order.create({
    data: {
      storeId: suwon.id, tableId: tbl("7").id, status: OrderStatus.PREPARING, totalPrice: 9500,
      items: { create: [{ menuId: pizza.id, menuName: "피자떡볶이", basePrice: 9500, quantity: 1, subTotal: 9500 }] },
    },
  });

  // 주문 4: 22번 - PREPARING
  await prisma.order.create({
    data: {
      storeId: suwon.id, tableId: tbl("22").id, status: OrderStatus.PREPARING, totalPrice: 18000,
      items: {
        create: [
          { menuId: mara.id, menuName: "마라떡볶이", basePrice: 9500, quantity: 1, subTotal: 9500 },
          { menuId: cheeseBall.id, menuName: "치즈볼", basePrice: 5500, quantity: 1, subTotal: 6000 },
          { menuId: cola.id, menuName: "콜라", basePrice: 2500, quantity: 1, subTotal: 2500 },
        ],
      },
    },
  });

  // 주문 5: 3번 - CONFIRMED
  await prisma.order.create({
    data: {
      storeId: suwon.id, tableId: tbl("3").id, status: OrderStatus.CONFIRMED, totalPrice: 11000,
      items: { create: [{ menuId: cheeseBall.id, menuName: "치즈볼", basePrice: 5500, quantity: 2, subTotal: 11000 }] },
    },
  });

  // 주문 6: 18번 - COMPLETED
  await prisma.order.create({
    data: {
      storeId: suwon.id, tableId: tbl("18").id, status: OrderStatus.COMPLETED, totalPrice: 8000,
      items: {
        create: [
          { menuId: americano.id, menuName: "아메리카노", basePrice: 3500, quantity: 1, subTotal: 3500 },
          { menuId: grapefruit.id, menuName: "자몽에이드", basePrice: 4500, quantity: 1, subTotal: 4500 },
        ],
      },
    },
  });

  console.log("✅ 샘플 주문 6건 생성");

  // ============================================
  // 13. 테이블 세션 (수원점 10개 이용 중)
  // ============================================
  const occupiedNos = ["1", "3", "7", "11", "15", "18", "22", "25", "28", "31"];
  for (const no of occupiedNos) {
    const table = tbl(no);
    const elapsed = Math.floor(Math.random() * 120) + 10;
    await prisma.tableSession.create({
      data: {
        storeId: suwon.id,
        tableId: table.id,
        guestCount: Math.floor(Math.random() * 4) + 2,
        checkInAt: new Date(Date.now() - elapsed * 60 * 1000),
      },
    });
  }
  console.log("✅ 테이블 세션 10건 생성");

  // ============================================
  // 14. 카운터 쪽지 샘플
  // ============================================
  await prisma.chatMessage.createMany({
    data: [
      { storeId: suwon.id, tableNo: "31", sender: MessageSender.STORE, text: "안녕하세요, 레드버튼 수원점입니다!\n즐거운 시간 보내시기 바랍니다.\n\n<wifi 정보>\nID: redbutton\nPW: red2563799" },
      { storeId: suwon.id, tableNo: "31", sender: MessageSender.CUSTOMER, text: "화장실 어디에요?" },
      { storeId: suwon.id, tableNo: "15", sender: MessageSender.STORE, text: "안녕하세요, 레드버튼 수원점입니다!\n즐거운 시간 보내시기 바랍니다." },
      { storeId: suwon.id, tableNo: "15", sender: MessageSender.CUSTOMER, text: "주문한 음식 언제 나와요?" },
      { storeId: suwon.id, tableNo: "7", sender: MessageSender.STORE, text: "안녕하세요, 레드버튼 수원점입니다!\n즐거운 시간 보내시기 바랍니다." },
      { storeId: suwon.id, tableNo: "22", sender: MessageSender.CUSTOMER, text: "카탄 게임 있나요?" },
      { storeId: suwon.id, tableNo: "3", sender: MessageSender.CUSTOMER, text: "와이파이 비밀번호 알려주세요" },
    ],
  });
  console.log("✅ 채팅 메시지 7건 생성");

  // ============================================
  console.log("\n🎉 전체 시드 데이터 생성 완료!");
  console.log("───────────────────────────");
  console.log(`매장: ${stores.length}개`);
  console.log(`테이블: 130개`);
  console.log(`관리자: 5명`);
  console.log(`게임: ${gameIds.length}종`);
  console.log(`태그: ${allTags.length}개`);
  console.log(`메뉴: ${allMenus.length}종`);
  console.log(`추천 카테고리: 5개`);
  console.log(`이벤트: 3개`);
  console.log(`주문: 6건`);
  console.log(`테이블 세션: 10건`);
  console.log(`채팅: 7건`);
}

main()
  .catch((e) => {
    console.error("❌ 시드 실행 실패:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
