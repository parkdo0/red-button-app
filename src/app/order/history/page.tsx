import { redirect } from "next/navigation";

/**
 * /order/history → /orders 리다이렉트
 */
export default function OrderHistoryRedirect() {
  redirect("/orders");
}
