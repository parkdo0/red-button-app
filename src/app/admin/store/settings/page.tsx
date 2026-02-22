"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/components/SessionProvider";

/**
 * 매장 > 설정
 * Wi-Fi, 영업시간, 매장 기본 정보 관리
 */
export default function StoreSettingsPage() {
  const session = useSession();
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    wifiId: "",
    wifiPw: "",
    openTime: "10:00",
    closeTime: "23:00",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.storeId) return;
    fetch(`/api/stores/${session.storeId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setForm({
            name: data.name ?? "",
            address: data.address ?? "",
            phone: data.phone ?? "",
            wifiId: data.wifiId ?? "",
            wifiPw: data.wifiPw ?? "",
            openTime: data.openTime ?? "10:00",
            closeTime: data.closeTime ?? "23:00",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session?.storeId]);

  const update = <K extends keyof typeof form>(key: K, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!session?.storeId) return;
    try {
      const res = await fetch(`/api/stores/${session.storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">매장 설정</h1>
            <p className="text-xs text-gray-500">매장 기본 정보 및 Wi-Fi 설정</p>
          </div>
          <button
            onClick={handleSave}
            className={`rounded-lg px-5 py-2 text-sm font-bold transition-colors ${
              saved ? "bg-green-600 text-white" : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {saved ? "저장됨" : "저장"}
          </button>
        </div>

        {/* 매장 정보 */}
        <Section title="매장 정보">
          <Field label="매장명">
            <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} />
          </Field>
          <Field label="주소">
            <input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputCls} />
          </Field>
          <Field label="전화번호">
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputCls} />
          </Field>
        </Section>

        {/* 영업시간 */}
        <Section title="영업 시간">
          <div className="grid grid-cols-2 gap-4">
            <Field label="오픈">
              <input type="time" value={form.openTime} onChange={(e) => update("openTime", e.target.value)} className={inputCls} />
            </Field>
            <Field label="마감">
              <input type="time" value={form.closeTime} onChange={(e) => update("closeTime", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* Wi-Fi */}
        <Section title="Wi-Fi 정보">
          <p className="mb-3 text-xs text-gray-400">태블릿 앱 이용 정보 화면에 표시됩니다</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Wi-Fi ID">
              <input value={form.wifiId} onChange={(e) => update("wifiId", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Wi-Fi 비밀번호">
              <input value={form.wifiPw} onChange={(e) => update("wifiPw", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* 위험 영역 */}
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
          <h2 className="text-sm font-bold text-red-700">위험 영역</h2>
          <p className="mt-1 text-xs text-red-500/80">이 작업은 되돌릴 수 없습니다.</p>
          <div className="mt-3 flex gap-3">
            <button className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50">
              전체 데이터 초기화
            </button>
            <button className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50">
              매장 비활성화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 헬퍼 컴포넌트 ──
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-bold text-gray-900">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-600">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-red-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-200";
