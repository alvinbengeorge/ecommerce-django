'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../lib/api';
import { Loader2, Store } from 'lucide-react';
import Link from 'next/link';

export default function ShopsPage() {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchShops() {
            try {
                const res = await api.get('/tenants/');
                setShops(res.data);
            } catch (error) {
                console.error("Failed to fetch shops", error);
                setShops([]);
            } finally {
                setLoading(false);
            }
        }
        fetchShops();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Our Shops</h1>
                    <p className="text-gray-500 mt-2">Discover independent stores and their unique collections.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shops.length > 0 ? (
                            shops.map((shop: any) => (
                                <Link href={`/shops/${shop.id}`} key={shop.id} className="group block bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                                            <Store className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{shop.name}</h3>
                                            <p className="text-sm text-gray-500">View Store</p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <div className="bg-white rounded-2xl p-12 border border-gray-100 inline-block shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Shops Yet</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto">
                                        Be the first to open a store on our platform.
                                    </p>
                                    <Link href="/seller/register" className="inline-block mt-4 bg-black text-white px-6 py-2 rounded-lg font-medium text-sm">
                                        Open a Shop
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
