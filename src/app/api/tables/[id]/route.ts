import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/auth";
import { generateSetupCode } from "@/lib/setup-code";

/**
 * PATCH /api/tables/:id
 * 테이블 설정 코드 재발급 { action: "regenerateCode" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSession = await getApiSession(request);
    if (!authSession) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 관리자만 허용
    if (authSession.role !== "STORE_ADMIN" && authSession.role !== "HQ_ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { id } = await params;
    const tableId = Number(id);
    if (isNaN(tableId)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
    }

    const body = await request.json();

    if (body.action === "regenerateCode") {
      // 테이블이 속한 매장의 storeCode 조회
      const table = await prisma.table.findUnique({
        where: { id: tableId },
        include: { store: { select: { storeCode: true } } },
      });

      if (!table) {
        return NextResponse.json({ error: "테이블을 찾을 수 없습니다." }, { status: 404 });
      }

      // 새 코드 생성 (중복 방지 — 3회 시도)
      let newCode = "";
      for (let i = 0; i < 3; i++) {
        newCode = generateSetupCode(table.store.storeCode);
        const existing = await prisma.table.findFirst({
          where: { storeId: table.storeId, setupCode: newCode, id: { not: tableId } },
        });
        if (!existing) break;
      }

      const updated = await prisma.table.update({
        where: { id: tableId },
        data: { setupCode: newCode },
        select: { id: true, tableNo: true, setupCode: true },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "지원하지 않는 action입니다." }, { status: 400 });
  } catch (error) {
    console.error("테이블 업데이트 실패:", error);
    return NextResponse.json({ error: "테이블 업데이트에 실패했습니다." }, { status: 500 });
  }
}
