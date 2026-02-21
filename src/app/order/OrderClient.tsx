"use client";

import { useState } from "react";
import { FOOD_CATEGORIES, formatPrice, type MenuItem } from "@/data/constants";
import OptionModal from "@/components/cart/OptionModal";
import OrderCartPanel from "@/components/cart/OrderCartPanel";
import { useCart } from "@/components/cart/CartProvider";
import { useToast } from "@/components/ToastProvider";

/**
 * F&B 주문 페이지 - 실제 레드버튼 앱 기준
 * 라이트(흰색) 테마 (게임 페이지와 다름)
 * 텍스트 탭 + 빨간 밑줄 (pill 아님)
 * 프로모션 배너
 * 세로형 그리드 (4열)
 * 우측 40% 상시 장바구니 패널 (Split View)
 */
interface Props {
  menus: MenuItem[];
}

export default function OrderClient({ menus }: Props) {
  const [activeTab, setActiveTab] = useState<string>(FOOD_CATEGORIES[0]);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const { addItem } = useCart();
  const { showToast } = useToast();

  /** 카테고리별 또는 NEW/BEST 필터 */
  const filteredMenus = getFilteredMenus(activeTab, menus);

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
    <div className="flex h-full">
      {/* ===== 좌측: 메뉴 목록 (60%) - 라이트 테마 ===== */}
      <div className="flex-1 overflow-y-auto bg-white">
        {/* 카테고리 탭 - 텍스트 + 빨간 밑줄 */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex">
            {FOOD_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`
                  relative px-5 py-3.5 text-[14px] font-bold transition-colors touch-feedback
                  ${activeTab === cat
                    ? "text-red-600"
                    : "text-gray-400 hover:text-gray-600"
                  }
                `}
              >
                {cat}
                {/* 빨간 밑줄 인디케이터 */}
                {activeTab === cat && (
                  <div className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-red-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 프로모션 배너 */}
        <div className="px-5 pt-4">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200">
            <div className="px-6 py-6">
              <p className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
                Spicy, Cheesy, and Crispy
              </p>
              <h2 className="mt-1 text-2xl font-black text-red-600 leading-tight italic">
                Feel the NEW<br />Tasty Rush!
              </h2>
              <p className="mt-2 text-[13px] text-gray-600">
                새로운 맛의 짜릿한 순간을 느껴봐!
              </p>
            </div>
          </div>
        </div>

        {/* 섹션 타이틀 */}
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-[15px] font-bold text-gray-900">{activeTab}</h3>
        </div>

        {/* 메뉴 카드 그리드 - 세로형 4열 */}
        <div className="grid grid-cols-2 gap-3 px-5 pb-8 sm:grid-cols-3 lg:grid-cols-4">
          {filteredMenus.map((menu, index) => (
            <button
              key={menu.id}
              disabled={!menu.isAvailable}
              onClick={() => handleMenuClick(menu)}
              className={`
                group flex flex-col rounded-xl text-left transition-all duration-200 touch-feedback overflow-hidden
                ${menu.isAvailable
                  ? "cursor-pointer hover:shadow-md"
                  : "opacity-40 cursor-not-allowed"
                }
              `}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* 이미지 영역 */}
              <div className="relative aspect-square w-full rounded-xl bg-gray-100 overflow-hidden">
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-5xl opacity-40 transition-transform duration-300 group-hover:scale-110">
                    {getCategoryEmoji(menu.categoryName)}
                  </span>
                </div>
                {/* NEW 뱃지 */}
                {menu.isNew && (
                  <span className="absolute top-2 left-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    NEW
                  </span>
                )}
                {/* BEST 뱃지 */}
                {!menu.isNew && menu.isBest && (
                  <span className="absolute top-2 left-2 rounded bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    BEST
                  </span>
                )}
                {/* 품절 */}
                {!menu.isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                    <span className="text-sm font-bold text-gray-400">품절</span>
                  </div>
                )}
              </div>

              {/* 메뉴 정보 */}
              <div className="px-1 py-2">
                <h4 className="text-[13px] font-bold text-gray-900 truncate group-hover:text-red-600 transition-colors">
                  {menu.name}
                </h4>
                <p className="mt-0.5 text-[14px] font-extrabold text-gray-900">
                  {formatPrice(menu.basePrice)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ===== 우측: 장바구니/주문내역 패널 (40%) ===== */}
      <OrderCartPanel />

      {/* 옵션 모달 */}
      {selectedMenu && <OptionModal menu={selectedMenu} onClose={() => setSelectedMenu(null)} />}
    </div>
  );
}

/** 카테고리별 메뉴 필터 */
function getFilteredMenus(tab: string, allMenus: MenuItem[]): MenuItem[] {
  switch (tab) {
    case "NEW":
      return allMenus.filter((m) => m.isNew);
    case "BEST":
      return allMenus.filter((m) => m.isBest);
    default:
      return allMenus.filter((m) => m.categoryName === tab);
  }
}

/** 카테고리별 이모지 */
function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    "푸드": "",
    "음료": "",
    "벌칙메뉴": "",
    "MD상품": "",
  };
  return map[category] ?? "";
}
