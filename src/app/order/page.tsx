import { getMenus } from "@/lib/queries";
import { requireTableSession } from "@/lib/auth";
import OrderClient from "./OrderClient";
import type { MenuItem } from "@/data/constants";

export default async function OrderPage() {
  const { storeId } = await requireTableSession();
  const menus = await getMenus(storeId);
  return <OrderClient menus={menus as MenuItem[]} />;
}
