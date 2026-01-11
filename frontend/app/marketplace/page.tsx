'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import ProductCard from '../../components/ProductCard';
import api from '../../lib/api';
import { Loader2 } from 'lucide-react';

export default function MarketplacePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await api.get('/products/');
                setProducts(res.data);
            } catch (error) {
                console.error("Failed to fetch products", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
                    <p className="text-gray-500 mt-2">Browse all available products from our diverse community of sellers.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.length > 0 ? (
                            products.map((p: any) => (
                                <ProductCard key={p.id} product={p} />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <div className="bg-white rounded-2xl p-12 border border-gray-100 inline-block shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Products Found</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto">
                                        Check back later for new arrivals.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
