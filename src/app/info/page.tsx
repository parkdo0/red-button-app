import { getStore, getActiveSession } from "@/lib/queries";
import InfoClient from "./InfoClient";

const STORE_ID = 1;
const TABLE_NO = "31";

export default async function InfoPage() {
  const [store, session] = await Promise.all([
    getStore(STORE_ID),
    getActiveSession(STORE_ID, TABLE_NO),
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
      storeName={store?.name ?? "수원점"}
      tableNo={TABLE_NO}
      wifiId={store?.wifiId ?? "redbutton"}
      wifiPw={store?.wifiPw ?? "red2563799"}
      checkInTime={checkInTime}
      elapsedMin={elapsed}
    />
  );
}
