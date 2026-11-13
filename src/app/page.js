"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MapPin, Search, Clock, Users, ShieldCheck, Sparkles, Store, 
  ArrowUpRight, ArrowRight, Ticket, CheckCircle2, UserCheck, 
  ChevronRight, Smartphone, TrendingUp, BarChart3, BellRing, Hourglass, Power, Play, Compass, Heart, Coffee, XCircle,
  Star, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_SHOPS, MOCK_CATEGORIES } from '@/lib/mockData';
import { shopApi } from '@/lib/api';
import { getFavoriteShopSlugs, toggleFavoriteShopSlug } from '@/lib/favorites';
import FreshUrbanLogo from '@/components/FreshUrbanLogo';
import OfficialBrandLogo from '@/components/OfficialBrandLogo';
import ShopQuickViewModal from '@/components/ShopQuickViewModal';
import CategoryShopDirectoryModal from '@/components/CategoryShopDirectoryModal';

function resolveShopImage(shop) {
  const name = (shop?.name || '').toLowerCase();
  const cat = (shop?.categoryName || '').toLowerCase();
  const slug = (shop?.slug || '').toLowerCase();

  if (cat.includes('barber') || cat.includes('salon') || name.includes('barber') || slug.includes('barber') || slug.includes('salon')) {
    return '/images/barber.jpg';
  }
  if (cat.includes('pharmacy') || cat.includes('medical') || name.includes('medical') || name.includes('pharmacy') || slug.includes('medical') || slug.includes('pharmacy')) {
    return '/images/pharmacy.jpg';
  }
  if (cat.includes('doctor') || cat.includes('clinic') || cat.includes('dental') || name.includes('dental') || name.includes('doctor') || slug.includes('dental') || slug.includes('clinic')) {
    return '/images/clinic.jpg';
  }
  if (cat.includes('food') || cat.includes('chaat') || cat.includes('restaurant') || name.includes('food') || name.includes('chaat') || slug.includes('food')) {
    return '/images/food.jpg';
  }
  if (cat.includes('diagnostic') || cat.includes('lab') || cat.includes('pathology') || name.includes('pathology') || name.includes('lab') || slug.includes('lab') || slug.includes('pathology')) {
    return '/images/diagnostic.jpg';
  }
  if (cat.includes('auto') || cat.includes('bike') || cat.includes('service') || name.includes('speedwheel') || slug.includes('auto') || slug.includes('speedwheel')) {
    return '/images/auto.jpg';
  }
  return '/images/clinic.jpg';
}

