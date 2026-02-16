"use client";

import { useState, useMemo } from "react";
import { MOCK_MENUS, FOOD_CATEGORIES, formatPrice, type MenuItem } from "@/data/mock";

interface StoreMenuEntry {
  menuId: number;
  isAvailable: boolean;
  priceOverride: number | null;
}

/**
 * 매장 > 메뉴 관리
 * 품절 토글 + 가격 오버라이드
 */
export default function StoreMenusPage() {
  const [activeTab, setActiveTab] = useState("전체");
  const [search, setSearch] = useState("");

  // 매장별 메뉴 설정 (초기값: 마스터 메뉴 기반)
  const [storeMenus, setStoreMenus] = useState<StoreMenuEntry[]>(
    MOCK_MENUS.map((m) => ({ menuId: m.id, isAvailable: m.isAvailable, priceOverride: null }))
  );

  /** 품절 토글 */
  const toggleAvailability = (menuId: number) => {
    setStoreMenus((prev) =>
      prev.map((sm) => (sm.menuId === menuId ? { ...sm, isAvailable: !sm.isAvailable } : sm))
    );
  };

  /** 가격 오버라이드 */
  const updatePrice = (menuId: number, price: string) => {
    const num = parseInt(price, 10);
    setStoreMenus((prev) =>
      prev.map((sm) =>
        sm.menuId === menuId ? { ...sm, priceOverride: isNaN(num) ? null : num } : sm
      )
    );
  };

  /** 오버라이드 리셋 */
  const resetPrice = (menuId: number) => {
    setStoreMenus((prev) =>
      prev.map((sm) => (sm.menuId === menuId ? { ...sm, priceOverride: null } : sm))
    );
  };

  const tabs = ["전체", ...FOOD_CATEGORIES.filter((c) => c !== "NEW" && c !== "BEST")];

  const filtered = useMemo(() => {
    return MOCK_MENUS.filter((m) => {
      const matchTab = activeTab === "전체" || m.categoryName === activeTab;
      const matchSearch = !search || m.name.includes(search);
      return matchTab && matchSearch;
    });
  }, [activeTab, search]);

  const soldOutCount = storeMenus.filter((sm) => !sm.isAvailable).length;
  const overrideCount = storeMenus.filter((sm) => sm.priceOverride !== null).length;

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">메뉴 관리</h1>
            <p className="text-xs text-gray-500">
              전체 {MOCK_MENUS.length}종 · 품절 <strong className="text-red-600">{soldOutCount}</strong>
              · 가격변경 <strong className="text-blue-600">{overrideCount}</strong>
            </p>
          </div>
        </div>

        {/* 탭 + 검색 */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab ? "bg-red-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="메뉴명 검색..."
            className="ml-auto w-48 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs focus:border-red-300 focus:outline-none"
          />
        </div>
      </div>

      {/* 메뉴 테이블 */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-500">메뉴명</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-500 w-[80px]">카테고리</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-bold text-gray-500 w-[100px]">본사 가격</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-bold text-gray-500 w-[140px]">매장 가격</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-500 w-[60px]">NEW</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-500 w-[60px]">BEST</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-500 w-[80px]">판매상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((menu) => {
              const storeMenu = storeMenus.find((sm) => sm.menuId === menu.id);
              const isAvailable = storeMenu?.isAvailable ?? true;
              const hasOverride = storeMenu?.priceOverride != null;

              return (
                <tr key={menu.id} className={`transition-colors ${!isAvailable ? "bg-red-50/30" : "bg-white"}`}>
                  {/* 메뉴명 */}
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${isAvailable ? "text-gray-900" : "text-gray-400 line-through"}`}>
                      {menu.name}
                    </span>
                    {menu.description && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{menu.description}</p>
                    )}
                  </td>
                  {/* 카테고리 */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">{menu.categoryName}</span>
                  </td>
                  {/* 본사 가격 */}
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm ${hasOverride ? "text-gray-400 line-through" : "font-medium text-gray-900"}`}>
                      {formatPrice(menu.basePrice)}
                    </span>
                  </td>
                  {/* 매장 가격 */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        value={storeMenu?.priceOverride ?? ""}
                        onChange={(e) => updatePrice(menu.id, e.target.value)}
                        placeholder={String(menu.basePrice)}
                        className={`w-20 rounded border px-2 py-1 text-right text-xs focus:outline-none ${
                          hasOverride
                            ? "border-blue-300 bg-blue-50 text-blue-700 font-bold"
                            : "border-gray-200 bg-gray-50 text-gray-400"
                        }`}
                      />
                      {hasOverride && (
                        <button
                          onClick={() => resetPrice(menu.id)}
                          className="text-[10px] text-blue-500 hover:text-blue-700"
                          title="원래 가격으로 복원"
                        >
                          ↩
                        </button>
                      )}
                    </div>
                  </td>
                  {/* NEW */}
                  <td className="px-4 py-3 text-center">
                    {menu.isNew && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">NEW</span>}
                  </td>
                  {/* BEST */}
                  <td className="px-4 py-3 text-center">
                    {menu.isBest && <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-[9px] font-bold text-yellow-700">BEST</span>}
                  </td>
                  {/* 판매상태 토글 */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleAvailability(menu.id)}
                      className={`rounded-full px-3 py-1 text-[10px] font-bold transition-colors ${
                        isAvailable
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                    >
                      {isAvailable ? "판매중" : "품절"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
