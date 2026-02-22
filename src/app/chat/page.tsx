import { getStore, getChatMessages } from "@/lib/queries";
import { requireTableSession } from "@/lib/auth";
import ChatClient, { type ChatMsg } from "./ChatClient";

export default async function ChatPage() {
  const { storeId, tableNo } = await requireTableSession();

  const [store, dbMessages] = await Promise.all([
    getStore(storeId),
    getChatMessages(storeId, tableNo),
  ]);

  const storeName = `레드버튼 ${store?.name ?? ""}`;

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

  return (
    <ChatClient
      storeName={storeName}
      storeId={storeId}
      tableNo={tableNo}
      initialMessages={initialMessages}
    />
  );
}
