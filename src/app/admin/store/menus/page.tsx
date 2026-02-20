"use client";

import { useState, useEffect, useMemo } from "react";
import { formatPrice } from "@/data/constants";

interface StoreMenuItem {
  id: number;
  categoryName: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  isNew: boolean;
  isBest: boolean;
  isAvailable: boolean;
  priceOverride: number | null;
  hasStoreConfig: boolean;
}

/**
 * 매장 > 메뉴 관리
 * 품절 토글 + 가격 오버라이드
 */
export default function StoreMenusPage() {
  const [menus, setMenus] = useState<StoreMenuItem[]>([]);
  const [activeTab, setActiveTab] = useState("전체");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMenus = () => {
    fetch("/api/store-menus?storeId=1")
      .then((r) => r.json())
      .then((data) => { setMenus(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMenus(); }, []);

  /** 카테고리 탭 목록 (동적) */
  const tabs = useMemo(() => {
    const cats = [...new Set(menus.map((m) => m.categoryName))];
    return ["전체", ...cats];
  }, [menus]);

  const filtered = useMemo(() => {
    return menus.filter((m) => {
      const matchTab = activeTab === "전체" || m.categoryName === activeTab;
      const matchSearch = !search || m.name.includes(search);
      return matchTab && matchSearch;
    });
  }, [menus, activeTab, search]);

  /** 품절 토글 */
  const toggleAvailability = async (menu: StoreMenuItem) => {
    const newAvail = !menu.isAvailable;
    setMenus((prev) => prev.map((m) => m.id === menu.id ? { ...m, isAvailable: newAvail } : m));
    await fetch("/api/store-menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId: 1, menuId: menu.id, isAvailable: newAvail }),
    });
  };

  /** 가격 오버라이드 */
  const updatePrice = async (menu: StoreMenuItem, price: string) => {
    const num = parseInt(price, 10);
    const override = isNaN(num) ? null : num;
    setMenus((prev) => prev.map((m) => m.id === menu.id ? { ...m, priceOverride: override } : m));
    if (override !== null) {
      await fetch("/api/store-menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: 1, menuId: menu.id, priceOverride: override }),
      });
    }
  };

  /** 오버라이드 리셋 */
  const resetPrice = async (menu: StoreMenuItem) => {
    setMenus((prev) => prev.map((m) => m.id === menu.id ? { ...m, priceOverride: null } : m));
    await fetch("/api/store-menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId: 1, menuId: menu.id, priceOverride: null }),
    });
  };

  const soldOutCount = menus.filter((m) => !m.isAvailable).length;
  const overrideCount = menus.filter((m) => m.priceOverride != null).length;

  if (loading) return <div className="flex h-full items-center justify-center text-gray-400">로딩 중...</div>;

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">메뉴 관리</h1>
            <p className="text-xs text-gray-500">
              전체 {menus.length}종 · 품절 <strong className="text-red-600">{soldOutCount}</strong>
              · 가격변경 <strong className="text-blue-600">{overrideCount}</strong>
            </p>
          </div>
        </div>

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
              const hasOverride = menu.priceOverride != null;
              return (
                <tr key={menu.id} className={`transition-colors ${!menu.isAvailable ? "bg-red-50/30" : "bg-white"}`}>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${menu.isAvailable ? "text-gray-900" : "text-gray-400 line-through"}`}>
                      {menu.name}
                    </span>
                    {menu.description && <p className="text-[10px] text-gray-400 mt-0.5">{menu.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">{menu.categoryName}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm ${hasOverride ? "text-gray-400 line-through" : "font-medium text-gray-900"}`}>
                      {formatPrice(menu.basePrice)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        value={menu.priceOverride ?? ""}
                        onChange={(e) => updatePrice(menu, e.target.value)}
                        placeholder={String(menu.basePrice)}
                        className={`w-20 rounded border px-2 py-1 text-right text-xs focus:outline-none ${
                          hasOverride
                            ? "border-blue-300 bg-blue-50 text-blue-700 font-bold"
                            : "border-gray-200 bg-gray-50 text-gray-400"
                        }`}
                      />
                      {hasOverride && (
                        <button onClick={() => resetPrice(menu)} className="text-[10px] text-blue-500 hover:text-blue-700" title="원래 가격으로 복원">↩</button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {menu.isNew && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">NEW</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {menu.isBest && <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-[9px] font-bold text-yellow-700">BEST</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleAvailability(menu)}
                      className={`rounded-full px-3 py-1 text-[10px] font-bold transition-colors ${
                        menu.isAvailable
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                    >
                      {menu.isAvailable ? "판매중" : "품절"}
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
