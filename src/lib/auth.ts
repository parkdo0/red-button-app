/**
 * 인증/세션 관리 유틸리티
 * JWT 기반 쿠키 세션 (Edge Runtime 호환)
 *
 * 의존성: jose, bcryptjs
 * 설치: npm install jose bcryptjs && npm install -D @types/bcryptjs
 */
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

// ──────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────

export type SessionRole = "HQ_ADMIN" | "STORE_ADMIN" | "TABLE";

export interface SessionData {
  role: SessionRole;
  userId?: number;       // 관리자일 때 AdminUser.id
  storeId?: number;      // 매장 관리자/테이블일 때
  storeName?: string;    // 표시용
  tableNo?: string;      // 테이블일 때
  tableId?: number;      // 테이블일 때 Table.id
}

interface SessionPayload extends JWTPayload {
  session: SessionData;
}

// ──────────────────────────────────────
// 상수
// ──────────────────────────────────────

const COOKIE_NAME = "rb-session";
const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "redbutton-default-secret-change-in-production-2024"
);
const EXPIRY = "16h"; // 16시간 (영업시간 기준)

// ──────────────────────────────────────
// 세션 생성 (로그인 시)
// ──────────────────────────────────────

export async function createSession(data: SessionData): Promise<string> {
  const token = await new SignJWT({ session: data })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(EXPIRY)
    .setIssuedAt()
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 16, // 16시간
  });

  return token;
}

// ──────────────────────────────────────
// 세션 조회 (Server Component / API Route)
// ──────────────────────────────────────

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    return (payload as SessionPayload).session ?? null;
  } catch {
    return null;
  }
}

// ──────────────────────────────────────
// 세션 삭제 (로그아웃 시)
// ──────────────────────────────────────

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ──────────────────────────────────────
// 미들웨어용 세션 검증 (Edge Runtime)
// cookies() 대신 request에서 직접 읽음
// ──────────────────────────────────────

export async function verifySessionFromToken(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return (payload as SessionPayload).session ?? null;
  } catch {
    return null;
  }
}

// ──────────────────────────────────────
// 페이지용 세션 헬퍼 (Server Component)
// ──────────────────────────────────────

import { redirect } from "next/navigation";

/** 테이블 세션 필수 (고객 페이지용) */
export async function requireTableSession() {
  const session = await getSession();
  if (!session || session.role !== "TABLE") {
    redirect("/login");
  }
  return {
    storeId: session.storeId!,
    tableNo: session.tableNo!,
    tableId: session.tableId!,
    storeName: session.storeName ?? "",
  };
}

/** 관리자 세션 필수 (본사/매장 공통) */
export async function requireAdminSession() {
  const session = await getSession();
  if (!session || (session.role !== "HQ_ADMIN" && session.role !== "STORE_ADMIN")) {
    redirect("/login");
  }
  return session;
}

/** 매장 관리자 세션 필수 */
export async function requireStoreAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "STORE_ADMIN") {
    redirect("/login");
  }
  return { storeId: session.storeId!, storeName: session.storeName ?? "" };
}

/** API 라우트용 세션 검증 (request 쿠키에서 직접 읽기) */
export async function getApiSession(request: Request): Promise<SessionData | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifySessionFromToken(match[1]);
}

export { COOKIE_NAME };
