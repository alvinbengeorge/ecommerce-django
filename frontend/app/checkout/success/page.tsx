'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <div className="max-w-3xl mx-auto pt-32 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center overflow-hidden relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600" />

                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Order Confirmed!</h1>
                    <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                        Thank you for your purchase. Your order has been securely processed and sent to the seller(s). You will receive an email confirmation shortly.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/orders" className="w-full sm:w-auto px-8 py-3.5 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                            <ShoppingBag className="w-5 h-5" />
                            View Orders
                        </Link>
                        <Link href="/marketplace" className="w-full sm:w-auto px-8 py-3.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200">
                            Continue Shopping
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <p className="text-sm text-gray-400">
                            Order ID: <span className="font-mono text-gray-600">#{Math.floor(Math.random() * 1000000)}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
