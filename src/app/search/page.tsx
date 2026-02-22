import { searchGames, getTags } from "@/lib/queries";
import { requireTableSession } from "@/lib/auth";
import SearchClient from "./SearchClient";

export default async function SearchPage() {
  const { storeId } = await requireTableSession();
  const [allGames, tags] = await Promise.all([
    searchGames(storeId, {}),
    getTags(),
  ]);

  // DB 태그를 그룹별로 분류
  const tagsByGroup: Record<string, string[]> = {};
  for (const tag of tags) {
    if (!tagsByGroup[tag.group]) tagsByGroup[tag.group] = [];
    tagsByGroup[tag.group].push(tag.value);
  }

  const filterOptions = {
    genre: tagsByGroup["genre"] ?? [],
    playerCount: tagsByGroup["player_count"] ?? [],
    playTime: tagsByGroup["play_time"] ?? [],
  };

  return <SearchClient initialGames={allGames} filterOptions={filterOptions} />;
}
