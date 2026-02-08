import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/menus?category=떡볶이
 * F&B 메뉴 목록 (카테고리 필터링, 옵션 포함)
 */
export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category");

    const menus = await prisma.menu.findMany({
      where: {
        ...(category ? { category: { name: category } } : {}),
        category: {
          type: "FOOD",
          ...(category ? { name: category } : {}),
        },
      },
      include: {
        category: { select: { name: true } },
        optionGroups: {
          orderBy: { displayOrder: "asc" },
          include: {
            options: {
              orderBy: { displayOrder: "asc" },
            },
          },
        },
      },
      orderBy: [
        { category: { displayOrder: "asc" } },
        { displayOrder: "asc" },
      ],
    });

    const result = menus.map((menu) => ({
      id: menu.id,
      categoryName: menu.category.name,
      name: menu.name,
      description: menu.description,
      imageUrl: menu.imageUrl,
      basePrice: menu.basePrice,
      isAvailable: menu.isAvailable,
      optionGroups: menu.optionGroups.map((group) => ({
        id: group.id,
        name: group.name,
        isRequired: group.isRequired,
        maxSelect: group.maxSelect,
        options: group.options.map((opt) => ({
          id: opt.id,
          name: opt.name,
          extraPrice: opt.extraPrice,
          isAvailable: opt.isAvailable,
        })),
      })),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("메뉴 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "메뉴를 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}
