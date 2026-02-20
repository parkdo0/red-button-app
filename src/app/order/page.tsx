import { getMenus } from "@/lib/queries";
import OrderClient from "./OrderClient";
import type { MenuItem } from "@/data/constants";

const STORE_ID = 1;

export default async function OrderPage() {
  const menus = await getMenus(STORE_ID);
  return <OrderClient menus={menus as MenuItem[]} />;
}
