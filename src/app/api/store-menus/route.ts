import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/auth";

/**
 * GET /api/store-menus?storeId=1
 * 매장별 메뉴 목록 (전체 메뉴 + 매장 설정 병합)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const storeId = Number(request.nextUrl.searchParams.get("storeId"));
    if (!storeId) {
      return NextResponse.json({ error: "storeId는 필수입니다." }, { status: 400 });
    }

    const menus = await prisma.menu.findMany({
      where: { isActive: true },
      include: {
        category: { select: { name: true, type: true } },
        optionGroups: {
          orderBy: { displayOrder: "asc" },
          include: { options: { orderBy: { displayOrder: "asc" } } },
        },
        storeMenus: { where: { storeId } },
      },
      orderBy: [{ category: { displayOrder: "asc" } }, { displayOrder: "asc" }],
    });

    const result = menus.map((menu) => ({
      id: menu.id,
      categoryName: menu.category.name,
      categoryType: menu.category.type,
      name: menu.name,
      description: menu.description,
      imageUrl: menu.imageUrl,
      basePrice: menu.basePrice,
      isNew: menu.isNew,
      isBest: menu.isBest,
      isActive: menu.isActive,
      optionGroups: menu.optionGroups.map((g) => ({
        id: g.id,
        name: g.name,
        isRequired: g.isRequired,
        maxSelect: g.maxSelect,
        options: g.options.map((o) => ({
          id: o.id, name: o.name, extraPrice: o.extraPrice, isAvailable: o.isAvailable,
        })),
      })),
      // 매장별 설정
      isAvailable: menu.storeMenus[0]?.isAvailable ?? true,
      priceOverride: menu.storeMenus[0]?.priceOverride ?? null,
      hasStoreConfig: menu.storeMenus.length > 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("매장 메뉴 목록 조회 실패:", error);
    return NextResponse.json({ error: "매장 메뉴 목록을 불러오는 데 실패했습니다." }, { status: 500 });
  }
}

/**
 * POST /api/store-menus
 * 매장별 메뉴 설정 (upsert: 가용성, 가격 오버라이드)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const { menuId, storeId, isAvailable, priceOverride } = body;

    if (!menuId || !storeId) {
      return NextResponse.json({ error: "menuId, storeId는 필수입니다." }, { status: 400 });
    }

    const storeMenu = await prisma.storeMenu.upsert({
      where: { storeId_menuId: { storeId, menuId } },
      create: {
        storeId,
        menuId,
        isAvailable: isAvailable ?? true,
        priceOverride: priceOverride ?? null,
      },
      update: {
        ...(isAvailable !== undefined && { isAvailable }),
        ...(priceOverride !== undefined && { priceOverride }),
      },
    });

    return NextResponse.json({ success: true, data: storeMenu });
  } catch (error) {
    console.error("매장 메뉴 설정 실패:", error);
    return NextResponse.json({ error: "매장 메뉴 설정에 실패했습니다." }, { status: 500 });
  }
}

/**
 * DELETE /api/store-menus?storeId=1&menuId=1
 * 매장 메뉴 설정 삭제 (기본값으로 복원)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getApiSession(request);
    if (!session) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const storeId = Number(request.nextUrl.searchParams.get("storeId"));
    const menuId = Number(request.nextUrl.searchParams.get("menuId"));

    if (!storeId || !menuId) {
      return NextResponse.json({ error: "storeId, menuId는 필수입니다." }, { status: 400 });
    }

    await prisma.storeMenu.deleteMany({ where: { storeId, menuId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("매장 메뉴 설정 삭제 실패:", error);
    return NextResponse.json({ error: "매장 메뉴 설정 삭제에 실패했습니다." }, { status: 500 });
  }
}
