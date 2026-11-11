"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Clock, MapPin, Users, ShieldCheck, Ticket, 
  CheckCircle2, AlertCircle, Sparkles, Phone, Store, UserPlus, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MOCK_SHOPS } from '@/lib/mockData';
import { queueApi } from '@/lib/api';

export default function ShopDetailClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const shop = MOCK_SHOPS.find(s => s.slug === slug) || MOCK_SHOPS[0];

  // Group Token State (1 to 4 persons)
  const [groupSize, setGroupSize] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [companionNames, setCompanionNames] = useState(['', '', '']);
  const [booking, setBooking] = useState(false);
  const [bookedToken, setBookedToken] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleBookToken = async (e) => {
    e.preventDefault();
    if (!customerPhone || customerPhone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setBooking(true);
      setErrorMsg('');

      const names = [customerName || 'Customer'];
      for (let i = 1; i < groupSize; i++) {
        names.push(companionNames[i - 1] || `${names[0]} (Guest ${i + 1})`);
      }

      const randomNum = Math.floor(10 + Math.random() * 80);
      const generatedToken = {
        id: String(Date.now()),
        displayToken: `${shop.name.charAt(0).toUpperCase()}-0${randomNum}`,
        groupSize,
        memberNames: names,
        peopleAhead: shop.waitingCount,
        estimatedWaitMin: shop.estimatedWaitMin,
        shopName: shop.name,
      };

      try {
        const res = await queueApi.joinQueue(shop.id, {
          customerName: customerName || 'Customer',
          customerPhone,
          groupSize,
          memberNames: names,
        });
        if (res.data) {
          setBookedToken(res.data);
          return;
        }
      } catch (err) {
        // Fallback for demo
      }

      setBookedToken(generatedToken);
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred while generating token');
    } finally {
      setBooking(false);
    }
  };

  if (bookedToken) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="max-w-xl mx-auto py-8 px-4 text-center space-y-6"
      >
        <div className="w-20 h-20 bg-orange-50 border border-orange-200 text-[#ff7300] rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs font-black text-[#ff7300] uppercase tracking-widest bg-orange-50 px-4 py-1.5 rounded-full border border-orange-200">
            Digital Token Confirmed
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0d2238] mt-3">Your Token Is Ready!</h2>
          <p className="text-sm text-slate-500 mt-1 font-semibold">{shop.name}</p>
        </div>

        {/* Digital Ticket in Brand Navy with Electric Orange Highlight */}
        <div className="relative overflow-hidden ak-hero-gradient text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#ff7300]/40 space-y-6 text-left">
          
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-[#ff7300]">
                {bookedToken.groupSize > 1 ? `Linked Group (${bookedToken.groupSize} Persons)` : 'Single Ticket'}
              </span>
              <p className="text-lg font-bold text-white">{customerName || 'Customer'}</p>
            </div>
            <Ticket className="w-8 h-8 text-[#ff7300]" />
          </div>

          <div className="text-center py-4">
            <span className="text-xs uppercase font-black tracking-widest text-slate-300 block mb-1">
              Your Live Token Number
            </span>
            <div className="text-6xl sm:text-7xl font-black tracking-tight text-white drop-shadow-md">
              {bookedToken.displayToken}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-black/25 rounded-2xl p-4 text-center border border-white/10">
            <div>
              <span className="text-slate-300 text-[10px] uppercase font-bold block">Ahead of You</span>
              <span className="text-xl font-black text-white">{bookedToken.peopleAhead ?? 2}</span>
            </div>
            <div>
              <span className="text-slate-300 text-[10px] uppercase font-bold block">Est. Wait</span>
              <span className="text-xl font-black text-[#ff7300]">{bookedToken.estimatedWaitMin ?? 15} min</span>
            </div>
            <div>
              <span className="text-slate-300 text-[10px] uppercase font-bold block">Status</span>
              <span className="text-xs font-black text-emerald-300">ACTIVE</span>
            </div>
          </div>

          {bookedToken.memberNames && bookedToken.memberNames.length > 1 && (
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-300 block mb-1.5">
                Group Member Names:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {bookedToken.memberNames.map((name, i) => (
                  <span key={i} className="text-xs bg-white/15 border border-white/20 px-3 py-1 rounded-lg text-white font-medium">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/tokens"
            className="flex-1 py-4 px-6 rounded-2xl bg-[#ff7300] hover:bg-[#e06500] text-white font-black text-sm shadow-md shadow-orange-500/20 transition-all text-center cursor-pointer"
          >
            View in My Tokens
          </Link>
          <Link
            href="/"
            className="flex-1 py-4 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 transition-all text-center"
          >
            Explore Other Stores
          </Link>
        </div>
      </motion.div>
    );
  }

  const isOpen = shop.status === 'OPEN';
  const isBusy = shop.status === 'BUSY';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-slate-700 hover:text-slate-900 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs text-slate-500 font-semibold">
          Category: <span className="text-[#0d2238] font-bold">{shop.categoryName}</span>
        </span>
      </div>

      {/* 2-Column Responsive Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="ak-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {shop.name}
                  </h1>
                  {shop.verified && (
                    <ShieldCheck className="w-6 h-6 text-[#ff7300] shrink-0" title="Verified Merchant" />
                  )}
                </div>
                <p className="text-sm text-slate-500 font-medium mt-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{shop.address}</span>
                </p>
              </div>

              <span
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shrink-0 ${
                  isOpen
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : isBusy
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {isOpen ? '● Open Now' : isBusy ? '● Heavy Crowd' : '● Closed'}
              </span>
            </div>

            {/* Real-time Queue Desk Numbers */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Waiting Queue
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">
                  {shop.waitingCount} People
                </span>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Wait Time
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#ff7300] mt-0.5 block">
                  ~{shop.estimatedWaitMin} min
                </span>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Serving Now
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#0d2238] mt-0.5 block">
                  {shop.currentServing}
                </span>
              </div>
            </div>

            {/* Description & Operating Hours */}
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pt-2">
              <p>{shop.description}</p>
              <div className="flex items-center gap-2 text-slate-700 font-semibold bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <Clock className="w-4 h-4 text-[#ff7300]" />
                <span>Operating Hours: {shop.openingHours}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-xs">
            <h3 className="text-sm font-black text-[#0d2238] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff7300]" />
              <span>Key Advantages of AbhiiKhula Digital Token</span>
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside font-medium">
              <li>Book your spot from home and arrive only when your turn is close.</li>
              <li>Live queue updates and arrival ETA notifications right on your screen.</li>
              <li>Linked group booking allows 1 to 4 persons in a single family ticket.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Sticky Token Booking Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <div className="ak-card rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg border-slate-200">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#ff7300] bg-orange-50 px-3 py-1 rounded-md border border-orange-200">
                Fast Contactless Entry
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">Get Queue Token</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                No need to wait in physical lines — claim your instant slot.
              </p>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleBookToken} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Number of People? (1 - 4)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setGroupSize(size)}
                      className={`py-2.5 rounded-2xl text-xs font-black transition-all border cursor-pointer ${
                        groupSize === size
                          ? 'bg-[#ff7300] text-white border-transparent shadow-md shadow-orange-500/20'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {size} {size === 1 ? 'Person' : 'People'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-[#ff7300] focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-sm font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-14 pr-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-[#ff7300] focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>
              </div>

              {groupSize > 1 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block">
                    Group Companion Names (Optional)
                  </label>
                  {Array.from({ length: groupSize - 1 }).map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Member ${i + 2} name`}
                      value={companionNames[i]}
                      onChange={(e) => {
                        const updated = [...companionNames];
                        updated[i] = e.target.value;
                        setCompanionNames(updated);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-[#ff7300]"
                    />
                  ))}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={booking}
                className="w-full py-4 px-4 rounded-2xl bg-[#ff7300] hover:bg-[#e06500] text-white font-black text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
              >
                {booking ? (
                  <span>Generating Token...</span>
                ) : (
                  <>
                    <Ticket className="w-5 h-5 text-white" />
                    <span>Get Free Token Now</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
