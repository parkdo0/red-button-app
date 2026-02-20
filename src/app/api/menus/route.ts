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
      isAvailable: menu.isActive,
      isNew: menu.isNew,
      isBest: menu.isBest,
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

/**
 * POST /api/menus
 * 메뉴 생성 (Admin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, name, description, imageUrl, basePrice, isNew, isBest } = body;

    if (!categoryId || !name || basePrice === undefined) {
      return NextResponse.json(
        { error: "categoryId, name, basePrice는 필수입니다." },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.create({
      data: {
        categoryId,
        name,
        description: description ?? null,
        imageUrl: imageUrl ?? null,
        basePrice,
        isNew: isNew ?? false,
        isBest: isBest ?? false,
      },
      include: {
        category: { select: { name: true } },
        optionGroups: { include: { options: true } },
      },
    });

    return NextResponse.json(menu, { status: 201 });
  } catch (error) {
    console.error("메뉴 생성 실패:", error);
    return NextResponse.json({ error: "메뉴 생성에 실패했습니다." }, { status: 500 });
  }
}
