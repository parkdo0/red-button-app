import { redirect } from "next/navigation";

/** 구버전 → 매장 채팅으로 리다이렉트 */
export default function LegacyCallsPage() {
  redirect("/admin/store/chat");
}
