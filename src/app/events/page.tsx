import { getEvents } from "@/lib/queries";
import EventsClient from "./EventsClient";

export default async function EventsPage() {
  const events = await getEvents();

  const mapped = events.map((e) => ({
    id: e.id,
    title: e.title,
    subtitle: e.subtitle ?? "",
    description: e.description ?? "",
    bgGradient: getBgGradient(e.order),
    emoji: getEmoji(e.order),
  }));

  return <EventsClient events={mapped} />;
}

function getBgGradient(order: number) {
  const gradients = [
    "from-red-900 via-red-800 to-red-950",
    "from-purple-900 via-purple-800 to-indigo-950",
    "from-pink-900 via-pink-800 to-rose-950",
    "from-blue-900 via-blue-800 to-cyan-950",
  ];
  return gradients[order % gradients.length];
}

function getEmoji(order: number) {
  const emojis = ["🎭", "📸", "🎂", "🎉"];
  return emojis[order % emojis.length];
}
