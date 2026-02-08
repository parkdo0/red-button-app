import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "레드버튼 | 보드게임 카페",
  description: "레드버튼 보드게임 카페 태블릿 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="flex h-dvh w-dvw overflow-hidden">
        <ToastProvider>
          {/* 사이드 네비게이션 */}
          <Navigation />

          {/* 메인 콘텐츠 */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
