/**
 * GET /api/auth/session
 * 현재 세션 정보 반환 (클라이언트에서 세션 확인용)
 * TABLE 역할: DB에서 활성 세션(checkOutAt IS NULL) 존재 여부 확인
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // TABLE 역할: 퇴장 처리 여부 확인
  if (session.role === "TABLE" && session.tableId) {
    const activeSession = await prisma.tableSession.findFirst({
      where: {
        tableId: session.tableId,
        checkOutAt: null,
      },
      orderBy: { checkInAt: "desc" },
    });

    if (!activeSession) {
      return NextResponse.json(
        { authenticated: false, reason: "checked_out" },
        { status: 401 }
      );
    }
  }

  return NextResponse.json({ authenticated: true, ...session });
}
