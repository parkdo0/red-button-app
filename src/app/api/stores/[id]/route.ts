import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/stores/:id
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const store = await prisma.store.findUnique({ where: { id: Number(id) } });
    if (!store) {
      return NextResponse.json({ error: "매장을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json(store);
  } catch (error) {
    console.error("매장 조회 실패:", error);
    return NextResponse.json({ error: "매장 조회에 실패했습니다." }, { status: 500 });
  }
}

/**
 * PATCH /api/stores/:id
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const store = await prisma.store.update({ where: { id: Number(id) }, data: body });
    return NextResponse.json(store);
  } catch (error) {
    console.error("매장 수정 실패:", error);
    return NextResponse.json({ error: "매장 수정에 실패했습니다." }, { status: 500 });
  }
}
