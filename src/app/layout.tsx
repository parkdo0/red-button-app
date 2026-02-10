import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { ToastProvider } from "@/components/ToastProvider";
import { CartProvider } from "@/components/cart/CartProvider";

export const metadata: Metadata = {
  title: "레드버튼 | 보드게임 카페",
  description: "레드버튼 보드게임 카페 태블릿 앱",
};

/**
 * 루트 레이아웃
 * CartProvider를 루트에 배치하여 페이지 이동 시에도 장바구니 유지
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="flex h-dvh w-dvw overflow-hidden">
        <ToastProvider>
          <CartProvider>
            {/* 사이드 네비게이션 */}
            <Navigation />

            {/* 메인 콘텐츠 */}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
