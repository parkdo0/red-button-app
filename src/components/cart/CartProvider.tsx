"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { type MenuItem } from "@/data/constants";

// ============================================
// 장바구니 아이템 타입
// ============================================

export interface CartItemOption {
  id: number;
  name: string;
  extraPrice: number;
}

export interface CartItem {
  /** 장바구니 내 고유 키 (같은 메뉴 + 다른 옵션 = 별도 항목) */
  cartId: string;
  menuId: number;
  menuName: string;
  basePrice: number;
  quantity: number;
  selectedOptions: CartItemOption[];
  /** (basePrice + 옵션 합) * quantity */
  subTotal: number;
}

// ============================================
// Context
// ============================================

interface CartContextType {
  items: CartItem[];
  totalPrice: number;
  totalCount: number;
  addItem: (menu: MenuItem, options: CartItemOption[], quantity: number) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

/** 선택 옵션 조합으로 고유 cartId 생성 */
function generateCartId(menuId: number, options: CartItemOption[]): string {
  const optionKey = options
    .map((o) => o.id)
    .sort((a, b) => a - b)
    .join("-");
  return `${menuId}:${optionKey}`;
}

/** 소계 계산 */
function calcSubTotal(
  basePrice: number,
  options: CartItemOption[],
  quantity: number
): number {
  const optionTotal = options.reduce((sum, o) => sum + o.extraPrice, 0);
  return (basePrice + optionTotal) * quantity;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback(
    (menu: MenuItem, options: CartItemOption[], quantity: number) => {
      setItems((prev) => {
        const cartId = generateCartId(menu.id, options);
        const existing = prev.find((item) => item.cartId === cartId);

        if (existing) {
          const newQty = existing.quantity + quantity;
          return prev.map((item) =>
            item.cartId === cartId
              ? {
                  ...item,
                  quantity: newQty,
                  subTotal: calcSubTotal(item.basePrice, item.selectedOptions, newQty),
                }
              : item
          );
        }

        return [
          ...prev,
          {
            cartId,
            menuId: menu.id,
            menuName: menu.name,
            basePrice: menu.basePrice,
            quantity,
            selectedOptions: options,
            subTotal: calcSubTotal(menu.basePrice, options, quantity),
          },
        ];
      });
    },
    []
  );

  const updateQuantity = useCallback((cartId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.cartId !== cartId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            subTotal: calcSubTotal(item.basePrice, item.selectedOptions, newQty),
          };
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const removeItem = useCallback((cartId: string) => {
    setItems((prev) => prev.filter((item) => item.cartId !== cartId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalPrice = items.reduce((sum, item) => sum + item.subTotal, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, totalPrice, totalCount, addItem, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart는 CartProvider 내에서 사용해야 합니다.");
  return ctx;
}
