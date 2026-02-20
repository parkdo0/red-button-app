import { searchGames } from "@/lib/queries";
import SearchClient from "./SearchClient";

const STORE_ID = 1;

export default async function SearchPage() {
  // 전체 게임 목록을 서버에서 조회 (클라이언트에서 필터링)
  const allGames = await searchGames(STORE_ID, {});

  return <SearchClient initialGames={allGames} />;
}
