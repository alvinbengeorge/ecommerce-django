'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Loader2, ShoppingCart, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const productId = resolvedParams.id;
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [added, setAdded] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${productId}/`);
                setProduct(res.data);
            } catch (error) {
                console.error("Failed to load product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const isOwner = user?.role === 'OWNER';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Product not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />
            <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
                <Link href="/marketplace" className="inline-flex items-center text-gray-500 hover:text-black mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden lg:flex">
                    {/* Image Section */}
                    <div className="lg:w-1/2 bg-gray-100 min-h-[500px] relative group overflow-hidden">
                        {product.image ? (
                            <div className="relative w-full h-full min-h-[500px]">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-50" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-6xl font-bold text-gray-200 uppercase tracking-widest select-none">
                                        {product.name.slice(0, 2)}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="lg:w-1/2 p-12 flex flex-col justify-center">
                        <div className="mb-8">
                            {product.tenant_name && (
                                <Link href={`/shops/${product.tenant}`} className="inline-block bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 hover:bg-gray-800 transition-colors">
                                    Sold by {product.tenant_name}
                                </Link>
                            )}
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                            <p className="text-gray-500 text-lg leading-relaxed">{product.description || "No description provided."}</p>
                        </div>

                        <div className="flex items-end gap-6 mb-8 border-t border-gray-100 pt-8">
                            <span className="text-5xl font-bold text-gray-900">${product.price}</span>
                            <span className={`text-sm font-bold px-3 py-1 rounded-full mb-3 ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                            </span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {!isOwner ? (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0}
                                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${added
                                        ? 'bg-green-500 text-white'
                                        : 'bg-black text-white hover:bg-gray-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                                        }`}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {added ? 'Added to Cart!' : 'Add to Cart'}
                                </button>
                            ) : (
                                <div className="w-full py-4 rounded-xl bg-gray-100 text-gray-500 font-bold text-center border border-gray-200">
                                    Store Owners cannot purchase items
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-600">
                                    <Truck className="w-4 h-4" /> Fast Delivery
                                </div>
                                <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-600">
                                    <ShieldCheck className="w-4 h-4" /> Secure Payment
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
