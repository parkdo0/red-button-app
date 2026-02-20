import { getStore, getChatMessages } from "@/lib/queries";
import ChatClient, { type ChatMsg } from "./ChatClient";

const STORE_ID = 1;
const TABLE_NO = "31";

export default async function ChatPage() {
  const [store, dbMessages] = await Promise.all([
    getStore(STORE_ID),
    getChatMessages(STORE_ID, TABLE_NO),
  ]);

  const storeName = `레드버튼 ${store?.name ?? "수원점"}`;

  const initialMessages: ChatMsg[] = dbMessages.map((m) => ({
    id: m.id,
    sender: m.sender === "STORE" ? "store" : "customer",
    text: m.text,
    time: m.createdAt.toLocaleTimeString("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  }));

  return <ChatClient storeName={storeName} initialMessages={initialMessages} />;
}
