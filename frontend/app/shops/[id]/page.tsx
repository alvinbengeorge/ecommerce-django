'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { Loader2, Store } from 'lucide-react';

export default function ShopDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const shopId = resolvedParams.id;
    const [shop, setShop] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Shop Details
                const shopRes = await api.get(`/tenants/${shopId}/`);
                setShop(shopRes.data);

                // Fetch Shop Products
                const prodRes = await api.get(`/products/?tenant=${shopId}`);
                setProducts(prodRes.data);
            } catch (error) {
                console.error("Failed to fetch shop data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [shopId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Shop not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            {/* Shop Header */}
            <div className="bg-black text-white pt-24 pb-12 px-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <Store className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">{shop.name}</h1>
                        <p className="text-gray-300">Browse all products from this store.</p>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Arrivals</h2>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 text-lg">This shop has no products yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
