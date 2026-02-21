import { getStore, getActiveSession } from "@/lib/queries";
import { requireTableSession } from "@/lib/auth";
import InfoClient from "./InfoClient";

export default async function InfoPage() {
  const { storeId, tableNo } = await requireTableSession();

  const [store, session] = await Promise.all([
    getStore(storeId),
    getActiveSession(storeId, tableNo),
  ]);

  const checkInAt = session?.checkInAt ?? new Date();
  const elapsed = Math.floor((Date.now() - checkInAt.getTime()) / 60000);
  const checkInTime = checkInAt.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return (
    <InfoClient
      storeName={store?.name ?? ""}
      tableNo={tableNo}
      wifiId={store?.wifiId ?? "redbutton"}
      wifiPw={store?.wifiPw ?? "red2563799"}
      checkInTime={checkInTime}
      elapsedMin={elapsed}
    />
  );
}
