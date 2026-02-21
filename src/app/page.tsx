import { getRecommendCategories } from "@/lib/queries";
import { requireTableSession } from "@/lib/auth";
import GameCategoryRow from "@/components/GameCategoryRow";
import type { GameCategory } from "@/data/constants";

/**
 * 추천 게임 홈 - Server Component
 * DB에서 추천 카테고리 + 게임 목록 조회
 */
export default async function HomePage() {
  const { storeId } = await requireTableSession();
  const categories = await getRecommendCategories(storeId);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      {/* 상단 안내 배너 */}
      <div className="mx-6 mt-5 mb-4 md:mx-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-bg-card border border-border-default px-4 py-2">
          <span className="text-xs text-text-secondary">
            보드게임이 처음이시라면, 이 게임 어떠세요?
          </span>
        </div>
      </div>

      {/* 카테고리별 추천 게임 행 */}
      <div className="flex flex-col gap-6 px-6 pb-8 md:px-8">
        {categories.map((category) => (
          <GameCategoryRow
            key={category.id}
            category={category as GameCategory}
          />
        ))}
      </div>
    </div>
  );
}
