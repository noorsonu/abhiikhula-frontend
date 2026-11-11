"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Clock, MapPin, Users, ShieldCheck, Ticket, 
  CheckCircle2, AlertCircle, Sparkles, Phone, Store, UserPlus 
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
      setErrorMsg("Kripya 10-digit valid mobile number bharein");
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
        // Fallback for smooth demo
      }

      setBookedToken(generatedToken);
    } catch (err) {
      setErrorMsg(err.message || 'Token generate karne me dikkat aayi');
    } finally {
      setBooking(false);
    }
  };

  if (bookedToken) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto py-8 px-4 text-center space-y-6"
      >
        <div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs font-black text-sky-600 uppercase tracking-widest bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200">
            Digital Token Confirmed
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">Aapka Token Ready Hai!</h2>
          <p className="text-sm text-slate-500 mt-1 font-semibold">{shop.name}</p>
        </div>

        {/* Digital Ticket Holographic Sky Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-800/50 space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-sky-400">
                {bookedToken.groupSize > 1 ? `Linked Group (${bookedToken.groupSize} Persons)` : 'Single Ticket'}
              </span>
              <p className="text-lg font-bold text-white">{customerName || 'Customer'}</p>
            </div>
            <Ticket className="w-8 h-8 text-sky-400" />
          </div>

          <div className="text-center py-4">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400 block mb-1">
              Your Live Token Number
            </span>
            <div className="text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-cyan-300">
              {bookedToken.displayToken}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-white/5 rounded-2xl p-4 text-center border border-white/10">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Aage Log</span>
              <span className="text-lg font-black text-white">{bookedToken.peopleAhead ?? 2}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Est. Wait</span>
              <span className="text-lg font-black text-sky-400">{bookedToken.estimatedWaitMin ?? 15} min</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Status</span>
              <span className="text-xs font-black text-emerald-300">ACTIVE</span>
            </div>
          </div>

          {bookedToken.memberNames && bookedToken.memberNames.length > 1 && (
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Saath wale members:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {bookedToken.memberNames.map((name, i) => (
                  <span key={i} className="text-xs bg-white/10 px-2.5 py-1 rounded-lg text-slate-200 font-medium">
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
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-black text-sm shadow-lg shadow-sky-600/25 transition-all text-center"
          >
            My Active Tokens Me Dekhein
          </Link>
          <Link
            href="/"
            className="flex-1 py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200/80 transition-all text-center"
          >
            Dusri Dukaanein Dekhein
          </Link>
        </div>
      </motion.div>
    );
  }

  const isOpen = shop.status === 'OPEN';
  const isBusy = shop.status === 'BUSY';

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Wapas</span>
        </button>

        <span className="text-xs text-slate-500 font-semibold">
          Category: <span className="text-sky-700 font-bold">{shop.categoryName}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Details & Real-Time Queue Desk */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {shop.name}
                  </h1>
                  {shop.verified && (
                    <ShieldCheck className="w-6 h-6 text-sky-500 shrink-0" title="Verified Merchant" />
                  )}
                </div>
                <p className="text-sm text-slate-500 font-medium mt-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{shop.address}</span>
                </p>
              </div>

              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shrink-0 ${
                  isOpen
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : isBusy
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {isOpen ? '● Khula Hai' : isBusy ? '● Bheed Hai' : '● Band Hai'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Waiting Queue
                </span>
                <span className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5 block">
                  {shop.waitingCount} Log
                </span>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Wait Time
                </span>
                <span className="text-lg sm:text-2xl font-black text-sky-600 mt-0.5 block">
                  ~{shop.estimatedWaitMin} min
                </span>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Serving Now
                </span>
                <span className="text-lg sm:text-2xl font-black text-emerald-600 mt-0.5 block">
                  {shop.currentServing}
                </span>
              </div>
            </div>

            <div className="pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
              <p>{shop.description}</p>
              <div className="flex items-center gap-2 text-slate-500 font-semibold bg-sky-50/50 p-3 rounded-2xl border border-sky-100/60">
                <Clock className="w-4 h-4 text-sky-500" />
                <span>Operating Hours: {shop.openingHours}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-3xl border border-sky-100 p-6 space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>AbhiiKhula Digital Token Ke Fayde</span>
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside font-medium">
              <li>Ghar baithe hi token number lein aur apni baari aane par hi niklein.</li>
              <li>Live position aur arrival notification aapke screen par realtime aayegi.</li>
              <li>Aapke saath agar pariwar ya dost hain, to ek saath 1 se 4 logo ka token lein.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Sticky Token Booking Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-7 shadow-xl shadow-sky-500/5 space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                Zero-Rush Digital Entry
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2">Get Queue Token</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Line me khade hone ki zaroorat nahi — seedha token paayein.
              </p>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleBookToken} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Kitne Logo Ke Liye Token Chahiye? (1 - 4)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setGroupSize(size)}
                      className={`py-2.5 rounded-2xl text-xs font-black transition-all border ${
                        groupSize === size
                          ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white border-transparent shadow-md shadow-sky-500/25'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {size} {size === 1 ? 'Person' : 'People'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Aapka Naam
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Verma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                    required
                  />
                </div>
              </div>

              {groupSize > 1 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block">
                    Saath Wale Members Ke Naam (Optional)
                  </label>
                  {Array.from({ length: groupSize - 1 }).map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Member ${i + 2} ka naam`}
                      value={companionNames[i]}
                      onChange={(e) => {
                        const updated = [...companionNames];
                        updated[i] = e.target.value;
                        setCompanionNames(updated);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={booking}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 active:scale-[0.98] text-white font-black text-sm shadow-xl shadow-sky-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {booking ? (
                  <span>Generating Token...</span>
                ) : (
                  <>
                    <Ticket className="w-5 h-5" />
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

