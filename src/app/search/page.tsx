import { searchGames } from "@/lib/queries";
import { requireTableSession } from "@/lib/auth";
import SearchClient from "./SearchClient";

export default async function SearchPage() {
  const { storeId } = await requireTableSession();
  const allGames = await searchGames(storeId, {});

  return <SearchClient initialGames={allGames} />;
}
