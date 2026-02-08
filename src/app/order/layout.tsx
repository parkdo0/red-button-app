import { CartProvider } from "@/components/cart/CartProvider";

/**
 * /order 라우트 레이아웃
 * 장바구니 상태를 주문 페이지 전체에서 공유
 */
export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
