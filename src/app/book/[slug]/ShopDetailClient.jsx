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

  // Group Token State (1 to 4 persons - BRD Linked Group support)
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
        className="max-w-xl mx-auto py-12 px-4 text-center space-y-6"
      >
        <div className="w-20 h-20 bg-[#DCE9E3] border border-[#176B65]/30 text-[#176B65] rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs font-bold text-[#176B65] uppercase tracking-widest bg-[#DCE9E3] px-4 py-1.5 rounded-full border border-[#176B65]/20">
            Digital Token Confirmed
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#283B3D] mt-3">Your Token Is Ready!</h2>
          <p className="text-sm text-slate-500 mt-1 font-semibold">{shop.name}</p>
        </div>

        {/* Digital Ticket in Fresh Urban Theme (Deep Teal Card) */}
        <div className="relative overflow-hidden bg-[#176B65] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#F2A15A]/40 space-y-6 text-left">
          
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#F2A15A]">
                {bookedToken.groupSize > 1 ? `Linked Group (${bookedToken.groupSize} Persons)` : 'Single Ticket'}
              </span>
              <p className="text-lg font-bold text-white">{customerName || 'Customer'}</p>
            </div>
            <Ticket className="w-8 h-8 text-[#F2A15A]" />
          </div>

          <div className="text-center py-4">
            <span className="text-xs uppercase font-bold text-[#DCE9E3] block mb-1">
              Your Live Token Number
            </span>
            <div className="font-token text-6xl sm:text-7xl font-bold tracking-tight text-white drop-shadow-md">
              {bookedToken.displayToken}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-black/15 rounded-2xl p-4 text-center border border-white/10">
            <div>
              <span className="text-[#DCE9E3] text-[10px] uppercase font-bold block">Ahead of You</span>
              <span className="font-token text-xl font-bold text-white">{bookedToken.peopleAhead ?? 2}</span>
            </div>
            <div>
              <span className="text-[#DCE9E3] text-[10px] uppercase font-bold block">Est. Wait</span>
              <span className="font-token text-xl font-bold text-[#F2A15A]">{bookedToken.estimatedWaitMin ?? 15} min</span>
            </div>
            <div>
              <span className="text-[#DCE9E3] text-[10px] uppercase font-bold block">Status</span>
              <span className="text-xs font-bold text-emerald-300">ACTIVE</span>
            </div>
          </div>

          {bookedToken.memberNames && bookedToken.memberNames.length > 1 && (
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-[#DCE9E3] block mb-1.5">
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
            className="flex-1 py-4 px-6 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-sm shadow-md transition-all text-center cursor-pointer"
          >
            View in My Tokens
          </Link>
          <Link
            href="/"
            className="flex-1 py-4 px-6 rounded-2xl bg-white hover:bg-slate-50 text-[#283B3D] font-bold text-sm border border-[#DCE9E3] transition-all text-center"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12 pt-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#283B3D] hover:text-[#176B65] bg-white px-4 py-2.5 rounded-xl border border-[#DCE9E3] shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </button>

        <span className="text-xs text-[#283B3D]/70 font-semibold">
          Category: <span className="text-[#176B65] font-bold">{shop.categoryName}</span>
        </span>
      </div>

      {/* 2-Column Responsive Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="urban-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#283B3D] tracking-tight">
                    {shop.name}
                  </h1>
                  {shop.verified && (
                    <ShieldCheck className="w-6 h-6 text-[#176B65] shrink-0" title="Verified Merchant" />
                  )}
                </div>
                <p className="text-sm text-[#283B3D]/70 font-medium mt-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{shop.address}</span>
                </p>
              </div>

              <span
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shrink-0 ${
                  isOpen
                    ? 'bg-emerald-100 text-emerald-800'
                    : isBusy
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isOpen ? '● Open Now' : isBusy ? '● Heavy Crowd' : '● Closed'}
              </span>
            </div>

            {/* Real-time Queue Desk Numbers */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="bg-[#F3F1E9] rounded-2xl p-4 border border-[#DCE9E3]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#283B3D]/60 block">
                  Waiting Queue
                </span>
                <span className="font-token text-xl sm:text-2xl font-bold text-[#283B3D] mt-0.5 block">
                  {shop.waitingCount} People
                </span>
              </div>
              <div className="bg-[#F3F1E9] rounded-2xl p-4 border border-[#DCE9E3]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#283B3D]/60 block">
                  Wait Time
                </span>
                <span className="font-token text-xl sm:text-2xl font-bold text-[#176B65] mt-0.5 block">
                  ~{shop.estimatedWaitMin} min
                </span>
              </div>
              <div className="bg-[#F3F1E9] rounded-2xl p-4 border border-[#DCE9E3]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#283B3D]/60 block">
                  Serving Now
                </span>
                <span className="font-token text-xl sm:text-2xl font-bold text-[#F2A15A] mt-0.5 block">
                  {shop.currentServing}
                </span>
              </div>
            </div>

            {/* Description & Operating Hours */}
            <div className="text-xs sm:text-sm text-[#283B3D]/80 leading-relaxed space-y-3 pt-2">
              <p>{shop.description}</p>
              <div className="flex items-center gap-2 text-[#283B3D] font-semibold bg-[#DCE9E3]/50 p-3.5 rounded-2xl border border-[#DCE9E3]">
                <Clock className="w-4 h-4 text-[#176B65]" />
                <span>Operating Hours: {shop.openingHours}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#DCE9E3] p-6 space-y-3 shadow-xs">
            <h3 className="text-sm font-black text-[#283B3D] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#176B65]" />
              <span>Key Advantages of AbhiiKhula Digital Token</span>
            </h3>
            <ul className="text-xs text-[#283B3D]/70 space-y-2 list-disc list-inside font-medium">
              <li>Book your spot from home and arrive only when your turn is close.</li>
              <li>Live queue updates and arrival ETA notifications right on your screen.</li>
              <li>Linked group booking allows 1 to 4 persons in a single family ticket.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Sticky Token Booking Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <div className="urban-card rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg border-[#DCE9E3]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#176B65] bg-[#DCE9E3] px-3 py-1 rounded-md">
                Fast Contactless Entry
              </span>
              <h2 className="text-2xl font-black text-[#283B3D] mt-2">Get Queue Token</h2>
              <p className="text-xs text-[#283B3D]/70 mt-0.5 font-medium">
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
                <label className="text-xs font-bold text-[#283B3D] block mb-2">
                  Number of People? (1 - 4)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setGroupSize(size)}
                      className={`py-2.5 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                        groupSize === size
                          ? 'bg-[#176B65] text-white border-transparent shadow-sm'
                          : 'bg-[#F3F1E9] text-[#283B3D] border-[#DCE9E3] hover:border-[#176B65]'
                      }`}
                    >
                      {size} {size === 1 ? 'Person' : 'People'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#283B3D] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#F3F1E9] border border-[#DCE9E3] rounded-xl px-4 py-3 text-sm font-semibold text-[#283B3D] focus:outline-none focus:bg-white focus:border-[#176B65]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#283B3D] block mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-sm font-bold text-[#176B65]">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#F3F1E9] border border-[#DCE9E3] rounded-xl pl-14 pr-4 py-3 text-sm font-semibold text-[#283B3D] focus:outline-none focus:bg-white focus:border-[#176B65]"
                    required
                  />
                </div>
              </div>

              {groupSize > 1 && (
                <div className="space-y-2 pt-2 border-t border-[#DCE9E3]">
                  <label className="text-xs font-bold text-[#283B3D] block">
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
                      className="w-full bg-[#F3F1E9] border border-[#DCE9E3] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#283B3D] focus:outline-none focus:bg-white focus:border-[#176B65]"
                    />
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={booking}
                className="w-full py-4 px-4 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
              >
                {booking ? (
                  <span>Generating Token...</span>
                ) : (
                  <>
                    <Ticket className="w-5 h-5 text-[#F2A15A]" />
                    <span>Get Free Token Now</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
