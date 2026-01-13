'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    stock: number;
    tenant: number;
    image?: string | null;
}

export default function ProductCard({ product }: { product: Product }) {
    const { addToCart, decrementItem, items } = useCart();

    // Find current quantity in cart
    const cartItem = items.find(i => i.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart(product);
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.preventDefault();
        decrementItem(product.id);
    };

    return (
        <div className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Image Section */}
            <Link href={`/products/${product.id}`} className="block">
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-50 group-hover:scale-105 transition-transform duration-500">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl font-bold text-gray-200 uppercase">{product.name.slice(0, 2)}</span>
                            </div>
                        </div>
                    )}
                    <div className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm z-10">
                        {product.stock} remaining
                    </div>
                </div>
            </Link>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <Link href={`/products/${product.id}`}>
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                    <span className="font-bold text-gray-900">${product.price}</span>
                </div>

                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                    {product.description || "No description available for this premium product."}
                </p>

                {quantity > 0 ? (
                    <div className="w-full bg-black text-white py-2 rounded-xl font-medium text-sm flex items-center justify-between px-4 transition-all duration-300 shadow-md transform hover:scale-[1.02]">
                        <button
                            onClick={handleDecrement}
                            className="p-1 hover:bg-gray-800 rounded-md transition-colors active:scale-95"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-base min-w-[20px] text-center">{quantity}</span>
                        <button
                            onClick={handleAddToCart}
                            className="p-1 hover:bg-gray-800 rounded-md transition-colors active:scale-95"
                            disabled={product.stock <= quantity}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-black text-white py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group-active:scale-[0.98]">
                        <ShoppingBag className="w-4 h-4" />
                        Add to Cart
                    </button>
                )}
            </div>
        </div>
    );
}
