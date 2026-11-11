"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, Search, Clock, Users, ShieldCheck, 
  Sparkles, Store, ArrowUpRight, Zap, Flame, Compass, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_SHOPS, MOCK_CATEGORIES } from '@/lib/mockData';
import { shopApi } from '@/lib/api';

export default function HomePage() {
  const [shops, setShops] = useState(MOCK_SHOPS);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLiveShops() {
      try {
        const res = await shopApi.getShops({ lat: 26.8861, lng: 80.9951 });
        if (res.data && res.data.length > 0) {
          setShops(res.data);
        }
      } catch (e) {
        // Fallback to MOCK_SHOPS seamlessly
      }
    }
    fetchLiveShops();
  }, []);

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (shop.categoryName && shop.categoryName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (shop.address && shop.address.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory ? (shop.categoryId === selectedCategory || shop.categoryName === selectedCategory) : true;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 sm:space-y-10">
      
      {/* Hero Section: Modern Sky Blue & Indigo Glow Card */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-sky-900/40"
      >
        {/* Sky Blue Ambient Blur Lights */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/25 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          
          {/* Pilot Badge */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-xs font-bold text-sky-200 shadow-sm"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-400"></span>
            </span>
            <span>Hyperlocal Pilot Live: Indira Nagar, Lucknow</span>
          </motion.div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none">
            Ghar Baithe Pata Karo <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300">
              Kaun Si Dukan Khuli Hai
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
            Real-time status, dukan par live bheed kitni hai, aur digital virtual token — bina physical line me apna keemti samay gavaye.
          </p>

          {/* Search Box - Fully Responsive on iPhone to TV */}
          <div className="pt-2 sm:pt-4">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-3.5 sm:top-4 w-5 h-5 text-sky-400" />
              <input
                type="text"
                placeholder="Search dukan: Dr. Verma clinic, pharmacy, salon, chaat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/95 text-slate-900 placeholder:text-slate-400 rounded-2xl pl-12 pr-4 py-3.5 sm:py-4 text-sm sm:text-base font-semibold shadow-xl border border-white/40 focus:outline-none focus:ring-4 focus:ring-sky-400/40 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 sm:top-3.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-2.5 py-1.5 rounded-xl"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Category Filter Pills (Framer motion smooth hover) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>Categories</span>
          </h2>
          <span className="text-xs text-slate-400 font-semibold">Tap to filter</span>
        </div>

        <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all shadow-sm active:scale-95 ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-sky-500/25 shadow-md'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            All Shops
          </button>
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id || selectedCategory === c.name;
            return (
              <button
                key={c.id || c.name}
                onClick={() => setSelectedCategory(isSelected ? null : (c.id || c.name))}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all shadow-sm active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-sky-500/25 shadow-md'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Live Availability Section Header */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span>Nearby Live Availability</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Real-time crowd level, serving counter & instant token entry
            </p>
          </div>
          <div className="text-xs font-black text-sky-700 bg-sky-50 border border-sky-200/60 self-start sm:self-auto px-3.5 py-1.5 rounded-xl">
            {filteredShops.length} dukaanein uplabdh
          </div>
        </div>

        {/* Responsive Grid: 1 Col (Mobile) -> 2 Col (Tablet) -> 3 Col (Laptop) -> 4 Col (Desktop/TV) */}
        {filteredShops.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-sky-100 p-8 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-sky-50 flex items-center justify-center mx-auto text-sky-500 mb-3">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Koi dukaan nahi mili</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              Aapke search filter se match karne wali koi live dukan uplabdh nahi hai.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            <AnimatePresence>
              {filteredShops.map((shop, idx) => {
                const isOpen = shop.status === 'OPEN';
                const isBusy = shop.status === 'BUSY';
                const isPaused = shop.status === 'PAUSED';

                return (
                  <motion.div
                    key={shop.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="flex flex-col justify-between bg-white rounded-3xl border border-slate-200/80 hover:border-sky-300 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 transition-all"
                  >
                    <div className="space-y-3">
                      
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                          {shop.categoryName || 'General'}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide ${
                            isOpen
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isBusy
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : isPaused
                              ? 'bg-orange-50 text-orange-800 border border-orange-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${
                            isOpen ? 'bg-emerald-500' : isBusy ? 'bg-amber-500' : isPaused ? 'bg-orange-500' : 'bg-rose-500'
                          }`}></span>
                          <span>
                            {isOpen ? 'Khula Hai' : isBusy ? 'Bheed Hai' : isPaused ? 'Paused' : 'Band Hai'}
                          </span>
                        </span>
                      </div>

                      {/* Shop Name & Location */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-sky-600 transition-colors line-clamp-1">
                            {shop.name}
                          </h3>
                          {shop.verified && (
                            <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" title="Verified Merchant" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{shop.address}</span>
                        </p>
                      </div>

                      {/* Crowd & Wait Metrics */}
                      <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Live Crowd
                          </span>
                          <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                            <Users className="w-3.5 h-3.5 text-sky-600" />
                            <span>{shop.waitingCount} log ({shop.crowdLabel})</span>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Est. Wait
                          </span>
                          <span className="font-bold text-slate-800 flex items-center justify-end gap-1 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>~{shop.estimatedWaitMin} min</span>
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Action CTA */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/shop/${shop.slug}`}
                        className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                      >
                        <span>Token & Live Desk</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href={`/shop/${shop.slug}`}
                        className="w-8 h-8 rounded-full bg-sky-50 hover:bg-sky-600 hover:text-white flex items-center justify-center text-sky-600 transition-colors shadow-sm"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

    </div>
  );
}
