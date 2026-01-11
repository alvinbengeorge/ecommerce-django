'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { User, Store } from 'lucide-react';

export default function LoginPage() {
    const [role, setRole] = useState<'CUSTOMER' | 'SELLER'>('CUSTOMER');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await api.post('/auth/login/', { username, password });

            // Store tokens
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            localStorage.setItem('user_role', role); // Store intent for potential checks

            // Redirect based on selected role
            if (role === 'SELLER') {
                router.push('/seller/dashboard');
            } else {
                router.push('/marketplace');
            }
        } catch (err) {
            console.error(err);
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="mt-2 text-gray-600">Sign in to your {role.toLowerCase()} account</p>
                </div>

                {/* Role Switcher */}
                <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'CUSTOMER' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-900'}`}
                        onClick={() => setRole('CUSTOMER')}
                    >
                        <User className="w-4 h-4" /> Customer
                    </button>
                    <button
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'SELLER' ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        onClick={() => setRole('SELLER')}
                    >
                        <Store className="w-4 h-4" /> Seller
                    </button>
                </div>

                <form className="mt-6 space-y-6" onSubmit={handleLogin}>
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                        Sign In as {role === 'CUSTOMER' ? 'Customer' : 'Seller'}
                    </button>
                </form>

                <div className="text-center text-sm pt-4 border-t border-gray-100">
                    <p className="text-gray-500 mb-3">Don&apos;t have an account?</p>
                    {role === 'SELLER' ? (
                        <Link href="/seller/register" className="font-bold text-black border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 inline-block w-full">
                            Become a Seller
                        </Link>
                    ) : (
                        <Link href="/customer/register" className="font-bold text-black border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 inline-block w-full">
                            Create Customer Account
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
