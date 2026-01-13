'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function NewProductPage() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        setUploading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('stock', stock);
        if (image) {
            formData.append('image', image);
        }

        try {
            await api.post('/products/', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            router.push('/seller/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to create product');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-12 px-4">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Name</label>
                        <input required type="text" className="mt-1 w-full px-4 py-2 border rounded-lg"
                            value={name} onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea className="mt-1 w-full px-4 py-2 border rounded-lg" rows={3}
                            value={description} onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                            <input required type="number" step="0.01" className="mt-1 w-full px-4 py-2 border rounded-lg"
                                value={price} onChange={e => setPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stock</label>
                            <input required type="number" className="mt-1 w-full px-4 py-2 border rounded-lg"
                                value={stock} onChange={e => setStock(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Image (Optional)</label>
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            className="mt-1 w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-black file:text-white
                            hover:file:bg-gray-800"
                            onChange={e => {
                                if (e.target.files && e.target.files[0]) {
                                    setImage(e.target.files[0]);
                                }
                            }}
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => router.back()} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50"
                        >
                            {uploading ? 'Creating...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
