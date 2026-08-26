"use client";

import { createContext, useContext, useState, useMemo } from "react";
import { products, Product } from "@/data/products";

export interface CartItem {
  id: string;
  name: string;
  producer: string;
  price: string;
  numericPrice: number;
  image: string;
  quantity: number;
  volume?: string;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  subtotal: number;
  estimatedTax: number;
  shippingFee: number;
  grandTotal: number;
  cartOpen: boolean;
  addToCart: (product?: Partial<Product> | null, quantityToAdd?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (product?: Partial<Product> | null, quantityToAdd: number = 1) => {
    // Default fallback to first product if no product passed
    const targetProduct = product && product.name ? product : products[0];

    const targetId = targetProduct.id || "1";
    const name = targetProduct.name || "Muga Reserva 2019";
    const producer = targetProduct.producer || "Bodegas Muga";
    const price = targetProduct.price || "$24.99";
    const numericPrice =
      targetProduct.numericPrice ||
      parseFloat(price.replace(/[^0-9.]/g, "")) ||
      24.99;
    const image =
      targetProduct.image ||
      "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=900&q=85";
    const volume = targetProduct.volume || "750 ml";

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === targetId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantityToAdd,
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: targetId,
            name,
            producer,
            price,
            numericPrice,
            image,
            quantity: quantityToAdd,
            volume,
          },
        ];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const count = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.numericPrice * item.quantity, 0);
  }, [items]);

  const estimatedTax = useMemo(() => {
    return subtotal > 0 ? subtotal * 0.08 : 0; // 8% estimated tax
  }, [subtotal]);

  const shippingFee = 0; // Free climate-controlled express shipping

  const grandTotal = useMemo(() => {
    return subtotal + estimatedTax + shippingFee;
  }, [subtotal, estimatedTax, shippingFee]);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        estimatedTax,
        shippingFee,
        grandTotal,
        cartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        openCart: () => setCartOpen(true),
        closeCart: () => setCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
