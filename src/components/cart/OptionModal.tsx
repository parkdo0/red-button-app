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
 * 메뉴 옵션 선택 모달
 * 필수/선택 옵션 → 수량 조절 → 장바구니 담기
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

  const toggleOption = useCallback(
    (group: MenuOptionGroup, optionId: number) => {
      setSelected((prev) => {
        const next = new Map(prev);
        const groupSet = new Set(next.get(group.id) ?? []);

        if (group.maxSelect === 1) {
          groupSet.clear();
          groupSet.add(optionId);
        } else {
          if (groupSet.has(optionId)) {
            groupSet.delete(optionId);
          } else if (groupSet.size < group.maxSelect) {
            groupSet.add(optionId);
          }
        }

        next.set(group.id, groupSet);
        return next;
      });
    },
    []
  );

  const isValid = menu.optionGroups
    .filter((g) => g.isRequired)
    .every((g) => (selected.get(g.id)?.size ?? 0) > 0);

  const optionExtra = Array.from(selected.values())
    .flatMap((set) => Array.from(set))
    .reduce((sum, optId) => {
      const opt = menu.optionGroups
        .flatMap((g) => g.options)
        .find((o) => o.id === optId);
      return sum + (opt?.extraPrice ?? 0);
    }, 0);

  const itemTotal = (menu.basePrice + optionExtra) * quantity;

  const handleAdd = () => {
    if (!isValid) return;

    const options: CartItemOption[] = Array.from(selected.values())
      .flatMap((set) => Array.from(set))
      .map((optId) => {
        const opt = menu.optionGroups
          .flatMap((g) => g.options)
          .find((o) => o.id === optId)!;
        return { id: opt.id, name: opt.name, extraPrice: opt.extraPrice };
      });

    addItem(menu, options, quantity);
    showToast(`${menu.name} ${quantity}개 담김!`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-backdrop"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-bg-secondary p-6 animate-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary">{menu.name}</h2>
            {menu.description && (
              <p className="mt-0.5 text-sm text-text-muted">{menu.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-card hover:text-text-primary transition-colors touch-feedback"
          >
            ✕
          </button>
        </div>

        {/* 옵션 그룹 */}
        <div className="flex max-h-60 flex-col gap-5 overflow-y-auto scrollbar-hide">
          {menu.optionGroups.map((group) => (
            <div key={group.id}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary">
                  {group.name}
                </span>
                {group.isRequired && (
                  <span className="rounded bg-red-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-red-primary">
                    필수
                  </span>
                )}
                {group.maxSelect > 1 && (
                  <span className="text-[10px] text-text-muted">
                    (최대 {group.maxSelect}개)
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                {group.options.map((opt) => {
                  const isSelected = selected.get(group.id)?.has(opt.id) ?? false;
                  return (
                    <button
                      key={opt.id}
                      disabled={!opt.isAvailable}
                      onClick={() => toggleOption(group, opt.id)}
                      className={`
                        flex items-center justify-between rounded-lg border px-3 py-2.5
                        text-sm transition-all duration-150 touch-feedback
                        ${
                          isSelected
                            ? "border-red-primary bg-red-primary/10 text-text-primary"
                            : "border-border-default bg-bg-card text-text-secondary hover:border-border-active/30"
                        }
                        ${!opt.isAvailable ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`
                          flex h-4 w-4 items-center justify-center rounded-full border transition-colors
                          ${isSelected ? "border-red-primary bg-red-primary" : "border-text-muted"}
                        `}>
                          {isSelected && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span>{opt.name}</span>
                      </div>
                      {opt.extraPrice > 0 && (
                        <span className="text-xs text-text-muted">
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

        {/* 수량 조절 */}
        <div className="mt-5 flex items-center justify-between rounded-xl bg-bg-card px-4 py-3">
          <span className="text-sm font-medium text-text-secondary">수량</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:bg-bg-card-hover transition-colors touch-feedback"
            >
              −
            </button>
            <span className="w-6 text-center text-base font-bold text-text-primary">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:bg-bg-card-hover transition-colors touch-feedback"
            >
              +
            </button>
          </div>
        </div>

        {/* 담기 버튼 */}
        <button
          onClick={handleAdd}
          disabled={!isValid}
          className={`
            mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5
            text-base font-bold transition-colors touch-feedback
            ${
              isValid
                ? "bg-red-primary text-white hover:bg-red-hover"
                : "bg-bg-card text-text-muted cursor-not-allowed"
            }
          `}
        >
          <span>{formatPrice(itemTotal)}</span>
          <span>담기</span>
        </button>
      </div>
    </div>
  );
}
