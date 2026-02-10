"use client";

import { useState } from "react";
import { FOOD_CATEGORIES, MOCK_MENUS, formatPrice, type MenuItem } from "@/data/mock";
import OptionModal from "@/components/cart/OptionModal";
import CartBar from "@/components/cart/CartBar";
import CartPanel from "@/components/cart/CartPanel";
import { useCart } from "@/components/cart/CartProvider";
import { useToast } from "@/components/ToastProvider";

/** 카테고리 아이콘 매핑 */
const CATEGORY_ICONS: Record<string, string> = {
  "떡볶이": "🍜",
  "스낵": "🍟",
  "음료": "🥤",
  "푸드": "🍕",
  "세트메뉴": "🍱",
};

/**
 * F&B 주문 페이지 - 레드버튼 메뉴 스타일
 * 탭 메뉴 → 메뉴 카드 → 옵션 모달 → 장바구니
 */
export default function OrderPage() {
  const [activeTab, setActiveTab] = useState<string>(FOOD_CATEGORIES[0]);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const filteredMenus = MOCK_MENUS.filter((menu) => menu.categoryName === activeTab);

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
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 md:px-8">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">주문하기</h1>
          <p className="mt-1 text-sm text-text-muted">먹고 싶은 메뉴를 골라보세요</p>
        </div>

        {/* 탭 메뉴 - 레드버튼 스타일 pill 탭 */}
        <div className="mb-6 flex gap-2.5">
          {FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`
                flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 touch-feedback
                ${activeTab === cat ? "rb-tab-active" : "rb-tab"}
              `}
            >
              <span className="text-base">{CATEGORY_ICONS[cat] ?? "🍽"}</span>
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
                group animate-card flex gap-4 rounded-2xl border p-4 text-left transition-all duration-200 touch-feedback
                ${menu.isAvailable
                  ? "rb-card rb-card-glow cursor-pointer"
                  : "bg-bg-card/40 border-border-default opacity-40 cursor-not-allowed"
                }
              `}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              {/* 이미지 영역 */}
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-bg-elevated to-bg-secondary">
                <span className="text-3xl">
                  {CATEGORY_ICONS[menu.categoryName] ?? "🍽"}
                </span>
              </div>

              {/* 메뉴 정보 */}
              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <div>
                  <h3 className="truncate text-sm font-bold text-text-primary group-hover:text-red-primary transition-colors">
                    {menu.name}
                  </h3>
                  {menu.description && (
                    <p className="mt-0.5 text-xs text-text-muted line-clamp-2 leading-relaxed">
                      {menu.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[15px] font-extrabold text-red-primary">
                    {formatPrice(menu.basePrice)}
                  </span>
                  {!menu.isAvailable && (
                    <span className="rb-badge bg-bg-elevated text-text-muted">품절</span>
                  )}
                  {menu.optionGroups.length > 0 && menu.isAvailable && (
                    <span className="rb-badge bg-red-subtle text-red-primary">옵션</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <CartBar onOpenCart={() => setIsCartOpen(true)} />
      {selectedMenu && <OptionModal menu={selectedMenu} onClose={() => setSelectedMenu(null)} />}
      {isCartOpen && <CartPanel onClose={() => setIsCartOpen(false)} />}
    </div>
  );
}
