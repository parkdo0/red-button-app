import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { ToastProvider } from "@/components/ToastProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { SessionProvider } from "@/components/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "레드버튼 | 보드게임 카페",
  description: "레드버튼 보드게임 카페 태블릿 앱 - In Joy, To-gather!",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#111015",
};

/**
 * 루트 레이아웃 - 레드버튼 태블릿 앱
 * CartProvider 루트 배치 → 페이지 이동 시 장바구니 유지
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="flex h-dvh w-dvw overflow-hidden font-sans">
        <SessionProvider>
          <ToastProvider>
            <CartProvider>
              <Navigation />
              <main className="flex-1 overflow-hidden">{children}</main>
            </CartProvider>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
