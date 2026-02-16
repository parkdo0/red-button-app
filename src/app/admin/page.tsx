import { redirect } from "next/navigation";

/** /admin 접근 시 본사 대시보드로 리다이렉트 */
export default function AdminRootPage() {
  redirect("/admin/hq");
}
