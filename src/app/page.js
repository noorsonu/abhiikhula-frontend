"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, Search, Clock, Users, ShieldCheck, Sparkles, Store, 
  ArrowUpRight, ArrowRight, Ticket, CheckCircle2, UserCheck, 
  ChevronRight, Smartphone, TrendingUp, BarChart3, BellRing, Hourglass, Power, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_SHOPS, MOCK_CATEGORIES } from '@/lib/mockData';
import { shopApi } from '@/lib/api';
import FreshUrbanLogo from '@/components/FreshUrbanLogo';
import OfficialBrandLogo from '@/components/OfficialBrandLogo';

export default function HomePage() {
  const [shops, setShops] = useState(MOCK_SHOPS);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Live progress simulation for Section 4
  const [progressWidth, setProgressWidth] = useState(65);

  useEffect(() => {
    async function fetchLiveShops() {
      try {
        const res = await shopApi.getShops({ lat: 26.8861, lng: 80.9951 });
        if (res.data && res.data.length > 0) {
          // Merge images with API data
          const merged = res.data.map((sh, idx) => ({
            ...sh,
            imageUrl: MOCK_SHOPS[idx % MOCK_SHOPS.length]?.imageUrl || '/images/clinic.jpg'
          }));
          setShops(merged);
        }
      } catch (e) {
        // Fallback to MOCK_SHOPS
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
    <div className="space-y-20 sm:space-y-28">
      
      {/* ========================================================= */}
      {/* SECTION 1: HERO SECTION                                   */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
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

            {/* Small Floating Live Shop Card with Real Photo */}
            <motion.div 
              animate={{ y: [0, -10, 0], rotate: [-1, 2, -1] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 sm:-left-10 bg-white rounded-2xl p-3 shadow-xl border border-[#DCE9E3] flex items-center gap-3"
            >
              <img 
                src="/images/clinic.jpg" 
                alt="Dr. Verma Dental" 
                className="w-12 h-12 rounded-xl object-cover" 
              />
              <div className="text-left pr-2">
                <span className="text-xs font-bold text-[#283B3D] block">Dr. Verma Dental</span>
                <span className="text-[10px] font-bold text-[#176B65]">● Open (2 ahead)</span>
              </div>
            </motion.div>

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
      <section id="how-it-works" className="bg-[#DCE9E3]/45 py-16 sm:py-24 border-y border-[#DCE9E3]">
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
            <span className="text-xs font-bold uppercase tracking-widest text-[#176B65]">Neighborhood Directory</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#283B3D]">Explore Nearby Shops</h2>
            <p className="text-sm text-[#283B3D]/70 font-medium">Verified local pilot shops currently connected to live queue desks.</p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by name, salon, clinic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#DCE9E3] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#176B65] shadow-xs"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === null
                ? 'bg-[#176B65] text-white shadow-sm'
                : 'bg-white text-[#283B3D] border border-[#DCE9E3] hover:border-[#176B65]'
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
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#176B65] text-white shadow-sm'
                    : 'bg-white text-[#283B3D] border border-[#DCE9E3] hover:border-[#176B65]'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Shop Cards Grid with Real Shop Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => {
            const isOpen = shop.status === 'OPEN';
            const isBusy = shop.status === 'BUSY';
            const isPaused = shop.status === 'PAUSED';

            return (
              <motion.div
                key={shop.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="urban-card rounded-3xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Shop Photo Header */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img 
                      src={shop.imageUrl || '/images/clinic.jpg'} 
                      alt={shop.name} 
                      className="w-full h-full object-cover" 
                    />
                    
                    {/* Status Pill on Photo */}
                    <span className={`absolute top-3 right-3 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm backdrop-blur-md ${
                      isOpen 
                        ? 'bg-emerald-600/90 text-white' 
                        : isBusy 
                        ? 'bg-amber-600/90 text-white' 
                        : 'bg-rose-600/90 text-white'
                    }`}>
                      {isOpen ? '● Open' : isBusy ? '● Heavy Crowd' : isPaused ? '● Paused' : '● Closed'}
                    </span>

                    <span className="absolute bottom-3 left-3 bg-[#283B3D]/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      {shop.categoryName}
                    </span>
                  </div>

                  {/* Content Body */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-black text-lg text-[#283B3D] line-clamp-1">{shop.name}</h3>
                      <p className="text-xs text-[#283B3D]/60 mt-1 line-clamp-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{shop.address}</span>
                      </p>
                    </div>

                    {/* People Waiting & Wait Time */}
                    <div className="bg-[#F3F1E9] rounded-2xl p-3 grid grid-cols-2 gap-2 text-center border border-[#DCE9E3]">
                      <div className="border-r border-[#DCE9E3]">
                        <span className="text-[10px] uppercase font-bold text-[#283B3D]/50 block">People Waiting</span>
                        <span className="font-token font-bold text-base text-[#283B3D] mt-0.5 block">{shop.waitingCount} in line</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#283B3D]/50 block">Wait Time</span>
                        <span className="font-token font-bold text-base text-[#176B65] mt-0.5 block">~{shop.estimatedWaitMin} min</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/shop/${shop.slug}`}
                    className="w-full py-3 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-sm transition-all text-center flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Ticket className="w-4 h-4 text-[#F2A15A]" />
                    <span>Get Token</span>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

      </section>

      {/* ========================================================= */}
      {/* SECTION 4: LIVE TOKEN TRACKING (HIGHLIGHT OF WEBSITE)     */}
      {/* ========================================================= */}
      <section id="live-token" className="bg-[#283B3D] text-[#F3F1E9] py-16 sm:py-24 rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-6 sm:px-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#176B65]/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-10 relative z-10 text-center">
          
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F2A15A] bg-white/10 px-4 py-1.5 rounded-full border border-white/15">
              Live Interactive Tracking Simulation
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Your Live Token (In Progress)
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-medium">
              Real-time synchronization between the merchant desk and your screen.
            </p>
          </div>

          {/* Featured Live Token Card with Smooth Progress Bar Animation */}
          <div className="bg-white text-[#283B3D] rounded-3xl p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto space-y-8 text-left border-4 border-[#176B65]">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE9E3] pb-4">
              <div>
                <span className="text-xs uppercase font-extrabold text-[#176B65] tracking-wider">Your token number</span>
                <div className="font-token text-4xl sm:text-5xl font-bold text-[#283B3D] tracking-tight mt-1">
                  AK - 024
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Service Store</span>
                <span className="text-lg font-black text-[#176B65]">City Style Salon</span>
              </div>
            </div>

            {/* Metrics: Minutes & People Ahead */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F3F1E9] rounded-2xl p-4 text-center border border-[#DCE9E3]">
                <span className="font-token text-4xl sm:text-5xl font-bold text-[#176B65] block">08</span>
                <span className="text-xs font-bold text-[#283B3D]/70 uppercase tracking-wider mt-1 block">
                  Estimated minutes
                </span>
              </div>

              <div className="bg-[#F3F1E9] rounded-2xl p-4 text-center border border-[#DCE9E3]">
                <span className="font-token text-4xl sm:text-5xl font-bold text-[#F2A15A] block">03</span>
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
                Live progress – illustrative example showing real-time slot progression.
              </p>
            </div>

            {/* Interactive Progress Demo Controls */}
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

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: FOR SHOP OWNERS (WITH MERCHANT PHOTO)          */}
      {/* ========================================================= */}
      <section id="for-owners" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#176B65] bg-[#DCE9E3] px-3.5 py-1 rounded-full">
              Merchant Solutions
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#283B3D] leading-tight">
              Manage Your Queue. <br />
              <span className="text-[#176B65]">Grow Your Business.</span>
            </h2>
            <p className="text-base text-[#283B3D]/80 font-normal leading-relaxed">
              Empower your store staff with clean counter tools. Prevent lobby overcrowding, serve happier customers, and make waiting an invisible experience.
            </p>

            <div className="space-y-4 pt-2">
              {[
                { title: "Digital Queue Management", desc: "One-click next customer calling with zero hassle." },
                { title: "Live Customer Tracking", desc: "Know exactly who is coming, no-shows, and group sizes." },
                { title: "Offline Walk-in Token Generation", desc: "Issue physical tickets on the spot for customers without smartphones." },
                { title: "Shop Analytics & Crowd Controls", desc: "Toggle Open, Busy, Paused, or Closed instantly." },
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#176B65] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#283B3D]">{feat.title}</h4>
                    <p className="text-xs text-[#283B3D]/70">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                href="/merchant"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <Store className="w-4 h-4 text-[#F2A15A]" />
                <span>Open Merchant Desk Live</span>
              </Link>
            </div>
          </div>

          {/* Owner Dashboard Showcase with Photo */}
          <div className="lg:col-span-6 bg-white rounded-3xl overflow-hidden shadow-xl border border-[#DCE9E3] space-y-6">
            <div className="h-48 w-full relative overflow-hidden bg-slate-100">
              <img 
                src="/images/merchant-store.jpg" 
                alt="Merchant Counter" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <span className="text-xs uppercase tracking-wider font-bold text-[#F2A15A]">Live Counter Control</span>
                <h4 className="font-black text-lg">Active Station • Dr. Verma Clinic</h4>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-6">
              {/* Serving Desk Display */}
              <div className="bg-[#283B3D] text-white rounded-2xl p-6 text-center space-y-2">
                <span className="text-xs uppercase font-bold text-slate-300">Counter Serving Now</span>
                <div className="font-token text-5xl font-black text-[#F2A15A]">D - 004</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 rounded-xl bg-[#176B65] text-white font-bold text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Call Next Token</span>
                </button>
                <button className="py-3 rounded-xl bg-[#DCE9E3] text-[#283B3D] font-bold text-xs flex items-center justify-center gap-2">
                  <Power className="w-4 h-4 text-rose-600" />
                  <span>Pause Queue</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6: PLATFORM BENEFITS                              */}
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

    </div>
  );
}
