/**
 * POST /api/auth/logout
 * 세션 삭제 → 로그인 페이지로
 */
import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST() {
  await destroySession();
  return NextResponse.json({ success: true, redirect: "/login" });
}
