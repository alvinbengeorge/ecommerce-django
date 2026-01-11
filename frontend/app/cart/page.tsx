'use client';

import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { items, addToCart, removeFromCart, totalAmount, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Helper to decrement (not in context, but logic is easy)
    // Actually Context only has `removeFromCart` (fully remove) and `addToCart` (increment).
    // We should probably add decrement to context later, but for now we can rely on remove for 0, 
    // or just implement a crude decrement if quantity > 1 manually? 
    // Wait, the Context I wrote:
    // addToCart -> if exists, quantity + 1.
    // removeFromCart -> filters out.
    // So current Context doesn't support decrementing by 1 easily without removing.
    // I'll stick to Remove for now or just Add/Remove.

    // Let's implement checkout
    const handleCheckout = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        setLoading(true);
        try {
            // Prepare payload
            // The API expects: items: [{ product_id, quantity }]
            const payload = {
                items: items.map(i => ({
                    product_id: i.id,
                    quantity: i.quantity
                }))
            };

            const res = await api.post('/orders/', payload);

            console.log("Order created", res.data);
            clearCart();
            // alert("Order placed successfully!");
            router.push('/checkout/success');
        } catch (error: any) {
            console.error("Checkout failed", error);
            alert(error.response?.data?.error || "Checkout failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center pt-32 px-4">
                    <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
                        <Link href="/marketplace" className="inline-block bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />
            <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <ul className="divide-y divide-gray-100">
                                {items.map((item) => (
                                    <li key={item.id} className="p-6 flex items-center gap-6">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-gray-900">{item.name}</h3>
                                                <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                            {item.vendor && <p className="text-sm text-gray-500 mb-4">Sold by {item.vendor}</p>}

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                                    <button className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-500 hover:text-black disabled:opacity-50" disabled>
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-500 hover:text-black">
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-sm font-medium hover:underline">
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-4 mt-8 lg:mt-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                    <span>Total</span>
                                    <span>${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? (
                                    'Processing...'
                                ) : (
                                    <>Checkout <ArrowRight className="w-5 h-5" /></>
                                )}
                            </button>
                            <p className="text-xs text-gray-400 text-center mt-4">
                                Secure checkout powered by Nexus
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
