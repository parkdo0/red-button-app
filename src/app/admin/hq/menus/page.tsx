"use client";

import { useState, useEffect, useMemo } from "react";
import { formatPrice } from "@/data/constants";

interface MenuItem {
  id: number;
  categoryName: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number;
  isAvailable: boolean;
  isNew: boolean;
  isBest: boolean;
  optionGroups: { id: number; name: string; options: { id: number; name: string }[] }[];
}

export default function HQMenusPage() {
  const [activeTab, setActiveTab] = useState("전체");
  const [search, setSearch] = useState("");
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", basePrice: 0, description: "", imageUrl: "" });
  const [uploading, setUploading] = useState(false);

  const tabs = ["전체", "푸드", "음료", "벌칙메뉴", "MD상품"];

  const fetchMenus = () => {
    fetch("/api/menus")
      .then((r) => r.json())
      .then((data) => { setMenus(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMenus(); }, []);

  const filtered = useMemo(() => {
    return menus.filter((m) => {
      const matchTab = activeTab === "전체" || m.categoryName === activeTab;
      const matchSearch = !search || m.name.includes(search);
      return matchTab && matchSearch;
    });
  }, [menus, activeTab, search]);

  const startEdit = (menu: MenuItem) => {
    setEditingId(menu.id);
    setEditForm({ name: menu.name, basePrice: menu.basePrice, description: menu.description ?? "", imageUrl: menu.imageUrl ?? "" });
  };

  const handleMenuImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "menus");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setEditForm((f) => ({ ...f, imageUrl: url }));
      }
    } catch {} finally { setUploading(false); }
  };

  const saveEdit = async (menuId: number) => {
    await fetch(`/api/menus/${menuId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editForm.name, basePrice: editForm.basePrice, description: editForm.description, imageUrl: editForm.imageUrl || null }),
    });
    setEditingId(null);
    fetchMenus();
  };

  const toggleActive = async (menuId: number, current: boolean) => {
    await fetch(`/api/menus/${menuId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    fetchMenus();
  };

  const toggleBadge = async (menuId: number, badge: "isNew" | "isBest", current: boolean) => {
    await fetch(`/api/menus/${menuId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [badge]: !current }),
    });
    fetchMenus();
  };

  const deleteMenu = async (menuId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/menus/${menuId}`, { method: "DELETE" });
    fetchMenus();
  };

  if (loading) return <div className="flex h-full items-center justify-center text-gray-400">로딩 중...</div>;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">메뉴 관리</h1>
            <p className="text-xs text-gray-500">전체 {menus.length}종 · 마스터 메뉴 DB</p>
          </div>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">+ 새 메뉴 등록</button>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === tab ? "bg-red-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{tab}</button>
            ))}
          </div>
          <div className="relative ml-auto">
            <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="메뉴명 검색..." className="w-48 rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-1.5 text-xs focus:border-red-300 focus:outline-none" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-500 w-[40px]">ID</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-500">메뉴명</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-500 w-[80px]">카테고리</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-bold text-gray-500 w-[100px]">기본가격</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-500 w-[60px]">NEW</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-500 w-[60px]">BEST</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-500 w-[60px]">옵션</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-500 w-[60px]">상태</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-bold text-gray-500 w-[100px]">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((menu) => {
              const isEditing = editingId === menu.id;
              return (
                <tr key={menu.id} className={`transition-colors ${!menu.isAvailable ? "bg-gray-50/50" : "bg-white"}`}>
                  <td className="px-4 py-3 text-xs text-gray-400">{menu.id}</td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {editForm.imageUrl && <img src={editForm.imageUrl} alt="" className="h-10 w-10 rounded object-cover border border-gray-200" />}
                          <label className={`cursor-pointer rounded px-2 py-1 text-[10px] font-medium ${uploading ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {uploading ? '업로드중...' : '이미지'}
                            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMenuImageUpload(f); }} />
                          </label>
                        </div>
                        <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded border border-blue-300 bg-blue-50/30 px-2 py-1 text-sm font-medium" />
                        <input value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} placeholder="설명" className="w-full rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-500" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {menu.imageUrl && <img src={menu.imageUrl} alt="" className="h-10 w-10 rounded object-cover border border-gray-200" />}
                        <div>
                          <span className="text-sm font-medium text-gray-900">{menu.name}</span>
                          {menu.description && <p className="text-[10px] text-gray-400 mt-0.5">{menu.description}</p>}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{menu.categoryName}</td>
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <input type="number" value={editForm.basePrice} onChange={(e) => setEditForm((f) => ({ ...f, basePrice: +e.target.value }))} className="w-20 rounded border border-blue-300 bg-blue-50/30 px-2 py-1 text-right text-sm font-bold" />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{formatPrice(menu.basePrice)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleBadge(menu.id, "isNew", menu.isNew)} className="text-[10px]">
                      {menu.isNew ? <span className="rounded bg-red-100 px-1.5 py-0.5 font-bold text-red-600">NEW</span> : <span className="text-gray-300">-</span>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleBadge(menu.id, "isBest", menu.isBest)} className="text-[10px]">
                      {menu.isBest ? <span className="rounded bg-yellow-100 px-1.5 py-0.5 font-bold text-yellow-700">BEST</span> : <span className="text-gray-300">-</span>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs text-gray-400">{menu.optionGroups.length > 0 ? `${menu.optionGroups.length}개` : "-"}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(menu.id, menu.isAvailable)}>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${menu.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                        {menu.isAvailable ? "활성" : "비활성"}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <div className="flex justify-center gap-1">
                        <button onClick={() => saveEdit(menu.id)} className="rounded bg-blue-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-blue-700">저장</button>
                        <button onClick={() => setEditingId(null)} className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-500 hover:bg-gray-200">취소</button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-1">
                        <button onClick={() => startEdit(menu)} className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-600 hover:bg-gray-200"></button>
                        <button onClick={() => deleteMenu(menu.id)} className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-600 hover:bg-red-100 hover:text-red-600"></button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="flex h-32 items-center justify-center text-sm text-gray-400">검색 결과 없음</div>}
      </div>
    </div>
  );
}
