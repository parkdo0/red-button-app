"use client";

import { useState } from "react";
import { MOCK_STORES, type StoreInfo } from "@/data/mock-admin";
import { formatPrice } from "@/data/mock";

/**
 * 본사 > 전체 매장 현황
 * 카드 그리드 형태로 매장별 운영 현황 표시
 */
export default function HQStoresPage() {
  const [stores, setStores] = useState<StoreInfo[]>(MOCK_STORES);

  const totalRevenue = stores.reduce((s, st) => s + st.todayRevenue, 0);
  const totalOrders = stores.reduce((s, st) => s + st.todayOrders, 0);
  const activeStores = stores.filter((s) => s.isActive).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">매장 현황</h1>
            <p className="text-xs text-gray-500">
              전체 {stores.length}개 · 운영 중 {activeStores}개 · 오늘 합산 매출 {formatPrice(totalRevenue)}
            </p>
          </div>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
            + 매장 추가
          </button>
        </div>

        {/* 매장 카드 그리드 */}
        <div className="grid grid-cols-2 gap-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className={`rounded-xl border p-5 transition-colors ${
                store.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              {/* 매장명 + 상태 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold ${
                    store.isActive ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-400"
                  }`}>
                    {store.name[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{store.name}</h3>
                    <p className="text-[10px] text-gray-400">{store.address}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  store.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                }`}>
                  {store.isActive ? "운영 중" : "비활성"}
                </span>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-4 gap-3">
                <MiniStat label="테이블" value={`${store.tableCount}개`} />
                <MiniStat label="보유 게임" value={`${store.gameCount}종`} />
                <MiniStat label="오늘 주문" value={`${store.todayOrders}건`} />
                <MiniStat label="오늘 매출" value={store.todayRevenue > 0 ? `${(store.todayRevenue / 10000).toFixed(1)}만` : "-"} />
              </div>

              {/* 액션 */}
              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
                <button className="flex-1 rounded-lg bg-gray-50 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-100">
                  상세 보기
                </button>
                <button className="flex-1 rounded-lg bg-gray-50 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-100">
                  설정
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-2 text-center">
      <p className="text-[9px] text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}