export default function HomePage() {
  const router = useRouter();
  const [isMerchantUser, setIsMerchantUser] = useState(false);

  // If Shopkeeper is logged in, immediately redirect to Merchant Dashboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('ak_role');
      const shop = localStorage.getItem('ak_active_merchant_shop');
      if (role === 'MERCHANT' && shop) {
        setIsMerchantUser(true);
        router.replace('/merchant/dashboard');
      }
    }
  }, [router]);

  const loadRegisteredLocalShops = () => {
    if (typeof window === 'undefined') return [];
    try {
      const activeStr = localStorage.getItem('ak_active_merchant_shop');
      const allStr = localStorage.getItem('ak_merchant_shops');
      const all = allStr ? JSON.parse(allStr) : [];
      if (activeStr) {
        const active = JSON.parse(activeStr);
        if (active && !all.some(s => s.slug === active.slug || s.id === active.id)) {
          all.unshift(active);
        }
      }
      return all.map(s => ({ ...s, imageUrl: resolveShopImage(s) }));
    } catch (e) {
      return [];
    }
  };

  const [shops, setShops] = useState(() => loadRegisteredLocalShops());
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteSlugs, setFavoriteSlugs] = useState([]);

  // Shop Details & Category Directory Modals
  const [selectedShopForModal, setSelectedShopForModal] = useState(null);
  const [directoryModalOpen, setDirectoryModalOpen] = useState(false);
  const [directoryCategory, setDirectoryCategory] = useState('all');

  // Live progress simulation for Section 4
  const [progressWidth, setProgressWidth] = useState(65);
  const [activeUserToken, setActiveUserToken] = useState(null);

  // Sync Favorite Shops from localStorage
  useEffect(() => {
    setFavoriteSlugs(getFavoriteShopSlugs());
    const onFavUpdate = () => setFavoriteSlugs(getFavoriteShopSlugs());
    window.addEventListener('ak_favorites_updated', onFavUpdate);
    return () => window.removeEventListener('ak_favorites_updated', onFavUpdate);
  }, []);

  const handleToggleFavorite = (slug) => {
    toggleFavoriteShopSlug(slug);
    setFavoriteSlugs(getFavoriteShopSlugs());
  };

  useEffect(() => {
    const syncActiveToken = () => {
      if (typeof window !== 'undefined') {
        const currentPhone = (localStorage.getItem('ak_phone') || '').replace(/\D/g, '').slice(-10);
        const savedStr = localStorage.getItem('ak_customer_tokens');
        if (savedStr) {
          try {
            const list = JSON.parse(savedStr);
            if (Array.isArray(list)) {
              const filtered = list.filter(t => {
                if (currentPhone) {
                  return (t.customerPhone || '').replace(/\D/g, '').slice(-10) === currentPhone;
                }
                return !t.customerPhone || t.isGuest;
              });
              setActiveUserToken(filtered.length > 0 ? filtered[0] : null);
              return;
            }
          } catch (e) {}
        }
        setActiveUserToken(null);
      }
    };

    syncActiveToken();
    window.addEventListener('storage', syncActiveToken);
    return () => window.removeEventListener('storage', syncActiveToken);
  }, []);

  useEffect(() => {
    async function fetchLiveShops() {
      const localShops = loadRegisteredLocalShops();
      try {
        const res = await shopApi.getShops({ lat: 26.8861, lng: 80.9951 });
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const liveList = res.data.data.map(sh => ({
            ...sh,
            imageUrl: resolveShopImage(sh)
          }));
          const liveSlugs = new Set(liveList.map(s => s.slug));
          const uniqueLocal = localShops.filter(s => !liveSlugs.has(s.slug));
          setShops([...liveList, ...uniqueLocal]);
          return;
        }
      } catch (e) {}
      setShops(localShops);
    }
    fetchLiveShops();
  }, []);

  const filteredShops = shops.filter(shop => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      shop.name.toLowerCase().includes(q) ||
      (shop.categoryName && shop.categoryName.toLowerCase().includes(q)) ||
      (shop.address && shop.address.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (!selectedCategory || selectedCategory === 'all') return true;

    // Filter by Favorite / Saved Shops
    if (selectedCategory === 'favorites') {
      return favoriteSlugs.includes(shop.slug);
    }

    const catKey = selectedCategory.toLowerCase();
    const shopCat = (shop.categoryName || '').toLowerCase();
    const shopName = (shop.name || '').toLowerCase();

    if (catKey === 'salon' || catKey.includes('salon') || catKey.includes('barber')) {
      return shopCat.includes('salon') || shopCat.includes('barber') || shopName.includes('barber');
    }
    if (catKey === 'pharmacy' || catKey.includes('pharmacy') || catKey.includes('medical')) {
      return shopCat.includes('pharmacy') || shopCat.includes('medical') || shopName.includes('medical');
    }
    if (catKey === 'clinic' || catKey.includes('clinic') || catKey.includes('doctor')) {
      return shopCat.includes('clinic') || shopCat.includes('doctor') || shopCat.includes('dental') || shopName.includes('dental');
    }
    if (catKey === 'food' || catKey.includes('food') || catKey.includes('chaat') || catKey.includes('restaurant')) {
      return shopCat.includes('food') || shopCat.includes('chaat') || shopCat.includes('restaurant') || shopName.includes('food');
    }
    if (catKey === 'diagnostic' || catKey.includes('diagnostic') || catKey.includes('lab')) {
      return shopCat.includes('diagnostic') || shopCat.includes('lab') || shopCat.includes('pathology') || shopName.includes('lab');
    }
    if (catKey === 'auto' || catKey.includes('auto') || catKey.includes('bike')) {
      return shopCat.includes('auto') || shopCat.includes('bike') || shopCat.includes('service') || shopName.includes('auto');
    }
    return shopCat.includes(catKey) || shopName.includes(catKey);
  });

  // If Shopkeeper is logged in, DO NOT render Customer Explore / Category views
  if (isMerchantUser) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-[#176B65] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-[#283B3D]/70">Opening your Merchant Operations Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 sm:space-y-14">
      
      {/* ========================================================= */}
      {/* SECTION 1: HERO SECTION                                   */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12 sm:pb-16 relative overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Side: Punchy Heading & CTAs */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Soft Peach Tag */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DCE9E3] border border-[#176B65]/20 text-xs font-bold text-[#176B65] shadow-xs"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#F2A15A] animate-ping"></span>
              <span>Hyperlocal Live Availability • Pilot in Lucknow</span>
            </motion.div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#283B3D] leading-[1.1]">
              Your Time Matters. <br />
              <span className="text-[#176B65]">Skip The Queue.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#283B3D]/80 font-normal max-w-xl leading-relaxed">
              Book your token online, track your turn live and visit when it's your time. No crowded waiting rooms. No wasted hours.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <motion.a
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                href="#shops"
                className="px-8 py-4 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-base shadow-lg shadow-[#176B65]/25 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get a Token</span>
                <ArrowRight className="w-5 h-5 text-[#F2A15A]" />
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="#how-it-works"
                className="px-7 py-4 rounded-2xl bg-white hover:bg-[#DCE9E3]/40 text-[#283B3D] font-bold text-base border border-[#283B3D]/15 transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Explore How It Works</span>
              </motion.a>
            </div>

            {/* Quick Metrics Pill */}
            <div className="pt-4 flex flex-wrap items-center gap-8 text-xs font-semibold text-[#283B3D]/70 border-t border-[#283B3D]/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#176B65]"></span>
                <span>Zero Physical Waiting</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F2A15A]"></span>
                <span>Live Wait-Time Radar</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#283B3D]"></span>
                <span>Group Booking (1 - 4)</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Animated Product Mockup & Floating Token Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            {/* Soft Glow behind Phone */}
            <div className="absolute w-80 h-80 bg-[#F2A15A]/25 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

            {/* Phone Mockup Frame */}
            <div className="relative w-80 sm:w-84 bg-white rounded-[44px] p-4 shadow-2xl border-4 border-[#283B3D] space-y-4">
              
              {/* Speaker Notch */}
              <div className="w-24 h-4 bg-[#283B3D] rounded-full mx-auto"></div>

              {/* Inside Screen */}
              <div className="bg-[#F3F1E9] rounded-[30px] p-5 space-y-4 border border-[#DCE9E3]">
                
                {/* Store Header inside Phone */}
                <div className="flex items-center justify-between">
                  <OfficialBrandLogo height={28} animate={false} />
                  <span className="text-[10px] font-black uppercase bg-[#DCE9E3] text-[#176B65] px-2.5 py-1 rounded-full">
                    Live Station
                  </span>
                </div>

                {/* Live Token Card inside Phone */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#283B3D]/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#176B65]">City Style Salon</span>
                    <span className="text-[10px] font-extrabold uppercase bg-[#F2A15A]/25 text-[#283B3D] px-2 py-0.5 rounded">
                      In Progress
                    </span>
                  </div>

                  <div className="text-center py-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Your Token Number</span>
                    <div className="text-4xl font-token font-bold text-[#176B65]">AK - 024</div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-[#283B3D]/70">
                      <span>Queue Progress</span>
                      <span className="font-bold text-[#176B65]">3 Ahead</span>
                    </div>
                    <div className="w-full bg-[#DCE9E3] h-2 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: ['40%', '65%', '40%'] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="bg-[#176B65] h-full rounded-full"
                      />
                    </div>
                  </div>

                  {/* Estimated Wait Counter */}
                  <div className="bg-[#F3F1E9] rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <span className="text-[#283B3D]/70 font-medium">Estimated wait:</span>
                    <span className="font-bold text-[#F2A15A] bg-[#283B3D] px-2.5 py-0.5 rounded-lg text-white font-token">
                      08 min
                    </span>
                  </div>
                </div>

                {/* Next Customer Indicator inside Phone */}
                <div className="bg-[#DCE9E3] rounded-2xl p-3 flex items-center justify-between text-xs font-bold text-[#176B65]">
                  <span>Counter Serving:</span>
                  <span className="font-token text-sm bg-white px-3 py-1 rounded-lg text-[#283B3D] shadow-xs">
                    AK - 021
                  </span>
                </div>

              </div>

            </div>

            {/* Secondary Floating Pill */}
            <motion.div 
              animate={{ y: [0, 8, 0], rotate: [1, -2, 1] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1 }}
              className="absolute -top-4 -right-4 sm:-right-8 bg-white rounded-2xl px-4 py-2.5 shadow-xl border border-[#DCE9E3] flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-[#F2A15A]">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Saved Time</span>
                <span className="text-xs font-black text-[#283B3D]">35 Min Today</span>
              </div>
            </motion.div>

          </motion.div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* SECTION 2: HOW ABHIIKHULA WORKS                           */}
      {/* ========================================================= */}
      <section id="how-it-works" className="bg-[#DCE9E3]/45 py-10 sm:py-14 border-y border-[#DCE9E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#176B65] bg-[#DCE9E3] px-3.5 py-1 rounded-full">
              Simple 3-Step Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#283B3D]">
              How AbhiiKhula Works
            </h2>
            <p className="text-sm sm:text-base text-[#283B3D]/70 font-medium">
              Say goodbye to unorganized physical lines. Experience the effortless way to get attended.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Find Your Shop",
                desc: "Explore nearby doctor clinics, pharmacies, salons and bakeries. See real-time open status and current queue crowd.",
                icon: Search,
                badge: "Explore Locally",
                img: "/images/salon.jpg"
              },
              {
                step: "02",
                title: "Get Your Token",
                desc: "Book a digital virtual token from anywhere. Add up to 4 family members or friends on a single linked booking.",
                icon: Ticket,
                badge: "Instant Pass",
                img: "/images/person-phone.jpg"
              },
              {
                step: "03",
                title: "Track Your Turn",
                desc: "Watch the live progress on your phone. Relax at home and head over only when 1 or 2 customers are ahead of you.",
                icon: Clock,
                badge: "Zero Waiting",
                img: "/images/merchant-store.jpg"
              }
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="urban-card rounded-3xl overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img 
                      src={st.img} 
                      alt={st.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#176B65]">
                      Step {st.step}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-black text-[#283B3D]">{st.title}</h3>
                    </div>

                    <p className="text-xs sm:text-sm text-[#283B3D]/70 leading-relaxed font-normal">
                      {st.desc}
                    </p>

                    <span className="inline-block text-[11px] font-bold text-[#176B65] uppercase tracking-wider bg-[#F3F1E9] px-3 py-1 rounded-lg">
                      {st.badge}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: EXPLORE NEARBY SHOPS (WITH PHOTOS)             */}
      {/* ========================================================= */}
      <section id="shops" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DCE9E3] pb-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#176B65]">Category Directory</span>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl sm:text-4xl font-black text-[#283B3D]">Explore by Category</h2>
              <button
                type="button"
                onClick={() => {
                  setDirectoryCategory('all');
                  setDirectoryModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#176B65] bg-[#DCE9E3] hover:bg-[#cde0d7] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <Store className="w-3.5 h-3.5" />
                <span>+ Browse Directory (List View)</span>
              </button>
            </div>
            <p className="text-sm text-[#283B3D]/70 font-medium">Click on any category card below to see its shops list, customer reviews & photos, and take digital queue tokens.</p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search category (Medical, Salon, Clinic)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#DCE9E3] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#176B65] shadow-xs"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
          {/* 1. All Categories (First Button) */}
          <button
            type="button"
            onClick={() => {
              setDirectoryCategory('all');
              setDirectoryModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 bg-white text-[#283B3D] border border-[#DCE9E3] hover:border-[#176B65] hover:bg-[#DCE9E3]/40"
          >
            <Store className="w-3.5 h-3.5 text-[#176B65]" />
            <span>All Categories</span>
          </button>

          {/* 2. Favorites Filter Tab (Shows only the user's saved places) */}
          <button
            type="button"
            onClick={() => {
              setDirectoryCategory('favorites');
              setDirectoryModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 bg-white text-[#283B3D] border border-rose-300 hover:bg-rose-50 hover:border-rose-400 shadow-2xs"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Saved Places</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-rose-100 text-rose-700">
              {favoriteSlugs.length}
            </span>
          </button>

          {/* 3. The 6 Category Buttons */}
          {categories.slice(0, 6).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setDirectoryCategory(c.id);
                setDirectoryModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer bg-white text-[#283B3D] border border-[#DCE9E3] hover:border-[#176B65] hover:bg-[#DCE9E3]/40"
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Category Cards Grid (Strictly 6 Authentic Category Cards - No "All Places" card!) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories
            .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 6)
            .map((cat) => {
              const matchingShops = shops.filter(shop => {
                const catKey = cat.id.toLowerCase();
                const shopCat = (shop.categoryName || '').toLowerCase();
                if (catKey.includes('salon') || catKey.includes('barber')) return shopCat.includes('salon') || shopCat.includes('barber');
                if (catKey.includes('pharmacy') || catKey.includes('medical')) return shopCat.includes('pharmacy') || shopCat.includes('medical');
                if (catKey.includes('clinic') || catKey.includes('doctor')) return shopCat.includes('clinic') || shopCat.includes('doctor') || shopCat.includes('dental');
                if (catKey.includes('food') || catKey.includes('chaat')) return shopCat.includes('food') || shopCat.includes('chaat');
                if (catKey.includes('diagnostic') || catKey.includes('lab')) return shopCat.includes('diagnostic') || shopCat.includes('lab');
                if (catKey.includes('auto') || catKey.includes('repair') || catKey.includes('bike')) return shopCat.includes('auto') || shopCat.includes('repair') || shopCat.includes('bike') || shopCat.includes('service');
                return false;
              });

              // Strict guaranteed photo per category
              const catPhoto = cat.id === 'salon' ? '/images/barber.jpg' :
                               cat.id === 'pharmacy' ? '/images/pharmacy.jpg' :
                               cat.id === 'clinic' ? '/images/clinic.jpg' :
                               cat.id === 'food' ? '/images/food.jpg' :
                               cat.id === 'diagnostic' ? '/images/diagnostic.jpg' :
                               cat.id === 'auto' ? '/images/auto.jpg' :
                               cat.imageUrl || '/images/clinic.jpg';

              return (
                <motion.div
                  key={cat.id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    setDirectoryCategory(cat.id);
                    setDirectoryModalOpen(true);
                  }}
                  className="urban-card rounded-3xl overflow-hidden flex flex-col justify-between cursor-pointer group border border-[#DCE9E3] hover:border-[#176B65] transition-all shadow-sm hover:shadow-md"
                >
                  <div>
                    {/* Category Photo Header */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                      <img 
                        src={catPhoto} 
                        alt={cat.name} 
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>

                      {/* Top Badges */}
                      <span className="absolute top-3 left-3 bg-[#176B65] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                        {cat.name}
                      </span>

                      <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-[#283B3D] text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs">
                        {matchingShops.length || cat.count || 2} Places Connected
                      </span>

                      {/* Bottom Category Name on Photo */}
                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <h3 className="text-2xl font-black drop-shadow-md">{cat.name}</h3>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-[#283B3D] group-hover:text-[#176B65] transition-colors">
                          {cat.name}
                        </h3>
                        <span className="text-[11px] font-bold text-[#176B65] bg-[#DCE9E3] px-2.5 py-1 rounded-lg">
                          {matchingShops.length || cat.count || 2} Shops
                        </span>
                      </div>

                      <p className="text-xs text-[#283B3D]/70 font-medium leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>

                      <div className="p-3 bg-[#F3F1E9] rounded-2xl border border-[#DCE9E3] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-[#283B3D]/80">
                          <Clock className="w-3.5 h-3.5 text-[#176B65]" />
                          <span className="font-semibold text-[11px]">Avg. Wait:</span>
                          <span className="font-bold text-[#176B65] text-[11px]">{cat.avgWait || '~10-15 min'}</span>
                        </div>
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Zero Physical Line
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      className="w-full py-3.5 rounded-2xl bg-[#176B65] group-hover:bg-[#125550] text-white font-bold text-xs shadow-sm transition-all text-center flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>View {cat.name} Shops & Tokens</span>
                      <ArrowRight className="w-4 h-4 text-[#F2A15A] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* More Options / All Directory Banner */}
        <div className="bg-white border border-[#DCE9E3] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCE9E3] text-[#176B65] text-xs font-bold">
              <Store className="w-3.5 h-3.5" />
              <span>More Options & Full City Directory</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#283B3D]">
              Looking for other shops or want to see all in a list?
            </h3>
            <p className="text-xs sm:text-sm text-[#283B3D]/70 font-medium max-w-2xl">
              Explore the complete directory of verified salons, medical stores, diagnostic labs, doctor clinics, chaat points, and auto repairs in Lucknow with live queue status, reviews, and instant tokens.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDirectoryCategory('all');
              setDirectoryModalOpen(true);
            }}
            className="px-6 py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shrink-0 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <Store className="w-4 h-4 text-[#F2A15A]" />
            <span>Open Full Directory (List View)</span>
            <ArrowRight className="w-4 h-4 text-[#F2A15A]" />
          </button>
        </div>

      </section>

      {/* ========================================================= */}
      {/* SECTION 4: LIVE TOKEN TRACKING (HIGHLIGHT OF WEBSITE)     */}
      {/* ========================================================= */}
      <section id="live-token" className="bg-[#283B3D] text-[#F3F1E9] py-16 sm:py-24 rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-6 sm:px-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#176B65]/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-10 relative z-10 text-center">
          
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#DCE9E3] bg-white/10 px-4 py-1.5 rounded-full border border-white/15">
              {activeUserToken ? 'Your Real Active Token' : 'Live Interactive Queue Demo'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              {activeUserToken ? 'Your Live Token In Progress' : 'Your Live Token (In Progress)'}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-medium">
              {activeUserToken 
                ? 'Your booked token is syncing live with the shop counter desk.'
                : 'Real-time synchronization between the counter desk and your smartphone.'}
            </p>
          </div>

          {/* Featured Live Token Card with Smooth Progress Bar Animation */}
          <div className="bg-white text-[#283B3D] rounded-3xl p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto space-y-8 text-left border-4 border-[#176B65]">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE9E3] pb-4">
              <div>
                <span className="text-xs uppercase font-extrabold text-[#176B65] tracking-wider">Your token number</span>
                <div className="font-token text-4xl sm:text-5xl font-bold text-[#283B3D] tracking-tight mt-1">
                  {activeUserToken?.displayToken || 'AK - 024'}
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Service Store</span>
                <span className="text-lg font-black text-[#176B65]">
                  {activeUserToken?.shopName || 'City Style Salon'}
                </span>
              </div>
            </div>

            {/* Metrics: Minutes & People Ahead */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F3F1E9] rounded-2xl p-4 text-center border border-[#DCE9E3]">
                <span className="font-token text-4xl sm:text-5xl font-bold text-[#176B65] block">
                  {activeUserToken ? String(activeUserToken.estimatedWaitMin || 10).padStart(2, '0') : '08'}
                </span>
                <span className="text-xs font-bold text-[#283B3D]/70 uppercase tracking-wider mt-1 block">
                  Estimated minutes
                </span>
              </div>

              <div className="bg-[#F3F1E9] rounded-2xl p-4 text-center border border-[#DCE9E3]">
                <span className="font-token text-4xl sm:text-5xl font-bold text-[#176B65] block">
                  {activeUserToken ? String(activeUserToken.peopleAhead ?? 2).padStart(2, '0') : '03'}
                </span>
                <span className="text-xs font-bold text-[#283B3D]/70 uppercase tracking-wider mt-1 block">
                  People ahead
                </span>
              </div>
            </div>

            {/* Live Progress Bar with Spring Motion */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#283B3D]">Queue progress</span>
                <span className="text-[#176B65]">{progressWidth}% (Moving smoothly)</span>
              </div>
              <div className="w-full bg-[#DCE9E3] h-3.5 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: '40%' }}
                  animate={{ width: `${progressWidth}%` }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="bg-[#176B65] h-full rounded-full"
                ></motion.div>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {activeUserToken 
                  ? 'Real-time sync active. You will receive an alert when your turn is called.' 
                  : 'Live progress – illustrative example showing real-time slot progression.'}
              </p>
            </div>

            {/* Interactive Progress Demo Controls or Direct Link */}
            {activeUserToken ? (
              <div className="pt-2">
                <Link
                  href="/tokens"
                  className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all text-center"
                >
                  <Ticket className="w-4 h-4 text-[#DCE9E3]" />
                  <span>Open Full Live Ticket Pass in My Tokens</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="pt-2 flex items-center justify-between text-xs text-[#283B3D]/70 border-t border-slate-100">
                <span className="font-medium">Test queue movement:</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setProgressWidth(Math.min(100, progressWidth + 15))}
                    className="px-3.5 py-1.5 bg-[#DCE9E3] hover:bg-[#176B65] hover:text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Next Customer</span>
                  </button>
                  <button 
                    onClick={() => setProgressWidth(40)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: PLATFORM BENEFITS                              */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#176B65]">Core Value</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#283B3D]">
            Why Choose AbhiiKhula?
          </h2>
          <p className="text-sm text-[#283B3D]/70 font-medium">
            Designed for busy city residents and quality-focused neighborhood businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "No Physical Queue", desc: "No standing under the sun or sitting in congested rooms.", icon: UserCheck },
            { title: "Save Precious Time", desc: "Reclaim up to 45 minutes of wasted idle time on every visit.", icon: Clock },
            { title: "Live Turn Updates", desc: "Accurate real-time progress right on your personal smartphone.", icon: BellRing },
            { title: "Easy Token Booking", desc: "One-click digital ticket generation for individuals or groups.", icon: Ticket }
          ].map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className="urban-card rounded-3xl p-6 space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-base text-[#283B3D]">{b.title}</h4>
                  <p className="text-xs text-[#283B3D]/70 font-medium leading-relaxed">{b.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7: FINAL CTA (SOFT SAGE BACKGROUND)              */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-[#DCE9E3] rounded-3xl p-8 sm:p-14 text-center space-y-6 border border-[#176B65]/20 shadow-md">
          <motion.div 
            whileHover={{ scale: 1.05, y: -4 }}
            className="inline-flex p-3 rounded-3xl bg-white text-[#176B65] items-center justify-center mx-auto shadow-sm cursor-pointer"
          >
            <OfficialBrandLogo height={52} animate={false} />
          </motion.div>

          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-[#283B3D] leading-tight">
              Why Wait in Line When You Can Book Online?
            </h2>
            <p className="text-sm sm:text-base text-[#283B3D]/80 font-medium">
              Join the Lucknow pilot today. Check your nearby store availability and experience hassle-free queuing.
            </p>
          </div>

          <div className="pt-2">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#shops"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-base shadow-lg shadow-[#176B65]/20 transition-all cursor-pointer"
            >
              <span>Get Started with AbhiiKhula</span>
              <ArrowRight className="w-5 h-5 text-[#F2A15A]" />
            </motion.a>
          </div>
        </div>
      </section>

      {/* Shop Reviews & Full Photo Quick View Modal */}
      <ShopQuickViewModal
        shop={selectedShopForModal}
        isOpen={Boolean(selectedShopForModal)}
        onClose={() => setSelectedShopForModal(null)}
        onBack={() => {
          setSelectedShopForModal(null);
          setDirectoryModalOpen(true);
        }}
      />

      {/* Category-Wise Shop Directory Modal (List View with Reviews & Get Token) */}
      <CategoryShopDirectoryModal
        isOpen={directoryModalOpen && !selectedShopForModal}
        onClose={() => setDirectoryModalOpen(false)}
        shops={shops}
        categories={categories}
        initialCategory={directoryCategory}
        onSelectShopForDetails={(shop) => {
          setDirectoryModalOpen(false);
          setSelectedShopForModal(shop);
        }}
      />

    </div>
  );
}
