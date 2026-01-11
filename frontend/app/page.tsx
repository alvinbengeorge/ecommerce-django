'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import api from '../lib/api';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get('/products/');
        setProducts(res.data);
      } catch (error) {
        console.error("Failed to fetch products", error);
        // Fallback for demo if API fails or is empty
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50/50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-black rounded-[2.5rem] p-8 md:p-16 text-white overflow-hidden relative shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              The Future of <br />
              <span className="text-gray-100">Commerce is Here.</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
              Explore a curated marketplace of premium goods from independent vendors globally.
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-black px-8 py-3.5 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2">
                Start Exploring <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-3.5 rounded-full font-bold text-sm border border-gray-600 hover:bg-gray-900 transition-colors text-white">
                Become a Seller
              </button>
            </div>
          </div>

          {/* Abstract Background Decoration */}
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-900/40 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Drops</h2>
            <p className="text-gray-500 mt-1">New arrivals from verified vendors</p>
          </div>
          <button className="text-sm font-medium text-gray-900 border-b border-gray-200 hover:border-black transition-colors pb-1">
            View All
          </button>
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
                <div className="bg-gray-50 rounded-2xl p-12 border border-gray-100 inline-block">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Products Yet</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">
                    Our vendors are currently restocking. Check back soon for new premium drops.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Footer minimal */}
      <footer className="border-t border-gray-200 mt-20 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
          &copy; 2024 Ecommerce Inc. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
