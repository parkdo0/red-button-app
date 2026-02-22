"use client";

import { useState, useEffect } from "react";

interface Coupon {
  id: number;
  code: string;
  name: string;
  discountAmount: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  _count: { usages: number };
}

const initialForm = {
  code: "",
  name: "",
  discountAmount: 1000,
  minOrderAmount: 0,
  maxUses: "",
  startDate: "",
  endDate: "",
};

export default function HqCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/coupons?page=1&limit=50");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.code.trim() || !form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          discountAmount: form.discountAmount,
          minOrderAmount: form.minOrderAmount,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        }),
      });
      if (res.ok) {
        setForm(initialForm);
        setShowForm(false);
        load();
      }
    } catch {} finally { setSaving(false); }
  };

  const toggleActive = async (couponId: number, current: boolean) => {
    await fetch(`/api/coupons/${couponId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    load();
  };

  const deleteCoupon = async (couponId: number) => {
    if (!confirm("정말 비활성화하시겠습니까?")) return;
    await fetch(`/api/coupons/${couponId}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="flex h-full items-center justify-center text-gray-400">로딩 중...</div>;

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">쿠폰 관리</h1>
            <p className="text-xs text-gray-500">전체 {coupons.length}개</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
          >
            {showForm ? "닫기" : "+ 새 쿠폰"}
          </button>
        </div>
      </div>

      {/* 생성 폼 */}
      {showForm && (
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-3 gap-3 max-w-3xl">
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">쿠폰 코드 *</label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="WELCOME2024"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">쿠폰명 *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="신규 회원 1000원 할인"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">할인금액 (원) *</label>
              <input
                type="number"
                value={form.discountAmount}
                onChange={(e) => setForm((f) => ({ ...f, discountAmount: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">최소 주문금액</label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">최대 사용횟수</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder="무제한"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCreate}
                disabled={saving || !form.code.trim() || !form.name.trim()}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-gray-300"
              >
                {saving ? "저장 중..." : "생성"}
              </button>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">시작일</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">종료일</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* 쿠폰 목록 */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-500">코드</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-500">쿠폰명</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-bold text-gray-500">할인</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-bold text-gray-500">최소금액</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-500">사용/제한</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-500">기간</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-500">상태</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-500">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map((c) => (
              <tr key={c.id} className={`${!c.isActive ? "bg-gray-50/50" : "bg-white"}`}>
                <td className="px-4 py-3">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono font-bold text-gray-700">{c.code}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-red-600">
                  {c.discountAmount.toLocaleString()}원
                </td>
                <td className="px-4 py-3 text-right text-xs text-gray-500">
                  {c.minOrderAmount > 0 ? `${c.minOrderAmount.toLocaleString()}원` : "-"}
                </td>
                <td className="px-4 py-3 text-center text-xs text-gray-500">
                  {c.usedCount}{c.maxUses ? `/${c.maxUses}` : "/∞"}
                </td>
                <td className="px-4 py-3 text-center text-[11px] text-gray-400">
                  {c.startDate ? new Date(c.startDate).toLocaleDateString("ko-KR") : ""}
                  {c.startDate && c.endDate ? " ~ " : ""}
                  {c.endDate ? new Date(c.endDate).toLocaleDateString("ko-KR") : ""}
                  {!c.startDate && !c.endDate && "상시"}
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleActive(c.id, c.isActive)}>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                      {c.isActive ? "활성" : "비활성"}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => deleteCoupon(c.id)} className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-600 hover:bg-red-100 hover:text-red-600">
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <div className="flex h-32 items-center justify-center text-sm text-gray-400">등록된 쿠폰이 없습니다</div>
        )}
      </div>
    </div>
  );
}
