/**
 * GET /api/auth/session
 * 현재 세션 정보 반환 (클라이언트에서 세션 확인용)
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, ...session });
}
