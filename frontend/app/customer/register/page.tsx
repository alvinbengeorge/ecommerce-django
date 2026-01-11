'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function RegisterCustomerPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Register User as CUSTOMER
            await api.post('/auth/register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: 'CUSTOMER'
            });

            // 2. Login to get token
            const tokenRes = await api.post('/auth/login/', {
                username: formData.username,
                password: formData.password
            });

            localStorage.setItem('access_token', tokenRes.data.access);

            // Redirect to Marketplace
            router.push('/marketplace');

        } catch (error) {
            console.error(error);
            alert('Registration failed. Username might be taken.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Join Ecommerce</h2>
                    <p className="mt-2 text-gray-600">Create an account to browse and shop.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input required type="text" className="mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                            value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input required type="email" className="mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input required type="password" className="mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>

                    <button disabled={loading} type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-600">
                    Already have an account? <Link href="/login" className="text-black font-semibold hover:underline">Log In</Link>
                </div>
            </div>
        </div>
    );
}
