import { PrismaClient, CategoryType, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ============================================
  // 1. 매장 & 테이블
  // ============================================
  const store = await prisma.store.create({
    data: {
      name: "레드버튼 강남점",
      address: "서울특별시 강남구 테헤란로 123",
      phone: "02-1234-5678",
      tables: {
        create: [
          { tableNo: "A1", seats: 4 },
          { tableNo: "A2", seats: 4 },
          { tableNo: "A3", seats: 6 },
          { tableNo: "B1", seats: 2 },
          { tableNo: "B2", seats: 2 },
          { tableNo: "B3", seats: 8 },
        ],
      },
    },
  });
  console.log(`✅ 매장 생성: ${store.name} (테이블 6개)`);

  // ============================================
  // 2. 카테고리 (게임 + F&B)
  // ============================================
  const gameCategories = await Promise.all(
    ["전략", "추리", "파티", "협동", "카드"].map((name, i) =>
      prisma.category.create({
        data: { type: CategoryType.GAME, name, displayOrder: i },
      })
    )
  );

  const foodCategories = await Promise.all(
    ["떡볶이", "스낵", "음료"].map((name, i) =>
      prisma.category.create({
        data: { type: CategoryType.FOOD, name, displayOrder: i },
      })
    )
  );
  console.log(`✅ 카테고리: 게임 ${gameCategories.length}개, F&B ${foodCategories.length}개`);

  // ============================================
  // 3. 태그
  // ============================================
  const tagData = [
    { group: "player_count", value: "2인", displayOrder: 0 },
    { group: "player_count", value: "3~4인", displayOrder: 1 },
    { group: "player_count", value: "5인 이상", displayOrder: 2 },
    { group: "genre", value: "전략", displayOrder: 0 },
    { group: "genre", value: "추리", displayOrder: 1 },
    { group: "genre", value: "파티", displayOrder: 2 },
    { group: "genre", value: "블러핑", displayOrder: 3 },
    { group: "genre", value: "협동", displayOrder: 4 },
    { group: "theme", value: "중세", displayOrder: 0 },
    { group: "theme", value: "SF", displayOrder: 1 },
    { group: "theme", value: "공포", displayOrder: 2 },
    { group: "theme", value: "일상", displayOrder: 3 },
  ];

  const tags = await Promise.all(
    tagData.map((t) => prisma.tag.create({ data: t }))
  );
  const tagMap = new Map(tags.map((t) => [`${t.group}:${t.value}`, t.id]));
  const findTag = (group: string, value: string) => tagMap.get(`${group}:${value}`)!;
  console.log(`✅ 태그: ${tags.length}개`);

  // ============================================
  // 4. 보드게임 + 태그 연결
  // ============================================
  const gamesData = [
    {
      categoryId: gameCategories[0].id,
      title: "카탄",
      description: "자원을 모으고 교역하며 카탄 섬을 개척하는 전략 보드게임.",
      thumbnailUrl: "/images/games/catan.jpg",
      videoUrl: "https://www.youtube.com/watch?v=example_catan",
      minPlayers: 3, maxPlayers: 4, playTime: 75,
      difficulty: Difficulty.MEDIUM,
      tagKeys: [["player_count", "3~4인"], ["genre", "전략"], ["theme", "중세"]],
    },
    {
      categoryId: gameCategories[0].id,
      title: "스플렌더",
      description: "보석 토큰을 수집하고 발전 카드를 구매하여 점수를 모으는 엔진 빌딩 게임.",
      thumbnailUrl: "/images/games/splendor.jpg",
      videoUrl: "https://www.youtube.com/watch?v=example_splendor",
      minPlayers: 2, maxPlayers: 4, playTime: 30,
      difficulty: Difficulty.EASY,
      tagKeys: [["player_count", "2인"], ["player_count", "3~4인"], ["genre", "전략"]],
    },
    {
      categoryId: gameCategories[1].id,
      title: "클루",
      description: "살인 사건의 범인, 흉기, 장소를 추리하는 고전 보드게임.",
      thumbnailUrl: "/images/games/clue.jpg",
      videoUrl: "https://www.youtube.com/watch?v=example_clue",
      minPlayers: 3, maxPlayers: 6, playTime: 45,
      difficulty: Difficulty.EASY,
      tagKeys: [["player_count", "3~4인"], ["player_count", "5인 이상"], ["genre", "추리"]],
    },
    {
      categoryId: gameCategories[1].id,
      title: "디셉션: 홍콩 살인사건",
      description: "법의학자의 힌트를 통해 살인범을 찾아내는 정체 숨김 추리 게임.",
      thumbnailUrl: "/images/games/deception.jpg",
      videoUrl: "https://www.youtube.com/watch?v=example_deception",
      minPlayers: 4, maxPlayers: 12, playTime: 20,
      difficulty: Difficulty.MEDIUM,
      tagKeys: [["player_count", "3~4인"], ["player_count", "5인 이상"], ["genre", "추리"], ["genre", "블러핑"]],
    },
    {
      categoryId: gameCategories[2].id,
      title: "텔레스트레이션",
      description: "그림과 단어를 번갈아 전달하며 벌어지는 유쾌한 파티 게임.",
      thumbnailUrl: "/images/games/telestrations.jpg",
      videoUrl: "https://www.youtube.com/watch?v=example_telestrations",
      minPlayers: 4, maxPlayers: 8, playTime: 30,
      difficulty: Difficulty.EASY,
      tagKeys: [["player_count", "3~4인"], ["player_count", "5인 이상"], ["genre", "파티"], ["theme", "일상"]],
    },
    {
      categoryId: gameCategories[2].id,
      title: "코드네임",
      description: "팀 대결로 스파이마스터의 힌트를 통해 코드명을 맞추는 단어 게임.",
      thumbnailUrl: "/images/games/codenames.jpg",
      videoUrl: "https://www.youtube.com/watch?v=example_codenames",
      minPlayers: 4, maxPlayers: 8, playTime: 15,
      difficulty: Difficulty.EASY,
      tagKeys: [["player_count", "3~4인"], ["player_count", "5인 이상"], ["genre", "파티"]],
    },
    {
      categoryId: gameCategories[3].id,
      title: "팬데믹",
      description: "전 세계에 퍼지는 전염병을 막기 위해 팀원이 협력하는 협동 게임.",
      thumbnailUrl: "/images/games/pandemic.jpg",
      videoUrl: "https://www.youtube.com/watch?v=example_pandemic",
      minPlayers: 2, maxPlayers: 4, playTime: 45,
      difficulty: Difficulty.MEDIUM,
      tagKeys: [["player_count", "2인"], ["player_count", "3~4인"], ["genre", "협동"], ["genre", "전략"]],
    },
    {
      categoryId: gameCategories[4].id,
      title: "러브레터",
      description: "단 16장의 카드로 펼치는 심리전. 공주에게 편지를 전달하라!",
      thumbnailUrl: "/images/games/loveletter.jpg",
      videoUrl: "https://www.youtube.com/watch?v=example_loveletter",
      minPlayers: 2, maxPlayers: 4, playTime: 20,
      difficulty: Difficulty.EASY,
      tagKeys: [["player_count", "2인"], ["player_count", "3~4인"], ["genre", "블러핑"], ["theme", "중세"]],
    },
  ];

  for (const { tagKeys, ...gameFields } of gamesData) {
    await prisma.game.create({
      data: {
        ...gameFields,
        tags: {
          create: tagKeys.map(([group, value]) => ({
            tagId: findTag(group, value),
          })),
        },
      },
    });
  }
  console.log(`✅ 게임: ${gamesData.length}개 (태그 연결 완료)`);

  // ============================================
  // 5. F&B 메뉴 + 옵션
  // ============================================
  const [catTteok, catSnack, catDrink] = foodCategories;

  await prisma.menu.create({
    data: {
      categoryId: catTteok.id, name: "로제 떡볶이",
      description: "부드러운 크림 로제 소스에 쫄깃한 떡볶이",
      imageUrl: "/images/menu/rose-tteok.jpg", basePrice: 8900, displayOrder: 0,
      optionGroups: {
        create: [
          {
            name: "맛 선택", isRequired: true, maxSelect: 1, displayOrder: 0,
            options: {
              create: [
                { name: "순한맛", extraPrice: 0, displayOrder: 0 },
                { name: "보통맛", extraPrice: 0, displayOrder: 1 },
                { name: "매운맛", extraPrice: 0, displayOrder: 2 },
              ],
            },
          },
          {
            name: "토핑 추가", isRequired: false, maxSelect: 3, displayOrder: 1,
            options: {
              create: [
                { name: "치즈", extraPrice: 1500, displayOrder: 0 },
                { name: "베이컨", extraPrice: 2000, displayOrder: 1 },
                { name: "떡 추가", extraPrice: 1000, displayOrder: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.menu.create({
    data: {
      categoryId: catTteok.id, name: "오리지널 떡볶이",
      description: "매콤달콤한 전통 떡볶이",
      imageUrl: "/images/menu/original-tteok.jpg", basePrice: 7500, displayOrder: 1,
      optionGroups: {
        create: [{
          name: "맛 선택", isRequired: true, maxSelect: 1, displayOrder: 0,
          options: {
            create: [
              { name: "보통맛", extraPrice: 0, displayOrder: 0 },
              { name: "매운맛", extraPrice: 0, displayOrder: 1 },
              { name: "극매운맛", extraPrice: 500, displayOrder: 2 },
            ],
          },
        }],
      },
    },
  });

  await prisma.menu.create({
    data: {
      categoryId: catSnack.id, name: "치즈볼",
      description: "겉바속촉 모짜렐라 치즈볼 6개",
      imageUrl: "/images/menu/cheese-ball.jpg", basePrice: 5500, displayOrder: 0,
    },
  });

  await prisma.menu.create({
    data: {
      categoryId: catSnack.id, name: "감자튀김",
      description: "바삭한 감자튀김",
      imageUrl: "/images/menu/fries.jpg", basePrice: 4500, displayOrder: 1,
      optionGroups: {
        create: [
          {
            name: "사이즈", isRequired: true, maxSelect: 1, displayOrder: 0,
            options: {
              create: [
                { name: "레귤러", extraPrice: 0, displayOrder: 0 },
                { name: "라지", extraPrice: 1500, displayOrder: 1 },
              ],
            },
          },
          {
            name: "소스 선택", isRequired: false, maxSelect: 2, displayOrder: 1,
            options: {
              create: [
                { name: "케첩", extraPrice: 0, displayOrder: 0 },
                { name: "치즈소스", extraPrice: 500, displayOrder: 1 },
                { name: "갈릭소스", extraPrice: 500, displayOrder: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.menu.create({
    data: {
      categoryId: catSnack.id, name: "소떡소떡",
      description: "소시지와 떡의 환상 조합",
      imageUrl: "/images/menu/soteok.jpg", basePrice: 4000, displayOrder: 2,
    },
  });

  const drinks = [
    { name: "콜라", basePrice: 2500, displayOrder: 0 },
    { name: "사이다", basePrice: 2500, displayOrder: 1 },
    { name: "아메리카노", basePrice: 3500, displayOrder: 2 },
    { name: "자몽에이드", basePrice: 4500, displayOrder: 3 },
    { name: "망고스무디", basePrice: 5000, displayOrder: 4 },
  ];
  for (const drink of drinks) {
    await prisma.menu.create({
      data: {
        categoryId: catDrink.id, ...drink,
        imageUrl: `/images/menu/${drink.name}.jpg`,
      },
    });
  }
  console.log("✅ F&B 메뉴 생성 완료");

  console.log("\n🎉 시드 데이터 생성 완료!");
}

main()
  .catch((e) => {
    console.error("❌ 시드 실행 실패:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
