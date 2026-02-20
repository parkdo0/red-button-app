"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/data/constants";

interface StoreInfo {
  id: number;
  name: string;
  address: string | null;
  isActive: boolean;
  tableCount: number;
  gameCount: number;
  todayOrders: number;
  todayRevenue: number;
}

export default function HQStoresPage() {
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stores")
      .then((r) => r.json())
      .then((data) => { setStores(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center text-gray-400">로딩 중...</div>;

  const totalRevenue = stores.reduce((s, st) => s + st.todayRevenue, 0);
  const activeStores = stores.filter((s) => s.isActive).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">매장 현황</h1>
            <p className="text-xs text-gray-500">전체 {stores.length}개 · 운영 중 {activeStores}개 · 오늘 합산 매출 {formatPrice(totalRevenue)}</p>
          </div>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">+ 매장 추가</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stores.map((store) => (
            <div key={store.id} className={`rounded-xl border p-5 transition-colors ${store.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold ${store.isActive ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-400"}`}>
                    {store.name[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{store.name}</h3>
                    <p className="text-[10px] text-gray-400">{store.address ?? "-"}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${store.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                  {store.isActive ? "운영 중" : "비활성"}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <MiniStat label="테이블" value={`${store.tableCount}개`} />
                <MiniStat label="보유 게임" value={`${store.gameCount}종`} />
                <MiniStat label="오늘 주문" value={`${store.todayOrders}건`} />
                <MiniStat label="오늘 매출" value={store.todayRevenue > 0 ? `${(store.todayRevenue / 10000).toFixed(1)}만` : "-"} />
              </div>
              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
                <button className="flex-1 rounded-lg bg-gray-50 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-100">상세 보기</button>
                <button className="flex-1 rounded-lg bg-gray-50 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-100">설정</button>
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
