"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/data/constants";

interface StoreInfo {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  wifiId: string | null;
  wifiPw: string | null;
  openTime: string | null;
  closeTime: string | null;
  isActive: boolean;
  tableCount: number;
  gameCount: number;
  todayOrders: number;
  todayRevenue: number;
}

type ModalType = null | "add" | "detail" | "settings";

export default function HQStoresPage() {
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [addForm, setAddForm] = useState({ name: "", address: "", phone: "" });
  const [settingsForm, setSettingsForm] = useState({ name: "", address: "", phone: "", openTime: "", closeTime: "", wifiId: "", wifiPw: "", isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchStores = () => {
    fetch("/api/stores")
      .then((r) => r.json())
      .then((data) => { setStores(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchStores(); }, []);

  const openDetail = (store: StoreInfo) => { setSelectedStore(store); setModal("detail"); };
  const openSettings = (store: StoreInfo) => {
    setSelectedStore(store);
    setSettingsForm({
      name: store.name,
      address: store.address ?? "",
      phone: store.phone ?? "",
      openTime: store.openTime ?? "10:00",
      closeTime: store.closeTime ?? "23:00",
      wifiId: store.wifiId ?? "",
      wifiPw: store.wifiPw ?? "",
      isActive: store.isActive,
    });
    setModal("settings");
  };

  const createStore = async () => {
    if (!addForm.name.trim()) return;
    setSaving(true);
    await fetch("/api/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    setSaving(false);
    setModal(null);
    setAddForm({ name: "", address: "", phone: "" });
    fetchStores();
  };

  const saveSettings = async () => {
    if (!selectedStore) return;
    setSaving(true);
    await fetch(`/api/stores/${selectedStore.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsForm),
    });
    setSaving(false);
    setModal(null);
    fetchStores();
  };

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
          <button onClick={() => setModal("add")} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">+ 매장 추가</button>
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
                <button onClick={() => openDetail(store)} className="flex-1 rounded-lg bg-gray-50 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-100">상세 보기</button>
                <button onClick={() => openSettings(store)} className="flex-1 rounded-lg bg-gray-50 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-100">설정</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 매장 추가 모달 */}
      {modal === "add" && (
        <Modal title="매장 추가" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <Field label="매장명 *" value={addForm.name} onChange={(v) => setAddForm((f) => ({ ...f, name: v }))} placeholder="예: 강남점" />
            <Field label="주소" value={addForm.address} onChange={(v) => setAddForm((f) => ({ ...f, address: v }))} placeholder="선택사항" />
            <Field label="전화번호" value={addForm.phone} onChange={(v) => setAddForm((f) => ({ ...f, phone: v }))} placeholder="선택사항" />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setModal(null)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200">취소</button>
            <button onClick={createStore} disabled={!addForm.name.trim() || saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">{saving ? "생성 중..." : "생성"}</button>
          </div>
        </Modal>
      )}

      {/* 매장 상세 보기 모달 */}
      {modal === "detail" && selectedStore && (
        <Modal title={`${selectedStore.name} 상세`} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="매장 ID" value={`#${selectedStore.id}`} />
              <InfoRow label="상태" value={selectedStore.isActive ? "운영 중" : "비활성"} />
              <InfoRow label="주소" value={selectedStore.address ?? "-"} />
              <InfoRow label="전화" value={selectedStore.phone ?? "-"} />
              <InfoRow label="영업시간" value={`${selectedStore.openTime ?? "-"} ~ ${selectedStore.closeTime ?? "-"}`} />
              <InfoRow label="Wi-Fi" value={selectedStore.wifiId ? `${selectedStore.wifiId} / ${selectedStore.wifiPw}` : "-"} />
            </div>
            <div className="border-t border-gray-100 pt-3">
              <h3 className="text-xs font-bold text-gray-700 mb-2">오늘 운영 현황</h3>
              <div className="grid grid-cols-4 gap-3">
                <MiniStat label="테이블" value={`${selectedStore.tableCount}개`} />
                <MiniStat label="보유 게임" value={`${selectedStore.gameCount}종`} />
                <MiniStat label="오늘 주문" value={`${selectedStore.todayOrders}건`} />
                <MiniStat label="오늘 매출" value={formatPrice(selectedStore.todayRevenue)} />
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={() => setModal(null)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200">닫기</button>
          </div>
        </Modal>
      )}

      {/* 매장 설정 모달 */}
      {modal === "settings" && selectedStore && (
        <Modal title={`${selectedStore.name} 설정`} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <Field label="매장명" value={settingsForm.name} onChange={(v) => setSettingsForm((f) => ({ ...f, name: v }))} />
            <Field label="주소" value={settingsForm.address} onChange={(v) => setSettingsForm((f) => ({ ...f, address: v }))} />
            <Field label="전화번호" value={settingsForm.phone} onChange={(v) => setSettingsForm((f) => ({ ...f, phone: v }))} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="오픈 시간" value={settingsForm.openTime} onChange={(v) => setSettingsForm((f) => ({ ...f, openTime: v }))} placeholder="10:00" />
              <Field label="마감 시간" value={settingsForm.closeTime} onChange={(v) => setSettingsForm((f) => ({ ...f, closeTime: v }))} placeholder="23:00" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Wi-Fi ID" value={settingsForm.wifiId} onChange={(v) => setSettingsForm((f) => ({ ...f, wifiId: v }))} />
              <Field label="Wi-Fi PW" value={settingsForm.wifiPw} onChange={(v) => setSettingsForm((f) => ({ ...f, wifiPw: v }))} />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <input type="checkbox" checked={settingsForm.isActive} onChange={(e) => setSettingsForm((f) => ({ ...f, isActive: e.target.checked }))} />
                매장 활성화
              </label>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setModal(null)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200">취소</button>
            <button onClick={saveSettings} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">{saving ? "저장 중..." : "저장"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── 공통 컴포넌트 ── */

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-2 text-center">
      <p className="text-[9px] text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-base font-bold text-gray-900">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-red-300 focus:outline-none" />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
