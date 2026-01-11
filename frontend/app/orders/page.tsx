'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Package, Truck, Clock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    items: OrderItem[];
    total_amount: number;
    status: string;
    created_at: string;
    tenant_name?: string; // If available
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders/');
                setOrders(res.data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        const token = localStorage.getItem('access_token');
        if (token) {
            fetchOrders();
        } else {
            setLoading(false); // Or redirect
        }
    }, []);

    const toggleOrder = (id: number) => {
        if (expandedOrder === id) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(id);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-5 h-5 text-orange-500" />;
            case 'SHIPPED': return <Truck className="w-5 h-5 text-blue-500" />;
            case 'DELIVERED': return <CheckCircle className="w-5 h-5 text-green-500" />;
            default: return <Package className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'SHIPPED': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'DELIVERED': return 'bg-green-50 text-green-700 border-green-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />
            <div className="max-w-4xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                        <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-6">Looks like you haven&apos;t ordered anything yet.</p>
                        <Link href="/marketplace" className="inline-block bg-black text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-colors">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-shadow hover:shadow-md">
                                <div
                                    onClick={() => toggleOrder(order.id)}
                                    className="p-6 cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                            <Package className="w-6 h-6 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Order #{order.id}</p>
                                            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </div>
                                        <div className="text-right hidden sm:block">
                                            <p className="font-bold text-gray-900">${order.total_amount}</p>
                                            <p className="text-xs text-gray-500">{order.items.length} Items</p>
                                        </div>
                                        {expandedOrder === order.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                    </div>
                                </div>

                                {expandedOrder === order.id && (
                                    <div className="border-t border-gray-100 bg-gray-50 p-6 animate-in slide-in-from-top-2">
                                        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Order Items</h4>
                                        <ul className="space-y-3">
                                            {order.items.map((item) => (
                                                <li key={item.id} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-400">
                                                            x{item.quantity}
                                                        </div>
                                                        <span className="font-medium text-gray-700">{item.product_name}</span>
                                                    </div>
                                                    <span className="font-bold text-gray-900">${item.price}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                                            <span className="font-bold text-gray-900">Total</span>
                                            <span className="font-bold text-xl text-gray-900">${order.total_amount}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
