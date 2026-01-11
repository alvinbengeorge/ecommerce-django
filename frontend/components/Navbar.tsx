'use client';

import Link from 'next/link';
import { ShoppingCart, User, Menu, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { totalItems } = useCart();
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check auth status whenever route changes
        const token = localStorage.getItem('access_token');
        setIsLoggedIn(!!token);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setIsLoggedIn(false);
        router.push('/login');
    };

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">E</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">Ecommerce</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/marketplace" className="text-gray-600 hover:text-black transition-colors text-sm font-medium">Marketplace</Link>
                        <Link href="/shops" className="text-gray-600 hover:text-black transition-colors text-sm font-medium">Shops</Link>
                        <Link href="/orders" className="text-gray-600 hover:text-black transition-colors text-sm font-medium">Orders</Link>
                    </div>

                    {/* Icons */}
                    <div className="hidden md:flex items-center space-x-6">
                        <button className="text-gray-500 hover:text-black transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                        <Link href="/cart" className="text-gray-500 hover:text-black transition-colors relative">
                            <ShoppingCart className="w-5 h-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {isLoggedIn && (
                            <Link href="/seller/dashboard" className="text-gray-500 hover:text-black transition-colors">
                                <User className="w-5 h-5" />
                            </Link>
                        )}

                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500">
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            <Link href="/marketplace" className="block py-2 text-base font-medium text-gray-700">Marketplace</Link>
                            <Link href="/shops" className="block py-2 text-base font-medium text-gray-700">Shops</Link>
                            <Link href="/orders" className="block py-2 text-base font-medium text-gray-700">Orders</Link>
                            <hr className="my-2 border-gray-100" />
                            {isLoggedIn ? (
                                <button onClick={handleLogout} className="block w-full text-left py-2 text-base font-medium text-red-600">
                                    Logout
                                </button>
                            ) : (
                                <Link href="/login" className="block py-2 text-base font-medium text-blue-600">Login</Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
