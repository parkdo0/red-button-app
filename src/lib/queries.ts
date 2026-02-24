/**
 * Server-side 데이터 조회 함수
 * Next.js Server Component에서 직접 호출
 */
import { prisma } from "./prisma";

// ─── 매장 정보 ───
export async function getStore(storeId: number) {
  return prisma.store.findUnique({
    where: { id: storeId },
  });
}

// ─── 추천 게임 카테고리 (홈 화면) ───
export async function getRecommendCategories(storeId: number) {
  const categories = await prisma.recommendCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: {
          // RecommendCategoryItem에는 game relation이 없으므로 gameId로 별도 조회
        },
      },
    },
  });

  // 각 카테고리의 게임을 storeGame 기준으로 조회 (visible한 것만)
  const result = await Promise.all(
    categories.map(async (cat) => {
      const gameIds = cat.items.map((item) => item.gameId);
      const games = await prisma.game.findMany({
        where: {
          id: { in: gameIds },
          isActive: true,
          storeGames: {
            some: { storeId, isVisible: true },
          },
        },
        include: {
          hashtags: { orderBy: { order: "asc" } },
          tags: { include: { tag: true } },
          storeGames: { where: { storeId } },
        },
      });

      // 원래 순서대로 정렬
      const sortedGames = gameIds
        .map((gid) => games.find((g) => g.id === gid))
        .filter(Boolean);

      return {
        id: cat.id.toString(),
        title: cat.title,
        subtitle: cat.subtitle,
        emoji: cat.emoji,
        games: sortedGames.map((g) => formatGame(g!, storeId)),
      };
    })
  );

  return result;
}

// ─── 게임 검색/필터 ───
export async function searchGames(
  storeId: number,
  filters: {
    search?: string;
    genres?: string[];
    playerCounts?: string[];
    difficulties?: string[];
    playTimes?: string[];
  }
) {
  const { search, genres, playerCounts, difficulties, playTimes } = filters;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    isActive: true,
    storeGames: { some: { storeId, isVisible: true } },
  };

  if (search) {
    where.title = { contains: search };
  }

  if (difficulties && difficulties.length > 0) {
    where.difficulty = { in: difficulties };
  }

  if (playTimes && playTimes.length > 0) {
    where.playTimeCategory = { in: playTimes };
  }

  const tagFilters = [];
  if (genres && genres.length > 0) {
    tagFilters.push({
      tags: { some: { tag: { group: "genre", value: { in: genres } } } },
    });
  }
  if (playerCounts && playerCounts.length > 0) {
    tagFilters.push({
      tags: { some: { tag: { group: "player_count", value: { in: playerCounts } } } },
    });
  }
  if (tagFilters.length > 0) {
    where.AND = tagFilters;
  }

  const games = await prisma.game.findMany({
    where,
    include: {
      hashtags: { orderBy: { order: "asc" } },
      tags: { include: { tag: true } },
      storeGames: { where: { storeId } },
    },
    orderBy: { title: "asc" },
  });

  return games.map((g) => formatGame(g, storeId));
}

// ─── 게임 상세 ───
export async function getGame(gameId: number, storeId: number) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      hashtags: { orderBy: { order: "asc" } },
      tags: { include: { tag: true } },
      storeGames: { where: { storeId } },
    },
  });
  if (!game) return null;
  return formatGame(game, storeId);
}

// ─── 태그 목록 (필터 UI용) ───
export async function getTags() {
  return prisma.tag.findMany({
    orderBy: [{ group: "asc" }, { displayOrder: "asc" }],
  });
}

