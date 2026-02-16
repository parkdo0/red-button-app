import { redirect } from "next/navigation";

/** 구버전 → 매장 주문관리로 리다이렉트 */
export default function LegacyOrdersPage() {
  redirect("/admin/store/orders");
}
