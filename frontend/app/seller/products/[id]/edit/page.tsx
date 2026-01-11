'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using use() hook as per Next.js 15+ guidelines or await it if it's a promise
    // straightforward way for client components handling params as promise:
    const resolvedParams = use(params);
    const productId = resolvedParams.id;

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: ''
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await api.get(`/products/${productId}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const p = res.data;
                setFormData({
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    stock: p.stock
                });
            } catch (error) {
                console.error("Failed to load product", error);
                alert("Failed to load product details.");
                router.push('/seller/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('access_token');
            await api.put(`/products/${productId}/`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            router.push('/seller/dashboard');
        } catch (error) {
            console.error("Failed to update product", error);
            alert("Failed to update product.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Navbar />
            <div className="max-w-2xl mx-auto pt-24 px-4">
                <Link href="/seller/dashboard" className="inline-flex items-center text-gray-500 hover:text-black mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none resize-none"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex items-center gap-4">
                            <Link href="/seller/dashboard" className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-black text-white py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
