/**
 * POST /api/auth/login
 * 관리자 로그인 (아이디 + 비밀번호)
 * 테이블 로그인 (매장 PIN + 테이블 번호)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, type SessionRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

interface AdminLoginBody {
  type: "admin";
  loginId: string;
  password: string;
}

interface TableLoginBody {
  type: "table";
  storeId: number;
  setupCode: string;  // 전체 코드 (매장접두사 + 4자리), 예: "SW31AA"
}

type LoginBody = AdminLoginBody | TableLoginBody;

export async function POST(request: NextRequest) {
  try {
    const body: LoginBody = await request.json();

    // ─── 관리자 로그인 ───
    if (body.type === "admin") {
      const { loginId, password } = body;

      if (!loginId || !password) {
        return NextResponse.json({ error: "아이디와 비밀번호를 입력해주세요." }, { status: 400 });
      }

      const user = await prisma.adminUser.findUnique({
        where: { loginId },
        include: { store: { select: { name: true } } },
      });

      if (!user || !user.isActive) {
        return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
      }

      // 역할 매핑
      let role: SessionRole;
      if (user.role === "HQ_ADMIN") {
        role = "HQ_ADMIN";
      } else {
        role = "STORE_ADMIN"; // STORE_MANAGER, STORE_STAFF → STORE_ADMIN
      }

      // 마지막 로그인 시간 업데이트
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // 세션 생성
      await createSession({
        role,
        userId: user.id,
        storeId: user.storeId ?? undefined,
        storeName: user.store?.name ?? undefined,
      });

      return NextResponse.json({
        success: true,
        role,
        redirect: role === "HQ_ADMIN" ? "/admin/hq" : "/admin/store",
        user: { id: user.id, name: user.name, storeName: user.store?.name },
      });
    }

    // ─── 테이블 로그인 (설정 코드 방식) ───
    if (body.type === "table") {
      const { storeId, setupCode } = body;

      if (!storeId || !setupCode) {
        return NextResponse.json({ error: "매장과 설정 코드를 입력해주세요." }, { status: 400 });
      }

      // 매장 확인
      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (!store || !store.isActive) {
        return NextResponse.json({ error: "존재하지 않거나 비활성화된 매장입니다." }, { status: 404 });
      }

      // setupCode로 테이블 검색 (매장 + 코드 매칭)
      const table = await prisma.table.findFirst({
        where: { storeId, setupCode: setupCode.toUpperCase(), isActive: true },
      });
      if (!table) {
        return NextResponse.json({ error: "설정 코드가 올바르지 않습니다." }, { status: 401 });
      }

      // 세션 생성
      await createSession({
        role: "TABLE",
        storeId: store.id,
        storeName: store.name,
        tableNo: table.tableNo,
        tableId: table.id,
      });

      return NextResponse.json({
        success: true,
        role: "TABLE",
        redirect: "/",
        store: { id: store.id, name: store.name },
        table: { id: table.id, tableNo: table.tableNo },
      });
    }

    return NextResponse.json({ error: "잘못된 로그인 유형입니다." }, { status: 400 });
  } catch (error) {
    console.error("로그인 실패:", error);
    return NextResponse.json({ error: "로그인 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
