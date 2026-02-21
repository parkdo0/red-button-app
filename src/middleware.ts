/**
 * Next.js Middleware — 라우트 보호
 * Edge Runtime에서 실행, 모든 페이지 요청 전에 세션 검증
 */
import { NextRequest, NextResponse } from "next/server";
import { verifySessionFromToken, COOKIE_NAME, type SessionData } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── 공개 경로: 인증 불필요 ───
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg")
  ) {
    return NextResponse.next();
  }

  // ─── 세션 확인 ───
  const token = request.cookies.get(COOKIE_NAME)?.value;
  let session: SessionData | null = null;

  if (token) {
    session = await verifySessionFromToken(token);
  }

  // ─── 미인증: 로그인 페이지로 리다이렉트 ───
  if (!session) {
    // API 요청은 401 반환
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ─── 역할별 라우트 보호 ───

  // 본사 관리자 영역
  if (pathname.startsWith("/admin/hq")) {
    if (session.role !== "HQ_ADMIN") {
      // 매장 관리자는 매장 대시보드로
      if (session.role === "STORE_ADMIN") {
        return NextResponse.redirect(new URL("/admin/store", request.url));
      }
      // 테이블은 고객 화면으로
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 매장 관리자 영역
  if (pathname.startsWith("/admin/store")) {
    if (session.role !== "STORE_ADMIN" && session.role !== "HQ_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // /admin 루트 → 역할에 따라 리다이렉트
  if (pathname === "/admin") {
    if (session.role === "HQ_ADMIN") {
      return NextResponse.redirect(new URL("/admin/hq", request.url));
    } else if (session.role === "STORE_ADMIN") {
      return NextResponse.redirect(new URL("/admin/store", request.url));
    } else {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 고객 페이지 (/, /search, /order, /chat, /info, /events, /kit, /games/*)
  // TABLE 세션 또는 HQ_ADMIN (관리 목적) 허용
  const customerPaths = ["/search", "/order", "/orders", "/chat", "/info", "/events", "/kit", "/games"];
  const isCustomerPage = pathname === "/" || customerPaths.some((p) => pathname.startsWith(p));

  if (isCustomerPage && session.role !== "TABLE" && session.role !== "HQ_ADMIN") {
    // 매장 관리자가 고객 페이지 접근 시 → 관리자 화면으로
    if (session.role === "STORE_ADMIN") {
      return NextResponse.redirect(new URL("/admin/store", request.url));
    }
  }

  // ─── 이미 로그인된 사용자가 /login 접근 시 ───
  if (pathname === "/login") {
    if (session.role === "HQ_ADMIN") {
      return NextResponse.redirect(new URL("/admin/hq", request.url));
    } else if (session.role === "STORE_ADMIN") {
      return NextResponse.redirect(new URL("/admin/store", request.url));
    } else {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
