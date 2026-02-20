"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface StoreStats {
  id: number;
  name: string;
  isActive: boolean;
  tableCount: number;
  gameCount: number;
  todayOrders: number;
  todayRevenue: number;
}

interface HQDashboardData {
  totalGames: number;
  activeStores: number;
  totalStores: number;
  totalOrders: number;
  totalRevenue: number;
  stores: StoreStats[];
}

/**
 * 본사 대시보드 - 전체 매장 현황 + 통계 요약
 */
export default function HQDashboardPage() {
  const [data, setData] = useState<HQDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/hq")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center text-gray-400">로딩 중...</div>;
  if (!data) return <div className="flex h-full items-center justify-center text-gray-400">데이터를 불러올 수 없습니다.</div>;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">본사 대시보드</h1>
          <p className="mt-1 text-sm text-gray-500">전체 매장 운영 현황을 한눈에 확인하세요</p>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-4">
          <StatCard label="운영 매장" value={`${data.activeStores}개`} sub={`전체 ${data.totalStores}개`} color="blue" />
          <StatCard label="등록 게임" value={`${data.totalGames}종`} sub="마스터 DB 기준" color="purple" />
          <StatCard label="오늘 주문" value={`${data.totalOrders}건`} sub="전 매장 합산" color="green" />
          <StatCard label="오늘 매출" value={`${(data.totalRevenue / 10000).toFixed(1)}만원`} sub="전 매장 합산" color="red" />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-bold text-gray-900">매장별 현황</h2>
            <Link href="/admin/hq/stores" className="text-xs text-red-600 hover:underline">전체 보기 →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left font-semibold text-gray-500">매장명</th>
                  <th className="px-5 py-3 text-center font-semibold text-gray-500">테이블</th>
                  <th className="px-5 py-3 text-center font-semibold text-gray-500">보유 게임</th>
                  <th className="px-5 py-3 text-center font-semibold text-gray-500">오늘 주문</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-500">오늘 매출</th>
                  <th className="px-5 py-3 text-center font-semibold text-gray-500">상태</th>
                </tr>
              </thead>
              <tbody>
                {data.stores.map((store) => (
                  <tr key={store.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{store.name}</td>
                    <td className="px-5 py-3 text-center text-gray-600">{store.tableCount}석</td>
                    <td className="px-5 py-3 text-center text-gray-600">{store.gameCount}종</td>
                    <td className="px-5 py-3 text-center text-gray-600">{store.todayOrders}건</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">{store.todayRevenue.toLocaleString()}원</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        store.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {store.isActive ? "운영중" : "휴점"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <QuickLink href="/admin/hq/games" icon="🎲" label="게임 관리" desc="마스터 게임 DB 관리" />
          <QuickLink href="/admin/hq/menus" icon="🍽" label="메뉴 관리" desc="F&B 메뉴 관리" />
          <QuickLink href="/admin/hq/events" icon="🎪" label="이벤트 관리" desc="배너 & 프로모션" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-600", purple: "text-purple-600", green: "text-green-600", red: "text-red-600",
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${colors[color] ?? "text-gray-900"}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-gray-400">{sub}</p>
    </div>
  );
}

function QuickLink({ href, icon, label, desc }: { href: string; icon: string; label: string; desc: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 transition-all hover:border-red-200 hover:shadow-sm">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm font-bold text-gray-900 group-hover:text-red-600">{label}</p>
        <p className="text-[11px] text-gray-400">{desc}</p>
      </div>
    </Link>
  );
}
