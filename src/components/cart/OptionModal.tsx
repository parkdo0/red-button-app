"use client";

import { useState, useCallback } from "react";
import { type MenuItem, type MenuOptionGroup, formatPrice } from "@/data/mock";
import { useCart, type CartItemOption } from "@/components/cart/CartProvider";
import { useToast } from "@/components/ToastProvider";

interface Props {
  menu: MenuItem;
  onClose: () => void;
}

/**
 * 메뉴 옵션 선택 모달 - 라이트 테마 (실제 레드버튼 앱 기준)
 * 주문 페이지가 흰색 배경이므로 모달도 라이트
 */
export default function OptionModal({ menu, onClose }: Props) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [selected, setSelected] = useState<Map<number, Set<number>>>(() => {
    const initial = new Map<number, Set<number>>();
    menu.optionGroups.forEach((group) => {
      if (group.isRequired && group.options.length > 0) {
        initial.set(group.id, new Set([group.options[0].id]));
      } else {
        initial.set(group.id, new Set());
      }
    });
    return initial;
  });

  const [quantity, setQuantity] = useState(1);

  const toggleOption = useCallback((group: MenuOptionGroup, optionId: number) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const groupSet = new Set(next.get(group.id) ?? []);
      if (group.maxSelect === 1) {
        groupSet.clear();
        groupSet.add(optionId);
      } else {
        if (groupSet.has(optionId)) groupSet.delete(optionId);
        else if (groupSet.size < group.maxSelect) groupSet.add(optionId);
      }
      next.set(group.id, groupSet);
      return next;
    });
  }, []);

  /** 필수 옵션 모두 선택했는지 검증 */
  const isValid = menu.optionGroups
    .filter((g) => g.isRequired)
    .every((g) => (selected.get(g.id)?.size ?? 0) > 0);

  /** 선택된 옵션 추가 금액 합산 */
  const optionExtra = Array.from(selected.values())
    .flatMap((set) => Array.from(set))
    .reduce((sum, optId) => {
      const opt = menu.optionGroups.flatMap((g) => g.options).find((o) => o.id === optId);
      return sum + (opt?.extraPrice ?? 0);
    }, 0);

  const itemTotal = (menu.basePrice + optionExtra) * quantity;

  const handleAdd = () => {
    if (!isValid) return;
    const options: CartItemOption[] = Array.from(selected.values())
      .flatMap((set) => Array.from(set))
      .map((optId) => {
        const opt = menu.optionGroups.flatMap((g) => g.options).find((o) => o.id === optId)!;
        return { id: opt.id, name: opt.name, extraPrice: opt.extraPrice };
      });
    addItem(menu, options, quantity);
    showToast(`${menu.name} ${quantity}개 담김!`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">{menu.name}</h2>
            {menu.description && (
              <p className="mt-1 text-sm text-gray-500">{menu.description}</p>
            )}
            <p className="mt-1 text-base font-bold text-red-600">
              {formatPrice(menu.basePrice)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 옵션 그룹 */}
        <div className="flex max-h-60 flex-col gap-5 overflow-y-auto">
          {menu.optionGroups.map((group) => (
            <div key={group.id}>
              <div className="mb-2.5 flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">{group.name}</span>
                {group.isRequired && (
                  <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600 border border-red-200">
                    필수
                  </span>
                )}
                {group.maxSelect > 1 && (
                  <span className="text-[10px] text-gray-400">(최대 {group.maxSelect}개)</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {group.options.map((opt) => {
                  const isSelected = selected.get(group.id)?.has(opt.id) ?? false;
                  return (
                    <button
                      key={opt.id}
                      disabled={!opt.isAvailable}
                      onClick={() => toggleOption(group, opt.id)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all
                        ${isSelected
                          ? "border-red-500 bg-red-50 text-gray-900"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }
                        ${!opt.isAvailable ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center gap-2.5">
                        {/* 라디오/체크 표시 */}
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors
                            ${isSelected ? "border-red-600 bg-red-600" : "border-gray-300"}`}
                        >
                          {isSelected && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium">{opt.name}</span>
                      </div>
                      {opt.extraPrice > 0 && (
                        <span className="text-xs font-medium text-gray-400">
                          +{formatPrice(opt.extraPrice)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 수량 */}
        <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-5 py-3">
          <span className="text-sm font-semibold text-gray-600">수량</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
            >
              −
            </button>
            <span className="w-6 text-center text-base font-bold text-gray-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* 담기 버튼 */}
        <button
          onClick={handleAdd}
          disabled={!isValid}
          className={`mt-4 w-full rounded-xl py-3.5 text-base font-bold transition-all
            ${isValid
              ? "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
        >
          {formatPrice(itemTotal)} 담기
        </button>
      </div>
    </div>
  );
}
