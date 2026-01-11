'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function RegisterSellerPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        storeName: '',
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Register User
            await api.post('/auth/register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: 'OWNER'
            });

            // 2. Login to get token
            const tokenRes = await api.post('/auth/login/', {
                username: formData.username,
                password: formData.password
            });

            const token = tokenRes.data.access;
            localStorage.setItem('access_token', token);

            // 3. Create Tenant (Store) using the token
            // We manually set the header here for this specific request since the global interceptor might not read it yet
            await api.post('/tenants/', {
                name: formData.storeName,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            router.push('/seller/dashboard');

        } catch (error) {
            console.error(error);
            alert('Registration failed. Username or Subdomain might be taken.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 text-center">Open Your Store</h2>
                    <p className="mt-2 text-gray-600 text-center">Join thousands of independent creators.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input required type="text" className="mt-1 w-full px-4 py-2 border rounded-lg"
                                value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input required type="email" className="mt-1 w-full px-4 py-2 border rounded-lg"
                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input required type="password" className="mt-1 w-full px-4 py-2 border rounded-lg"
                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Store Name</label>
                                <input required type="text" placeholder="e.g. Acme Corp" className="mt-1 w-full px-4 py-2 border rounded-lg"
                                    value={formData.storeName} onChange={e => setFormData({ ...formData, storeName: e.target.value })} />
                            </div>

                        </div>
                    </div>

                    <button disabled={loading} type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
                        {loading ? 'Creating Store...' : 'Launch Store'}
                    </button>
                </form>
            </div>
        </div>
    );
}
