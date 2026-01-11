'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Plus } from 'lucide-react';

export default function SellerDashboard() {
    const [products, setProducts] = useState([]);
    const router = useRouter();

    useEffect(() => {
        // Inject token
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch MY products
        api.get('/products/', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setProducts(res.data))
            .catch(err => console.error(err));

    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
                    <button
                        onClick={() => router.push('/seller/products/new')}
                        className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800"
                    >
                        <Plus className="w-5 h-5" /> Add Product
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((p: any) => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${p.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {p.stock > 0 ? 'Active' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => router.push(`/seller/products/${p.id}/edit`)}
                                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        You haven&apos;t added any products yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
