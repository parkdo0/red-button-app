"use client";

import { useState } from "react";
import { FOOD_CATEGORIES, MOCK_MENUS, formatPrice, type MenuItem } from "@/data/mock";
import OptionModal from "@/components/cart/OptionModal";
import CartBar from "@/components/cart/CartBar";
import CartPanel from "@/components/cart/CartPanel";
import { useCart } from "@/components/cart/CartProvider";
import { useToast } from "@/components/ToastProvider";

/**
 * F&B 주문 페이지
 * 탭 메뉴 → 메뉴 카드 → 옵션 모달 → 장바구니
 */
export default function OrderPage() {
  const [activeTab, setActiveTab] = useState<string>(FOOD_CATEGORIES[0]);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const filteredMenus = MOCK_MENUS.filter(
    (menu) => menu.categoryName === activeTab
  );

  /** 메뉴 클릭: 옵션 있으면 모달, 없으면 바로 장바구니 + 토스트 */
  const handleMenuClick = (menu: MenuItem) => {
    if (!menu.isAvailable) return;

    if (menu.optionGroups.length > 0) {
      setSelectedMenu(menu);
    } else {
      addItem(menu, [], 1);
      showToast(`${menu.name} 담김!`);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto px-6 py-5 md:px-8 md:py-6">
        {/* 헤더 */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-text-primary md:text-2xl">주문하기</h1>
          <p className="mt-1 text-sm text-text-muted">
            먹고 싶은 메뉴를 골라보세요
          </p>
        </div>

        {/* 탭 메뉴 */}
        <div className="mb-5 flex gap-2">
          {FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`
                rounded-full px-5 py-2.5 text-sm font-medium transition-colors touch-feedback
                ${
                  activeTab === cat
                    ? "bg-red-primary text-white"
                    : "bg-bg-card text-text-secondary hover:bg-bg-card-hover"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 메뉴 카드 그리드 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMenus.map((menu, index) => (
            <button
              key={menu.id}
              disabled={!menu.isAvailable}
              onClick={() => handleMenuClick(menu)}
              className={`
                animate-card flex gap-4 rounded-xl border border-border-default p-4 text-left
                transition-all duration-200 touch-feedback
                ${
                  menu.isAvailable
                    ? "bg-bg-card hover:border-red-primary/50 hover:bg-bg-card-hover cursor-pointer"
                    : "bg-bg-card/50 opacity-50 cursor-not-allowed"
                }
              `}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              {/* 이미지 플레이스홀더 */}
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-bg-secondary">
                <span className="text-2xl">
                  {menu.categoryName === "떡볶이" ? "🍜" : menu.categoryName === "스낵" ? "🍟" : "🥤"}
                </span>
              </div>

              {/* 메뉴 정보 */}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <h3 className="truncate text-sm font-semibold text-text-primary">
                    {menu.name}
                  </h3>
                  {menu.description && (
                    <p className="mt-0.5 text-xs text-text-muted line-clamp-2">
                      {menu.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-primary">
                    {formatPrice(menu.basePrice)}
                  </span>
                  {!menu.isAvailable && (
                    <span className="rounded bg-bg-secondary px-1.5 py-0.5 text-[10px] text-text-muted">품절</span>
                  )}
                  {menu.optionGroups.length > 0 && menu.isAvailable && (
                    <span className="rounded bg-bg-secondary px-1.5 py-0.5 text-[10px] text-text-muted">
                      옵션 선택
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 하단 장바구니 바 */}
      <CartBar onOpenCart={() => setIsCartOpen(true)} />

      {/* 옵션 선택 모달 */}
      {selectedMenu && (
        <OptionModal
          menu={selectedMenu}
          onClose={() => setSelectedMenu(null)}
        />
      )}

      {/* 장바구니 패널 */}
      {isCartOpen && <CartPanel onClose={() => setIsCartOpen(false)} />}
    </div>
  );
}
