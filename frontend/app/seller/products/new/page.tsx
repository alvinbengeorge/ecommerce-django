'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function NewProductPage() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: ''
    });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');

        try {
            await api.post('/products/', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            router.push('/seller/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to create product');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-12 px-4">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Name</label>
                        <input required type="text" className="mt-1 w-full px-4 py-2 border rounded-lg"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea className="mt-1 w-full px-4 py-2 border rounded-lg" rows={3}
                            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                            <input required type="number" step="0.01" className="mt-1 w-full px-4 py-2 border rounded-lg"
                                value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stock</label>
                            <input required type="number" className="mt-1 w-full px-4 py-2 border rounded-lg"
                                value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => router.back()} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800">
                            Create Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
