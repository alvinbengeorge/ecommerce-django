'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
    id: number;
    name: string;
    price: number; // Stored as string or number from API? usually string '10.00'
    quantity: number;
    image?: string;
    vendor?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    totalAmount: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // 1. Load from LocalStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('cart');
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse cart", e);
                localStorage.removeItem('cart');
            }
        }
    }, []);

    // 2. Save to LocalStorage whenever items change (but not on initial mount if empty to avoid wiping)
    // Actually, simple way: always save on change, but need to be careful with hydration.
    // Let's just use a separate effect that runs only after mount.
    useEffect(() => {
        // We can just save it.
        if (items.length >= 0) { // always save
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items]);

    const addToCart = (product: any) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                // Increment
                return prev.map(i =>
                    i.id === product.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            // New Item
            return [...prev, {
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                quantity: 1,
                vendor: product.tenant_name // assuming API returns this? if not we might miss it
            }];
        });
    };

    const removeFromCart = (id: number) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalAmount, totalItems }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