// ─── F&B 메뉴 ───
export async function getMenus(storeId: number) {
  const menus = await prisma.menu.findMany({
    where: { isActive: true },
    include: {
      category: true,
      optionGroups: {
        orderBy: { displayOrder: "asc" },
        include: {
          options: { orderBy: { displayOrder: "asc" } },
        },
      },
      storeMenus: { where: { storeId } },
    },
    orderBy: [{ category: { displayOrder: "asc" } }, { displayOrder: "asc" }],
  });

  return menus.map((m) => {
    const storeMenu = m.storeMenus[0];
    return {
      id: m.id,
      categoryName: m.category.name,
      name: m.name,
      description: m.description ?? "",
      imageUrl: m.imageUrl ?? "",
      basePrice: storeMenu?.priceOverride ?? m.basePrice,
      isAvailable: storeMenu?.isAvailable ?? true,
      isNew: m.isNew,
      isBest: m.isBest,
      optionGroups: m.optionGroups.map((og) => ({
        id: og.id,
        name: og.name,
        isRequired: og.isRequired,
        maxSelect: og.maxSelect,
        options: og.options.map((o) => ({
          id: o.id,
          name: o.name,
          extraPrice: o.extraPrice,
          isAvailable: o.isAvailable,
        })),
      })),
    };
  });
}

// ─── 주문 ───
export async function getOrders(storeId: number) {
  return prisma.order.findMany({
    where: { storeId },
    include: {
      table: true,
      items: {
        include: { options: true },
      },
    },
    orderBy: { orderedAt: "desc" },
  });
}

export async function getOrdersByTable(storeId: number, tableNo: string) {
  const table = await prisma.table.findFirst({
    where: { storeId, tableNo },
  });
  if (!table) return [];

  // 활성 세션의 checkInAt 이후 주문만 반환
  const activeSession = await prisma.tableSession.findFirst({
    where: { storeId, tableId: table.id, checkOutAt: null },
    orderBy: { checkInAt: "desc" },
  });

  return prisma.order.findMany({
    where: {
      storeId,
      tableId: table.id,
      ...(activeSession ? { orderedAt: { gte: activeSession.checkInAt } } : {}),
    },
    include: {
      items: { include: { options: true } },
    },
    orderBy: { orderedAt: "desc" },
  });
}

// ─── 채팅 ───
export async function getChatMessages(storeId: number, tableNo: string) {
  // 활성 세션의 checkInAt 이후 메시지만 반환
  const table = await prisma.table.findFirst({
    where: { storeId, tableNo },
  });

  let checkInAt: Date | undefined;
  if (table) {
    const activeSession = await prisma.tableSession.findFirst({
      where: { storeId, tableId: table.id, checkOutAt: null },
      orderBy: { checkInAt: "desc" },
    });
    if (activeSession) {
      checkInAt = activeSession.checkInAt;
    }
  }

  return prisma.chatMessage.findMany({
    where: {
      storeId,
      tableNo,
      ...(checkInAt ? { createdAt: { gte: checkInAt } } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
}

// ─── 이벤트 ───
export async function getEvents() {
  const now = new Date();
  return prisma.event.findMany({
    where: {
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } },
      ],
    },
    orderBy: { order: "asc" },
  });
}

// ─── 테이블 세션 ───
export async function getActiveSession(storeId: number, tableNo: string) {
  const table = await prisma.table.findFirst({
    where: { storeId, tableNo },
  });
  if (!table) return null;

  return prisma.tableSession.findFirst({
    where: {
      storeId,
      tableId: table.id,
      checkOutAt: null,
    },
    orderBy: { checkInAt: "desc" },
  });
}

// ─── Helper: Game 포맷팅 ───
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatGame(game: any, storeId: number) {
  const storeGame = game.storeGames?.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sg: any) => sg.storeId === storeId
  );
  return {
    id: game.id,
    title: game.title,
    description: game.description ?? "",
    thumbnailUrl: game.thumbnailUrl ?? "",
    videoUrl: game.videoUrl ?? "",
    minPlayers: game.minPlayers,
    maxPlayers: game.maxPlayers,
    recommendedPlayers: game.recommendedPlayers,
    playTime: game.playTime,
    playTimeCategory: game.playTimeCategory,
    difficulty: game.difficulty,
    shelfLocation: storeGame?.shelfLocation ?? game.defaultShelfLoc,
    hashtags: game.hashtags?.map((h: { text: string }) => h.text) ?? [],
    tags: game.tags?.map((gt: { tag: { group: string; value: string } }) => ({
      group: gt.tag.group,
      value: gt.tag.value,
    })) ?? [],
  };
}
