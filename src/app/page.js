"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, Search, Clock, Users, ShieldCheck, 
  Sparkles, Store, ArrowUpRight, Zap, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_SHOPS, MOCK_CATEGORIES } from '@/lib/mockData';
import { shopApi } from '@/lib/api';
import AbhiiKhulaLogo from '@/components/AbhiiKhulaLogo';

export default function HomePage() {
  const [shops, setShops] = useState(MOCK_SHOPS);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="space-y-10 sm:space-y-12">
      
      {/* Hero Banner with Logo Brand Identity (Navy & Forest Green) */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl brand-hero text-white p-7 sm:p-12 lg:p-14 shadow-2xl border border-slate-700/60"
      >
        {/* Soft emerald light blur */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#16a34a]/15 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <div className="max-w-2xl space-y-6">
            {/* Pilot Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black text-emerald-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <span>Hyperlocal Live Pilot • Sector 14, Indira Nagar, Lucknow</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none text-white">
              Check Real-Time <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-white">
                Store & Clinic Availability
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
              Find out whether your neighborhood store is currently open, check real-time crowd levels, and claim your queue token with zero physical waiting.
            </p>

            {/* Clean Search Bar */}
            <div className="pt-2 sm:pt-4 max-w-xl">
              <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Search store name, doctor, clinic, pharmacy, salon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 px-4 py-4 text-sm sm:text-base font-semibold focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mr-3 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Animated 3D-Style Store Hero Emblem with Floating Movement */}
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 1, -1, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 4.5,
              ease: "easeInOut"
            }}
            className="hidden lg:flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl shrink-0"
          >
            <AbhiiKhulaLogo size={160} />
            <div className="mt-2 text-center">
              <span className="text-lg font-black tracking-tight text-white block">Abhii<span className="text-[#22c55e]">Khula</span></span>
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Real-time Store Radar</span>
            </div>
          </motion.div>

        </div>
      </motion.section>

      {/* Category Pills */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-[#0c1e38] tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#16a34a]" />
            <span>Categories</span>
          </h2>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tap to filter</span>
        </div>

        <div className="flex gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar py-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all shadow-sm cursor-pointer ${
              selectedCategory === null
                ? 'bg-[#0c1e38] text-white shadow-md font-extrabold border border-[#0c1e38]'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
            }`}
          >
            All Stores
          </motion.button>
          
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id || selectedCategory === c.name;
            return (
              <motion.button
                key={c.id || c.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(isSelected ? null : (c.id || c.name))}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all shadow-sm cursor-pointer ${
                  isSelected
                    ? 'bg-[#16a34a] text-white shadow-md font-extrabold border border-[#16a34a]'
                    : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {c.name}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Live Availability Section Header */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0c1e38] tracking-tight flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16a34a] opacity-80"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#16a34a]"></span>
              </span>
              <span>Nearby Live Stores</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Live crowd radar, serving counter, and digital queue tokens
            </p>
          </div>
          
          <div className="text-xs font-black text-slate-700 bg-white border border-slate-200 self-start sm:self-auto px-4 py-2 rounded-xl shadow-xs">
            {filteredShops.length} stores available
          </div>
        </div>

        {/* Responsive Grid: 1 Col (Mobile) -> 2 Col (Tablet) -> 3 Col (Laptop) -> 4 Col (Desktop/TV) */}
        {filteredShops.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No stores found</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              No store matches your search or selected category filter.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#0c1e38] text-white text-xs font-black hover:bg-[#142f56] transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="brand-card flex flex-col justify-between rounded-3xl p-6 group cursor-pointer"
                  >
                    <div className="space-y-4">
                      
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
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
                            {isOpen ? 'Open Now' : isBusy ? 'Heavy Crowd' : isPaused ? 'Paused' : 'Closed'}
                          </span>
                        </span>
                      </div>

                      {/* Store Name & Location */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-black text-slate-900 text-lg group-hover:text-[#16a34a] transition-colors line-clamp-1">
                            {shop.name}
                          </h3>
                          {shop.verified && (
                            <ShieldCheck className="w-4 h-4 text-[#16a34a] shrink-0" title="Verified Merchant" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1.5 line-clamp-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{shop.address}</span>
                        </p>
                      </div>

                      {/* Live Queue Radar Box */}
                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Live Crowd
                          </span>
                          <span className="font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                            <Users className="w-3.5 h-3.5 text-[#16a34a]" />
                            <span>{shop.waitingCount} in line ({shop.crowdLabel})</span>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Est. Wait
                          </span>
                          <span className="font-black text-slate-800 flex items-center justify-end gap-1 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>~{shop.estimatedWaitMin} min</span>
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Action CTA with energetic Green Button */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/shop/${shop.slug}`}
                        className="text-xs font-black text-[#0c1e38] group-hover:text-[#16a34a] flex items-center gap-1 transition-colors"
                      >
                        <span>Token & Live Counter</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href={`/shop/${shop.slug}`}
                        className="w-9 h-9 rounded-2xl bg-slate-100 group-hover:bg-[#16a34a] group-hover:text-white border border-slate-200 flex items-center justify-center text-slate-600 transition-all shadow-xs"
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
