/**
 * Prisma Seed Script
 * mock.ts + mock-admin.ts 데이터를 실제 DB에 삽입
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...\n");

  // ============================================
  // 0. 기존 데이터 정리 (순서 중요: FK 의존성)
  // ============================================
  console.log(" Cleaning existing data...");
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
  await prisma.menuOption.deleteMany();
  await prisma.menuOptionGroup.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.game.deleteMany();
  await prisma.event.deleteMany();
  await prisma.table.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.store.deleteMany();

  // ============================================
  // 1. 매장 (Stores)
  // ============================================
  console.log("Creating stores...");
  const stores = await Promise.all([
    prisma.store.create({
      data: {
        id: 1, name: "수원점", address: "경기도 수원시 팔달구 인계로 123",
        phone: "031-123-4567", wifiId: "redbutton", wifiPw: "red2563799",
        openTime: "10:00", closeTime: "23:00", storeCode: "SW", isActive: true,
      },
    }),
    prisma.store.create({
      data: {
        id: 2, name: "강남점", address: "서울특별시 강남구 테헤란로 456",
        phone: "02-234-5678", wifiId: "redbutton", wifiPw: "red1234567",
        openTime: "10:00", closeTime: "24:00", storeCode: "GN", isActive: true,
      },
    }),
    prisma.store.create({
      data: {
        id: 3, name: "홍대점", address: "서울특별시 마포구 와우산로 789",
        phone: "02-345-6789", wifiId: "redbutton", wifiPw: "red9876543",
        openTime: "11:00", closeTime: "24:00", storeCode: "HD", isActive: true,
      },
    }),
    prisma.store.create({
      data: {
        id: 4, name: "부산서면점", address: "부산광역시 부산진구 서면로 321",
        phone: "051-456-7890", wifiId: "redbutton", wifiPw: "red5555555",
        openTime: "10:00", closeTime: "23:00", storeCode: "BS", isActive: false,
      },
    }),
  ]);
  console.log(`  ${stores.length} stores created`);

  // ============================================
  // 2. 관리자 계정 (Admin Users)
  // ============================================
  console.log("Creating admin users...");
  const adminPw = await bcrypt.hash("admin1234", 10);
  const storePw = await bcrypt.hash("store1234", 10);
  const staffPw = await bcrypt.hash("staff1234", 10);
  await prisma.adminUser.createMany({
    data: [
      { id: 1, loginId: "hq", email: "admin@redbutton.co.kr", password: adminPw, name: "김본사", role: "HQ_ADMIN", storeId: null, isActive: true },
      { id: 2, loginId: "suwon", email: "suwon@redbutton.co.kr", password: storePw, name: "이수원", role: "STORE_MANAGER", storeId: 1, isActive: true },
      { id: 3, loginId: "gangnam", email: "gangnam@redbutton.co.kr", password: storePw, name: "박강남", role: "STORE_MANAGER", storeId: 2, isActive: true },
      { id: 4, loginId: "hongdae", email: "hongdae@redbutton.co.kr", password: storePw, name: "최홍대", role: "STORE_MANAGER", storeId: 3, isActive: true },
      { id: 5, loginId: "staff1", email: "staff1@redbutton.co.kr", password: staffPw, name: "정직원", role: "STORE_STAFF", storeId: 1, isActive: true },
    ],
  });
  console.log("  5 admin users created (hq/admin1234, suwon/store1234, gangnam/store1234, hongdae/store1234, staff1/staff1234)");

  // ============================================
  // 3. 테이블 (수원점 35석)
  // ============================================
  console.log("Creating tables...");

  // setupCode 생성 헬퍼: 매장코드 + 테이블번호 패딩 + 랜덤 2자리 (개발용은 고정 "AA")
  const makeSetupCode = (storeCode: string, tableNo: number) =>
    `${storeCode}${String(tableNo).padStart(2, "0")}AA`;

  const tableData = Array.from({ length: 35 }, (_, i) => ({
    storeId: 1,
    tableNo: String(i + 1),
    seats: (i + 1) % 5 === 0 ? 6 : 4,
    setupCode: makeSetupCode("SW", i + 1),
    isActive: true,
  }));
  // 강남점 40석
  for (let i = 0; i < 40; i++) {
    tableData.push({ storeId: 2, tableNo: String(i + 1), seats: i % 4 === 0 ? 6 : 4, setupCode: makeSetupCode("GN", i + 1), isActive: true });
  }
  // 홍대점 30석
  for (let i = 0; i < 30; i++) {
    tableData.push({ storeId: 3, tableNo: String(i + 1), seats: 4, setupCode: makeSetupCode("HD", i + 1), isActive: true });
  }
  // 부산점 25석
  for (let i = 0; i < 25; i++) {
    tableData.push({ storeId: 4, tableNo: String(i + 1), seats: 4, setupCode: makeSetupCode("BS", i + 1), isActive: true });
  }
  await prisma.table.createMany({ data: tableData });
  console.log(`  ${tableData.length} tables created`);

  // ============================================
  // 4. 태그 (Tags) - 게임 검색 필터
  // ============================================
  console.log(" Creating tags...");
  const genreTags = [
    "초보", "중수", "고수", "커플", "단체", "패밀리", "어린이", "전략",
    "손기술/순발력", "추리/방탈출", "주사위/운빨", "심리/눈치", "마피아",
    "협상/거래", "협동/팀전", "복불복/내기", "예능/퀴즈", "대화", "베팅", "머더미스테리",
  ];
  const playerCountTags = ["2인", "3인", "4인", "5인", "6인", "7인", "8인 이상"];
  const playTimeTags = ["15분 이내", "15-30분", "30-60분", "60분 이상"];

  const tagData = [
    ...genreTags.map((v, i) => ({ group: "genre", value: v, displayOrder: i })),
    ...playerCountTags.map((v, i) => ({ group: "player_count", value: v, displayOrder: i })),
    ...playTimeTags.map((v, i) => ({ group: "play_time", value: v, displayOrder: i })),
  ];
  await prisma.tag.createMany({ data: tagData });
  const allTags = await prisma.tag.findMany();
  const tagMap = new Map(allTags.map((t) => [`${t.group}:${t.value}`, t.id]));
  console.log(`  ${allTags.length} tags created`);

  // ============================================
  // 5. 게임 (Games) + GameTag + GameHashtag
  // ============================================
  console.log("Creating games...");

  interface GameSeed {
    id: number; title: string; description: string;
    thumbnailUrl: string; videoUrl: string;
    minPlayers: number; maxPlayers: number; recommendedPlayers: string;
    playTime: number | null; playTimeCategory: string;
    difficulty: string; defaultShelfLoc: string;
    hashtags: string[];
    tags: { group: string; value: string }[];
  }

  const gamesData: GameSeed[] = [
    { id: 1, title: "라스베가스", description: "주사위 8개로 여러분의 배짱을 테스트해 보세요. 운빨의 쾌감과 실패의 후회가 공존하는 게임!", thumbnailUrl: "/images/games/lasvegas.jpg", videoUrl: "", minPlayers: 2, maxPlayers: 5, recommendedPlayers: "3-5인", playTime: 30, playTimeCategory: "15-30분", difficulty: "EASY", defaultShelfLoc: "ㄱㄴㄷ-3", hashtags: ["감성", "내가 못 먹으면", "아무도 못먹어!"], tags: [{ group: "genre", value: "초보" }, { group: "genre", value: "주사위/운빨" }, { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" }] },
    { id: 2, title: "금지어 게임", description: "제시된 단어를 금지어를 사용하지 않고 설명해야 하는 스피드 퀴즈 게임!", thumbnailUrl: "/images/games/forbidden.jpg", videoUrl: "", minPlayers: 4, maxPlayers: 8, recommendedPlayers: "4-8인", playTime: 25, playTimeCategory: "15-30분", difficulty: "EASY", defaultShelfLoc: "ㄱㄴㄷ-5", hashtags: ["망설이는 순간", "감점되는", "스피드 퀴즈 게임"], tags: [{ group: "genre", value: "초보" }, { group: "genre", value: "예능/퀴즈" }, { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" }, { group: "player_count", value: "6인" }, { group: "player_count", value: "7인" }, { group: "player_count", value: "8인 이상" }] },
    { id: 3, title: "루미큐브", description: "숫자 타일을 조합하여 세트를 만들고 가장 먼저 모든 타일을 내려놓는 국민게임!", thumbnailUrl: "/images/games/rummikub.jpg", videoUrl: "", minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인", playTime: 45, playTimeCategory: "30-60분", difficulty: "EASY", defaultShelfLoc: "ㄱㄴㄷ-1", hashtags: ["쪼개고 붙이고 합치고", "숫자조합", "국민게임"], tags: [{ group: "genre", value: "초보" }, { group: "genre", value: "전략" }, { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" }] },
    { id: 4, title: "도미니언", description: "카드를 구매하고 덱을 빌딩하여 가장 많은 승점을 모으는 덱빌딩의 시초!", thumbnailUrl: "/images/games/dominion.jpg", videoUrl: "", minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인", playTime: 30, playTimeCategory: "30-60분", difficulty: "SEMI_HARD", defaultShelfLoc: "ㄴㄷㄹ-2", hashtags: ["전략의 정석", "조합과 콤보의 맛"], tags: [{ group: "genre", value: "중수" }, { group: "genre", value: "전략" }, { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" }] },
    { id: 5, title: "파워그리드", description: "발전소를 사들이고 도시에 전력을 공급하는 경제 전략 게임.", thumbnailUrl: "/images/games/powergrid.jpg", videoUrl: "", minPlayers: 2, maxPlayers: 6, recommendedPlayers: "3-6인", playTime: 120, playTimeCategory: "60분 이상", difficulty: "HARD", defaultShelfLoc: "ㄴㄷㄹ-4", hashtags: ["전력회사 운영", "탄탄한 현실 반영", "명품 전략"], tags: [{ group: "genre", value: "고수" }, { group: "genre", value: "전략" }, { group: "genre", value: "협상/거래" }, { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" }, { group: "player_count", value: "6인" }] },
    { id: 6, title: "임호텝", description: "고대 이집트 건축가가 되어 피라미드와 신전을 건설하라!", thumbnailUrl: "/images/games/imhotep.jpg", videoUrl: "", minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인", playTime: 40, playTimeCategory: "30-60분", difficulty: "NORMAL", defaultShelfLoc: "ㄴㄷㄹ-5", hashtags: ["제한된 상황", "최선의 노력", "눈치와 타이밍"], tags: [{ group: "genre", value: "중수" }, { group: "genre", value: "전략" }, { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" }] },
    { id: 7, title: "스트라이크", description: "주사위를 던져 같은 눈을 모으는 간단하지만 짜릿한 운빨 게임!", thumbnailUrl: "/images/games/strike.jpg", videoUrl: "", minPlayers: 2, maxPlayers: 5, recommendedPlayers: "2-5인", playTime: 15, playTimeCategory: "15분 이내", difficulty: "VERY_EASY", defaultShelfLoc: "ㅁㅂㅅ-1", hashtags: ["완전 럭키비키", "잭팟", "운빨 한판"], tags: [{ group: "genre", value: "초보" }, { group: "genre", value: "주사위/운빨" }, { group: "genre", value: "복불복/내기" }, { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" }] },
    { id: 8, title: "꼬꼬미노", description: "주사위 8개로 여러분의 배짱을 테스트해 보세요. 운빨의 쾌감과 실패의 후회가 공존하는 게임!", thumbnailUrl: "/images/games/heckmeck.jpg", videoUrl: "", minPlayers: 2, maxPlayers: 7, recommendedPlayers: "3-5인", playTime: 20, playTimeCategory: "15-30분", difficulty: "EASY", defaultShelfLoc: "ㄱㄴㄷ-6", hashtags: ["#내 것도 내 거", "#네 것도 내 거", "#다 내꺼"], tags: [{ group: "genre", value: "초보" }, { group: "genre", value: "주사위/운빨" }, { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" }, { group: "player_count", value: "6인" }, { group: "player_count", value: "7인" }] },
    { id: 9, title: "꼬치의 달인", description: "손님이 주문한 꼬치를 빠르게 만들어 봅시다!", thumbnailUrl: "/images/games/skewers.jpg", videoUrl: "", minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인", playTime: 15, playTimeCategory: "15분 이내", difficulty: "VERY_EASY", defaultShelfLoc: "ㄱㄴㄷ-6", hashtags: ["#재료를 꽂는", "#손이 안보이겠어"], tags: [{ group: "genre", value: "초보" }, { group: "genre", value: "손기술/순발력" }, { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" }] },
    { id: 10, title: "꿈의 대화", description: "서로의 꿈 속으로 들어가 단어의 연결고리를 찾아내는 추리 게임.", thumbnailUrl: "/images/games/dreamtalk.jpg", videoUrl: "", minPlayers: 4, maxPlayers: 10, recommendedPlayers: "4-8인", playTime: 30, playTimeCategory: "15-30분", difficulty: "EASY", defaultShelfLoc: "ㅁㅂㅅ-3", hashtags: ["단어 추리", "마피아"], tags: [{ group: "genre", value: "추리/방탈출" }, { group: "genre", value: "심리/눈치" }, { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" }, { group: "player_count", value: "6인" }, { group: "player_count", value: "7인" }, { group: "player_count", value: "8인 이상" }] },
    { id: 11, title: "디셉션: 홍콩 살인사건", description: "법의학자의 힌트를 통해 살인범을 찾아내는 정체 숨김 추리 게임.", thumbnailUrl: "/images/games/deception.jpg", videoUrl: "", minPlayers: 4, maxPlayers: 12, recommendedPlayers: "5-8인", playTime: 20, playTimeCategory: "15-30분", difficulty: "NORMAL", defaultShelfLoc: "ㅁㅂㅅ-4", hashtags: ["범인은 이 중에", "추리의 쾌감"], tags: [{ group: "genre", value: "추리/방탈출" }, { group: "genre", value: "마피아" }, { group: "genre", value: "심리/눈치" }, { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" }, { group: "player_count", value: "6인" }, { group: "player_count", value: "7인" }, { group: "player_count", value: "8인 이상" }] },
    { id: 12, title: "텔레스트레이션", description: "그림과 단어를 번갈아 전달하며 벌어지는 유쾌한 파티 게임.", thumbnailUrl: "/images/games/telestrations.jpg", videoUrl: "", minPlayers: 4, maxPlayers: 8, recommendedPlayers: "4-8인", playTime: 30, playTimeCategory: "15-30분", difficulty: "VERY_EASY", defaultShelfLoc: "ㅇㅈㅊ-1", hashtags: ["그림 실력 무관", "웃음 보장"], tags: [{ group: "genre", value: "초보" }, { group: "genre", value: "대화" }, { group: "genre", value: "예능/퀴즈" }, { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" }, { group: "player_count", value: "6인" }, { group: "player_count", value: "7인" }, { group: "player_count", value: "8인 이상" }] },
    { id: 13, title: "코드네임", description: "팀 대결로 스파이마스터의 힌트 한 단어로 여러 코드명을 맞추는 단어 추리 게임.", thumbnailUrl: "/images/games/codenames.jpg", videoUrl: "", minPlayers: 4, maxPlayers: 8, recommendedPlayers: "4-8인", playTime: 15, playTimeCategory: "15분 이내", difficulty: "EASY", defaultShelfLoc: "ㅇㅈㅊ-2", hashtags: ["단어 하나로", "팀 대결"], tags: [{ group: "genre", value: "초보" }, { group: "genre", value: "대화" }, { group: "genre", value: "협동/팀전" }, { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" }, { group: "player_count", value: "6인" }, { group: "player_count", value: "7인" }, { group: "player_count", value: "8인 이상" }] },
    { id: 14, title: "스플렌더", description: "보석 토큰을 수집하고 발전 카드를 구매하여 점수를 모으는 엔진 빌딩 게임.", thumbnailUrl: "/images/games/splendor.jpg", videoUrl: "", minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-3인", playTime: 30, playTimeCategory: "30-60분", difficulty: "EASY", defaultShelfLoc: "ㅇㅈㅊ-5", hashtags: ["보석 수집", "엔진 빌딩"], tags: [{ group: "genre", value: "커플" }, { group: "genre", value: "전략" }, { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" }] },
    { id: 15, title: "패치워크", description: "두 사람이 천 조각을 모아 가장 아름다운 퀼트를 완성하는 2인 전용 전략 게임.", thumbnailUrl: "/images/games/patchwork.jpg", videoUrl: "", minPlayers: 2, maxPlayers: 2, recommendedPlayers: "2인", playTime: 30, playTimeCategory: "15-30분", difficulty: "EASY", defaultShelfLoc: "ㅇㅈㅊ-6", hashtags: ["둘만의 시간", "퀼트 대결"], tags: [{ group: "genre", value: "커플" }, { group: "genre", value: "전략" }, { group: "player_count", value: "2인" }] },
    { id: 16, title: "라이헌트", description: "이것은 보통의 마피아 게임이 아닙니다. 숨겨진 트롤이 몰래 혼돈을 부추기고 있습니다!", thumbnailUrl: "/images/games/liehunt.jpg", videoUrl: "", minPlayers: 3, maxPlayers: 8, recommendedPlayers: "4-7인", playTime: 20, playTimeCategory: "15-30분", difficulty: "EASY", defaultShelfLoc: "ㅁㅂㅅ-6", hashtags: ["트롤을 찾아라", "거짓말 탐지"], tags: [{ group: "genre", value: "마피아" }, { group: "genre", value: "심리/눈치" }, { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" }, { group: "player_count", value: "6인" }, { group: "player_count", value: "7인" }, { group: "player_count", value: "8인 이상" }] },
    { id: 17, title: "팬데믹", description: "전 세계에 퍼지는 전염병을 막기 위해 팀원이 협력하는 협동 게임.", thumbnailUrl: "/images/games/pandemic.jpg", videoUrl: "", minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인", playTime: 45, playTimeCategory: "30-60분", difficulty: "SEMI_HARD", defaultShelfLoc: "ㅋㅌㅍ-1", hashtags: ["함께 살아남자", "협동의 묘미"], tags: [{ group: "genre", value: "협동/팀전" }, { group: "genre", value: "전략" }, { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" }] },
    { id: 18, title: "카탄", description: "자원을 모으고 교역하며 카탄 섬을 개척하는 전략 보드게임의 바이블.", thumbnailUrl: "/images/games/catan.jpg", videoUrl: "", minPlayers: 3, maxPlayers: 4, recommendedPlayers: "3-4인", playTime: 75, playTimeCategory: "60분 이상", difficulty: "NORMAL", defaultShelfLoc: "ㅋㅌㅍ-3", hashtags: ["자원 교역", "섬 개척", "보드게임의 정석"], tags: [{ group: "genre", value: "중수" }, { group: "genre", value: "전략" }, { group: "genre", value: "협상/거래" }, { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" }] },
    { id: 19, title: "카멜업", description: "낙타 경주에 베팅하며 짜릿한 도박의 쾌감을 느껴보세요!", thumbnailUrl: "/images/games/camelup.jpg", videoUrl: "", minPlayers: 3, maxPlayers: 8, recommendedPlayers: "3-6인", playTime: 30, playTimeCategory: "15-30분", difficulty: "EASY", defaultShelfLoc: "ㅁㅂㅅ-2", hashtags: ["낙타 경주", "배팅의 쾌감"], tags: [{ group: "genre", value: "베팅" }, { group: "genre", value: "주사위/운빨" }, { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" }, { group: "player_count", value: "5인" }, { group: "player_count", value: "6인" }, { group: "player_count", value: "7인" }, { group: "player_count", value: "8인 이상" }] },
    { id: 20, title: "러브레터", description: "단 16장의 카드로 펼치는 심리전. 공주에게 편지를 전달하라!", thumbnailUrl: "/images/games/loveletter.jpg", videoUrl: "", minPlayers: 2, maxPlayers: 4, recommendedPlayers: "2-4인", playTime: 20, playTimeCategory: "15-30분", difficulty: "EASY", defaultShelfLoc: "ㅇㅈㅊ-3", hashtags: ["심리전", "16장의 마법"], tags: [{ group: "genre", value: "커플" }, { group: "genre", value: "심리/눈치" }, { group: "player_count", value: "2인" }, { group: "player_count", value: "3인" }, { group: "player_count", value: "4인" }] },
  ];

  for (const g of gamesData) {
    await prisma.game.create({
      data: {
        id: g.id, title: g.title, description: g.description,
        thumbnailUrl: g.thumbnailUrl, videoUrl: g.videoUrl,
        minPlayers: g.minPlayers, maxPlayers: g.maxPlayers,
        recommendedPlayers: g.recommendedPlayers,
        playTime: g.playTime, playTimeCategory: g.playTimeCategory,
        difficulty: g.difficulty, defaultShelfLoc: g.defaultShelfLoc,
        isActive: true,
        tags: {
          create: g.tags
            .map((t) => ({ tagId: tagMap.get(`${t.group}:${t.value}`)! }))
            .filter((t) => t.tagId),
        },
        hashtags: {
          create: g.hashtags.map((text, i) => ({ text, order: i })),
        },
      },
    });
  }
  console.log(`  ${gamesData.length} games created with tags & hashtags`);

  // ============================================
  // 6. F&B 카테고리 + 메뉴 + 옵션
  // ============================================
  console.log("Creating categories & menus...");
  const cats = await Promise.all([
    prisma.category.create({ data: { id: 1, name: "푸드", displayOrder: 0 } }),
    prisma.category.create({ data: { id: 2, name: "음료", displayOrder: 1 } }),
    prisma.category.create({ data: { id: 3, name: "벌칙메뉴", displayOrder: 2 } }),
    prisma.category.create({ data: { id: 4, name: "MD상품", displayOrder: 3 } }),
  ]);
  const catMap: Record<string, number> = { "푸드": 1, "음료": 2, "벌칙메뉴": 3, "MD상품": 4 };

  interface MenuSeed {
    id: number; categoryName: string; name: string; description: string;
    imageUrl: string; basePrice: number; isNew: boolean; isBest: boolean;
    optionGroups: { name: string; isRequired: boolean; maxSelect: number;
      options: { name: string; extraPrice: number }[] }[];
  }

  const menusData: MenuSeed[] = [
    { id: 1, categoryName: "푸드", name: "마라떡볶이", description: "얼얼한 마라소스에 쫄깃한 떡볶이", imageUrl: "/images/menu/mara-tteok.jpg", basePrice: 9500, isNew: true, isBest: false, optionGroups: [{ name: "맛 선택", isRequired: true, maxSelect: 1, options: [{ name: "순한맛", extraPrice: 0 }, { name: "보통맛", extraPrice: 0 }, { name: "매운맛", extraPrice: 0 }] }] },
    { id: 2, categoryName: "푸드", name: "피자떡볶이", description: "치즈 듬뿍 피자소스 떡볶이", imageUrl: "/images/menu/pizza-tteok.jpg", basePrice: 9500, isNew: true, isBest: false, optionGroups: [] },
    { id: 3, categoryName: "푸드", name: "크리스피 콜팝", description: "바삭한 치킨과 콜라의 환상 콤보", imageUrl: "/images/menu/crispy-colpop.jpg", basePrice: 6500, isNew: true, isBest: true, optionGroups: [] },
    { id: 4, categoryName: "푸드", name: "매콤마요 콜팝", description: "매콤한 양념과 마요네즈의 조화", imageUrl: "/images/menu/spicy-mayo-colpop.jpg", basePrice: 6500, isNew: true, isBest: false, optionGroups: [] },
    { id: 5, categoryName: "푸드", name: "치즈볼", description: "겉바속촉 모짜렐라 치즈볼 6개", imageUrl: "/images/menu/cheese-ball.jpg", basePrice: 5500, isNew: false, isBest: true, optionGroups: [] },
    { id: 6, categoryName: "푸드", name: "감자튀김", description: "바삭한 감자튀김", imageUrl: "/images/menu/fries.jpg", basePrice: 4500, isNew: false, isBest: true, optionGroups: [{ name: "사이즈", isRequired: true, maxSelect: 1, options: [{ name: "레귤러", extraPrice: 0 }, { name: "라지", extraPrice: 1500 }] }] },
    { id: 7, categoryName: "음료", name: "스트로베리 레몬티", description: "상큼한 딸기와 레몬의 만남", imageUrl: "/images/menu/strawberry-lemon.jpg", basePrice: 5500, isNew: true, isBest: false, optionGroups: [] },
    { id: 8, categoryName: "음료", name: "제로 복숭아 아이스티", description: "제로 칼로리 복숭아 아이스티", imageUrl: "/images/menu/peach-icetea.jpg", basePrice: 4300, isNew: false, isBest: true, optionGroups: [] },
    { id: 9, categoryName: "음료", name: "콜라", description: "", imageUrl: "/images/menu/cola.jpg", basePrice: 2500, isNew: false, isBest: false, optionGroups: [] },
    { id: 10, categoryName: "음료", name: "사이다", description: "", imageUrl: "/images/menu/cider.jpg", basePrice: 2500, isNew: false, isBest: false, optionGroups: [] },
    { id: 11, categoryName: "음료", name: "아메리카노", description: "", imageUrl: "/images/menu/americano.jpg", basePrice: 3500, isNew: false, isBest: false, optionGroups: [] },
    { id: 12, categoryName: "음료", name: "자몽에이드", description: "", imageUrl: "/images/menu/grapefruit.jpg", basePrice: 4500, isNew: false, isBest: false, optionGroups: [] },
    { id: 13, categoryName: "벌칙메뉴", name: "데스 초콜릿", description: "매운맛 초콜릿 러시안 룰렛", imageUrl: "/images/menu/death-choco.jpg", basePrice: 3000, isNew: false, isBest: true, optionGroups: [] },
    { id: 14, categoryName: "벌칙메뉴", name: "벌칙 젤리", description: "달콤할까 쓸까? 복불복 젤리", imageUrl: "/images/menu/penalty-jelly.jpg", basePrice: 2500, isNew: false, isBest: false, optionGroups: [] },
    { id: 15, categoryName: "MD상품", name: "레드버튼 텀블러", description: "레드버튼 로고 텀블러", imageUrl: "/images/menu/tumbler.jpg", basePrice: 15000, isNew: false, isBest: false, optionGroups: [] },
  ];

  for (const m of menusData) {
    await prisma.menu.create({
      data: {
        id: m.id, categoryId: catMap[m.categoryName], name: m.name,
        description: m.description, imageUrl: m.imageUrl,
        basePrice: m.basePrice, isNew: m.isNew, isBest: m.isBest,
        displayOrder: m.id, isActive: true,
        optionGroups: {
          create: m.optionGroups.map((og, gi) => ({
            name: og.name, isRequired: og.isRequired, maxSelect: og.maxSelect, displayOrder: gi,
            options: {
              create: og.options.map((o, oi) => ({
                name: o.name, extraPrice: o.extraPrice, isAvailable: true, displayOrder: oi,
              })),
            },
          })),
        },
      },
    });
  }
  console.log(`  ${menusData.length} menus created with option groups`);

  // ============================================
  // 7. 매장별 게임 보유 (StoreGame) - 수원점
  // ============================================
  console.log("Creating store games (수원점)...");
  const storeGameIds = [1, 2, 3, 4, 7, 8, 9, 10, 12, 13, 14, 16, 18, 19, 20];
  await prisma.storeGame.createMany({
    data: storeGameIds.map((gameId) => ({
      storeId: 1, gameId,
      isVisible: gameId !== 10, // 꿈의 대화만 비노출
      shelfLocation: gameId === 4 ? "ㅁ-2" : null, // 도미니언만 오버라이드
    })),
  });
  console.log(`  ${storeGameIds.length} store games linked`);

  // ============================================
  // 8. 매장별 메뉴 (StoreMenu) - 수원점 전체 메뉴 판매
  // ============================================
  console.log(" Creating store menus (수원점)...");
  await prisma.storeMenu.createMany({
    data: menusData.map((m) => ({
      storeId: 1, menuId: m.id, isAvailable: true, priceOverride: null,
    })),
  });
  console.log(`  ${menusData.length} store menus linked`);

  // ============================================
  // 9. 추천 카테고리 (홈 화면)
  // ============================================
  console.log("⭐ Creating recommend categories...");
  const recommendData = [
    { id: 1, title: "입문자를 위해 엄선한 재미보장 보드게임", subtitle: "보드게임이 처음이시라면, 이 게임 어떠세요?", emoji: "", gameIds: [1, 2, 3, 8, 9, 7] },
    { id: 2, title: "수 싸움의 미학 전략게임.zip", subtitle: "", emoji: "", gameIds: [4, 5, 6, 18, 14] },
    { id: 3, title: "완전 럭키비키잖아? 잭팟이 터지는 순간", subtitle: "", emoji: "", gameIds: [7, 8, 19, 1] },
    { id: 4, title: "다 같이 떠들어! 단체 파티게임 모음", subtitle: "", emoji: "", gameIds: [2, 12, 13, 10, 16] },
    { id: 5, title: "둘만의 보드게임 커플 추천 TOP", subtitle: "", emoji: "", gameIds: [15, 14, 20, 3] },
  ];
  for (const rc of recommendData) {
    await prisma.recommendCategory.create({
      data: {
        id: rc.id, title: rc.title, subtitle: rc.subtitle, emoji: rc.emoji,
        order: rc.id - 1, isActive: true,
        items: {
          create: rc.gameIds.map((gameId, i) => ({ gameId, order: i })),
        },
      },
    });
  }
  console.log(`  ${recommendData.length} recommend categories created`);

  // ============================================
  // 10. 이벤트 배너
  // ============================================
  console.log("Creating events...");
  await prisma.event.createMany({
    data: [
      { id: 1, title: "LIAR & TROLL SHOW", subtitle: "레드버튼 오리지널 게임 세번째 시리즈 공개!", imageUrl: "/images/events/liehunt.jpg", order: 0, isActive: true, startDate: new Date("2026-01-15"), endDate: new Date("2026-02-28") },
      { id: 2, title: "Feel the NEW Tasty Rush!", subtitle: "새로운 맛의 짜릿한 순간을 느껴봐!", imageUrl: "/images/events/tasty-rush.jpg", order: 1, isActive: true, startDate: new Date("2026-02-01"), endDate: new Date("2026-02-28") },
      { id: 3, title: "발렌타인 커플 이벤트", subtitle: "커플 보드게임 추천 + 음료 할인", imageUrl: "/images/events/valentine.jpg", order: 2, isActive: true, startDate: new Date("2026-02-10"), endDate: new Date("2026-02-18") },
      { id: 4, title: "설날 특별 이벤트", subtitle: "가족과 함께하는 보드게임", imageUrl: "/images/events/newyear.jpg", order: 3, isActive: false, startDate: new Date("2026-01-28"), endDate: new Date("2026-01-30") },
    ],
  });
  console.log("  4 events created");

  // ============================================
  // 11. 테이블 세션 (수원점 - 현재 이용중인 테이블)
  // ============================================
  console.log("Creating table sessions...");
  const occupiedTables = [1, 3, 7, 11, 15, 18, 22, 25, 28, 31];
  const suwonTables = await prisma.table.findMany({ where: { storeId: 1 } });
  const tableIdMap = new Map(suwonTables.map((t) => [parseInt(t.tableNo), t.id]));

  for (const tNo of occupiedTables) {
    const tableId = tableIdMap.get(tNo);
    if (!tableId) continue;
    const elapsed = Math.floor(Math.random() * 120) + 10;
    await prisma.tableSession.create({
      data: {
        storeId: 1, tableId,
        checkInAt: new Date(Date.now() - elapsed * 60 * 1000),
        guestCount: Math.floor(Math.random() * 4) + 2,
      },
    });
  }
  console.log(`  ${occupiedTables.length} active sessions created`);

  // ============================================
  // 12. 주문 (수원점)
  // ============================================
  console.log("Creating orders...");
  const orderSeeds = [
    { tableNo: "31", status: "PENDING", minutesAgo: 2, items: [{ menuId: 1, menuName: "마라떡볶이", basePrice: 9500, quantity: 1 }, { menuId: 9, menuName: "콜라", basePrice: 2500, quantity: 2 }] },
    { tableNo: "15", status: "PENDING", minutesAgo: 6, items: [{ menuId: 3, menuName: "크리스피 콜팝", basePrice: 6500, quantity: 3 }, { menuId: 8, menuName: "제로 복숭아 아이스티", basePrice: 4300, quantity: 1 }] },
    { tableNo: "7", status: "PREPARING", minutesAgo: 19, items: [{ menuId: 2, menuName: "피자떡볶이", basePrice: 9500, quantity: 1 }] },
    { tableNo: "22", status: "PREPARING", minutesAgo: 25, items: [{ menuId: 1, menuName: "마라떡볶이", basePrice: 9500, quantity: 1 }, { menuId: 6, menuName: "감자튀김", basePrice: 6000, quantity: 1 }, { menuId: 9, menuName: "콜라", basePrice: 2500, quantity: 1 }] },
    { tableNo: "3", status: "CONFIRMED", minutesAgo: 30, items: [{ menuId: 5, menuName: "치즈볼", basePrice: 5500, quantity: 2 }] },
    { tableNo: "18", status: "COMPLETED", minutesAgo: 45, items: [{ menuId: 11, menuName: "아메리카노", basePrice: 3500, quantity: 1 }, { menuId: 12, menuName: "자몽에이드", basePrice: 4500, quantity: 1 }] },
    { tableNo: "11", status: "COMPLETED", minutesAgo: 60, items: [{ menuId: 1, menuName: "마라떡볶이", basePrice: 9500, quantity: 1 }, { menuId: 3, menuName: "크리스피 콜팝", basePrice: 6500, quantity: 1 }] },
  ];

  for (const os of orderSeeds) {
    const tableId = tableIdMap.get(parseInt(os.tableNo));
    if (!tableId) continue;
    const totalPrice = os.items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
    await prisma.order.create({
      data: {
        storeId: 1, tableId, status: os.status, totalPrice,
        orderedAt: new Date(Date.now() - os.minutesAgo * 60 * 1000),
        items: {
          create: os.items.map((item) => ({
            menuId: item.menuId, menuName: item.menuName,
            basePrice: item.basePrice, quantity: item.quantity,
            subTotal: item.basePrice * item.quantity,
          })),
        },
      },
    });
  }
  console.log(`  ${orderSeeds.length} orders created`);

  // ============================================
  // 13. 카운터 쪽지 (채팅 메시지)
  // ============================================
  console.log("Creating chat messages...");
  const chatSeeds = [
    { tableNo: "31", messages: [
      { sender: "STORE", text: "안녕하세요, 레드버튼 수원점입니다!\n즐거운 시간 보내시기 바라요.\n<wifi 정보>\nID: redbutton\nPW: red2563799", minutesAgo: 9 },
      { sender: "CUSTOMER", text: "화장실 어디에요?", minutesAgo: 2 },
    ]},
    { tableNo: "15", messages: [
      { sender: "STORE", text: "안녕하세요, 레드버튼 수원점입니다!\n즐거운 시간 보내시기 바라요.\n<wifi 정보>\nID: redbutton\nPW: red2563799", minutesAgo: 12 },
      { sender: "CUSTOMER", text: "주문한 음식 언제 나와요?", minutesAgo: 6 },
    ]},
    { tableNo: "7", messages: [
      { sender: "STORE", text: "안녕하세요, 레드버튼 수원점입니다!\n즐거운 시간 보내시기 바라요.\n<wifi 정보>\nID: redbutton\nPW: red2563799", minutesAgo: 12 },
      { sender: "CUSTOMER", text: "안녕하세요, 레드버튼은 수원점...", minutesAgo: 10 },
    ]},
    { tableNo: "22", messages: [
      { sender: "CUSTOMER", text: "가장 게임 있나요?", minutesAgo: 8 },
    ]},
    { tableNo: "3", messages: [
      { sender: "CUSTOMER", text: "와이파이 비밀번호 알려주세요", minutesAgo: 15 },
    ]},
  ];

  for (const cs of chatSeeds) {
    for (const msg of cs.messages) {
      await prisma.chatMessage.create({
        data: {
          storeId: 1, tableNo: cs.tableNo, sender: msg.sender,
          text: msg.text, isRead: msg.sender === "STORE",
          createdAt: new Date(Date.now() - msg.minutesAgo * 60 * 1000),
        },
      });
    }
  }
  console.log("  Chat messages created");

  // ============================================
  // Done!
  // ============================================
  console.log("\nSeed completed successfully!");
  console.log("   - 4 stores, 130 tables");
  console.log("   - 5 admin users");
  console.log("   - 31 tags, 20 games");
  console.log("   - 4 categories, 15 menus");
  console.log("   - 5 recommend categories");
  console.log("   - 4 events");
  console.log("   - 10 table sessions, 7 orders");
  console.log("   - Chat messages for 5 tables");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
