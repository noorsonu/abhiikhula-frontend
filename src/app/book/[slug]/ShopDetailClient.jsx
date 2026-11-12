"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Clock, MapPin, Users, ShieldCheck, Ticket, 
  CheckCircle2, AlertCircle, Sparkles, Phone, Store, UserPlus, Zap,
  Lock, ArrowRight, RefreshCw, KeyRound, Wrench, Briefcase, Plus, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_SHOPS } from '@/lib/mockData';
import { authApi, queueApi, shopApi } from '@/lib/api';

const getCategoryServices = (catName = '') => {
  const cat = (catName || '').toLowerCase();
  if (cat.includes('salon') || cat.includes('barber')) {
    return ['Haircut', 'Beard Trim & Styling', 'Hair Spa', 'Facial & Glow', 'Shave & Detan'];
  }
  if (cat.includes('pharmacy') || cat.includes('medical')) {
    return ['Prescription Medicines', 'OTC Medicines', 'Baby Care & Diapers', 'Health Supplements'];
  }
  if (cat.includes('clinic') || cat.includes('doctor') || cat.includes('dental')) {
    return ['Doctor Consultation', 'Dental Checkup / Scaling', 'Routine Follow-up', 'Tooth Pain / Cavity'];
  }
  if (cat.includes('food') || cat.includes('chaat') || cat.includes('restaurant')) {
    return ['Dine-in Table', 'Takeaway Packing', 'Evening Snacks', 'Party Order'];
  }
  if (cat.includes('diagnostic') || cat.includes('lab')) {
    return ['Routine Blood Test', 'Complete Hemogram (CBC)', 'Sugar & Thyroid Panel', 'Report Collection'];
  }
  if (cat.includes('auto') || cat.includes('bike')) {
    return ['Engine Oil Replacement', 'Periodic Service', 'Brake & Chain Tune-up', 'Tire & Puncture Check'];
  }
  return ['General Consultation', 'Quick Service', 'Product Purchase', 'Inquiry'];
};

export default function ShopDetailClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const [shop, setShop] = useState(() => {
    return MOCK_SHOPS.find(s => s.slug === slug) || MOCK_SHOPS[0];
  });

  // Group Token State (1, 2, or Custom Count)
  const [selectedGroupMode, setSelectedGroupMode] = useState('1'); // '1', '2', 'custom'
  const [customCount, setCustomCount] = useState(3);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPurpose, setCustomerPurpose] = useState('');
  const [companionDetails, setCompanionDetails] = useState([]); // [{ name: '', purpose: '' }]

  const [booking, setBooking] = useState(false);
  const [bookedToken, setBookedToken] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // OTP Verification State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');

  // Effective group size calculated from selection
  const effectiveGroupSize = selectedGroupMode === '1' ? 1 : selectedGroupMode === '2' ? 2 : Math.max(3, customCount);

  // Sync companionDetails array whenever group size changes
  useEffect(() => {
    const companionCount = Math.max(0, effectiveGroupSize - 1);
    setCompanionDetails(prev => {
      const next = [];
      for (let i = 0; i < companionCount; i++) {
        next.push(prev[i] || { name: '', purpose: '' });
      }
      return next;
    });
  }, [effectiveGroupSize]);

  // Auto-fill phone if previously logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPhone = localStorage.getItem('ak_phone');
      if (savedPhone) setCustomerPhone(savedPhone);
    }
  }, []);

  // Try fetching shop by slug from backend if available
  useEffect(() => {
    if (slug) {
      shopApi.getShopBySlug(slug)
        .then((res) => {
          if (res?.data?.data) {
            setShop(prev => ({
              ...prev,
              ...res.data.data,
              id: res.data.data.id || prev.id,
            }));
          }
        })
        .catch(() => {
          // Keep mock shop fallback
        });
    }
  }, [slug]);

  const serviceSuggestions = getCategoryServices(shop.categoryName);

  // Initiate Booking
  const handleInitiateBooking = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validate 10-digit Indian Mobile Number
    const cleanPhone = customerPhone.trim();
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number (starting with 6-9)");
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('ak_token') : null;
    const savedPhone = typeof window !== 'undefined' ? localStorage.getItem('ak_phone') : null;

    // If already authenticated with the same phone, proceed directly to join queue
    if (token && savedPhone === cleanPhone) {
      await executeJoinQueue(cleanPhone);
      return;
    }

    // Otherwise, trigger OTP flow
    try {
      setBooking(true);
      const res = await authApi.sendOtp(cleanPhone);
      setOtpSuccessMessage(res.data?.data?.message || `OTP sent to +91 ${cleanPhone}`);
      setShowOtpModal(true);
    } catch (err) {
      setOtpSuccessMessage(`OTP sent to +91 ${cleanPhone} (Dev OTP: 1234)`);
      setShowOtpModal(true);
    } finally {
      setBooking(false);
    }
  };

  // Verify OTP and Complete Queue Token Generation
  const handleVerifyOtpAndJoin = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setOtpError('Please enter the 4-digit OTP (Default: 1234)');
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError('');

      const cleanPhone = customerPhone.trim();
      const res = await authApi.verifyOtp(cleanPhone, otp);

      if (res?.data?.data?.token) {
        localStorage.setItem('ak_token', res.data.data.token);
        localStorage.setItem('ak_phone', cleanPhone);
      }

      setShowOtpModal(false);
      await executeJoinQueue(cleanPhone);
    } catch (err) {
      // In dev/demo mode, accept '1234'
      if (otp === '1234') {
        localStorage.setItem('ak_token', 'dev-demo-token');
        localStorage.setItem('ak_phone', customerPhone.trim());
        setShowOtpModal(false);
        await executeJoinQueue(customerPhone.trim());
      } else {
        setOtpError(err?.response?.data?.message || 'Invalid OTP. Please enter 1234.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // Execute Join Queue Request to Backend
  const executeJoinQueue = async (phone) => {
    try {
      setBooking(true);
      setErrorMsg('');

      // Build member names list with purpose notes
      const mainName = customerName || 'Customer';
      const mainEntry = customerPurpose ? `${mainName} (${customerPurpose})` : mainName;

      const memberEntries = [mainEntry];
      for (let i = 0; i < companionDetails.length; i++) {
        const comp = companionDetails[i];
        const cName = comp.name.trim() || `Companion #${i + 2}`;
        const cPurp = comp.purpose.trim();
        memberEntries.push(cPurp ? `${cName} (${cPurp})` : cName);
      }

      // Backend shop UUID (fallback to default real store if mock string id)
      const validShopId = (shop.id && shop.id.includes('-')) 
        ? shop.id 
        : 'd1b2c3d4-0000-0000-0000-000000000001';

      const payload = {
        customerName: mainName,
        customerPhone: phone,
        groupSize: Math.min(effectiveGroupSize, 4), // Cap at 4 for legacy backend DTO limit
        memberNames: memberEntries,
        source: 'APP',
      };

      let finalToken = null;

      try {
        const res = await queueApi.joinQueue(validShopId, payload);
        if (res?.data?.data) {
          finalToken = {
            ...res.data.data,
            shopName: shop.name,
            address: shop.address,
            imageUrl: shop.imageUrl,
            groupSize: effectiveGroupSize,
            customerPurpose,
            companions: companionDetails,
          };
        }
      } catch (backendErr) {
        console.warn('Backend queue join fallback:', backendErr);
      }

      // Local Fallback Token if offline or backend error
      if (!finalToken) {
        const randomNum = Math.floor(10 + Math.random() * 80);
        finalToken = {
          id: String(Date.now()),
          displayToken: `${shop.name.charAt(0).toUpperCase()}-0${randomNum}`,
          tokenNumber: randomNum,
          groupSize: effectiveGroupSize,
          memberNames: memberEntries,
          customerPurpose,
          companions: companionDetails,
          peopleAhead: shop.waitingCount ?? 2,
          estimatedWaitMin: shop.estimatedWaitMin ?? 15,
          shopName: shop.name,
          address: shop.address,
          status: 'WAITING',
          joinedAt: new Date().toISOString(),
          customerName: mainName,
          customerPhone: phone,
          imageUrl: shop.imageUrl,
        };
      }

      // Save to customer's active token list in localStorage
      if (typeof window !== 'undefined') {
        const existingStr = localStorage.getItem('ak_customer_tokens');
        const existing = existingStr ? JSON.parse(existingStr) : [];
        const updated = [finalToken, ...existing.filter(t => t.id !== finalToken.id)];
        localStorage.setItem('ak_customer_tokens', JSON.stringify(updated));
      }

      setBookedToken(finalToken);
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred while generating token');
    } finally {
      setBooking(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
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
          <p className="text-sm text-slate-500 mt-1 font-semibold">{bookedToken.shopName || shop.name}</p>
        </div>

        {/* Digital Ticket in Fresh Urban Theme */}
        <div className="relative overflow-hidden bg-[#176B65] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#DCE9E3]/40 space-y-6 text-left">
          
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#DCE9E3]">
                {bookedToken.groupSize > 1 ? `Group Booking (${bookedToken.groupSize} Persons)` : 'Single Ticket'}
              </span>
              <p className="text-lg font-bold text-white">{customerName || 'Customer'}</p>
              {customerPurpose && (
                <span className="inline-block text-xs text-[#DCE9E3] font-medium mt-0.5">
                  Service: {customerPurpose}
                </span>
              )}
            </div>
            <Ticket className="w-8 h-8 text-[#DCE9E3]" />
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
              <span className="font-token text-xl font-bold text-white">{bookedToken.estimatedWaitMin ?? 15} min</span>
            </div>
            <div>
              <span className="text-[#DCE9E3] text-[10px] uppercase font-bold block">Status</span>
              <span className="text-xs font-bold text-emerald-300">ACTIVE</span>
            </div>
          </div>

          {/* Group Members & Purpose Breakdown */}
          {bookedToken.companions && bookedToken.companions.length > 0 && (
            <div className="pt-2 border-t border-white/15 space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#DCE9E3] block">
                Group Member Services:
              </span>
              <div className="space-y-1.5">
                <div className="text-xs bg-white/10 px-3 py-2 rounded-xl text-white flex items-center justify-between border border-white/10">
                  <span className="font-bold">#1 {customerName || 'Customer'} (Primary)</span>
                  <span className="text-[#DCE9E3] font-medium text-[11px]">{customerPurpose || 'General Service'}</span>
                </div>
                {bookedToken.companions.map((comp, idx) => (
                  <div key={idx} className="text-xs bg-white/10 px-3 py-2 rounded-xl text-white flex items-center justify-between border border-white/10">
                    <span className="font-semibold">#{idx + 2} {comp.name || `Companion #${idx + 2}`}</span>
                    <span className="text-[#DCE9E3] font-medium text-[11px]">{comp.purpose || 'General Service'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-white/15 text-xs text-[#DCE9E3] flex items-center justify-between">
            <span>Pass Code: #{bookedToken.id ? String(bookedToken.id).slice(0, 8) : 'AK-PASS'}</span>
            <span className="flex items-center gap-1 font-semibold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-300" /> Verified Pass
            </span>
          </div>
        </div>

        {/* Action Button: Go to Live Tracker */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/tokens"
            className="flex-1 py-4 px-6 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Track Live Turn in My Tokens</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="py-4 px-6 rounded-2xl bg-white border border-[#DCE9E3] text-[#283B3D] font-bold text-sm hover:bg-[#DCE9E3]/40 transition-all text-center"
          >
            Browse Other Places
          </Link>
        </div>
      </motion.div>
    );
  }

  // BOOKING FORM VIEW
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <div>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-[#176B65] hover:text-[#125550] transition-colors bg-[#DCE9E3]/70 px-4 py-2 rounded-2xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Places</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Place Details */}
        <div className="md:col-span-5 space-y-6">
          <div className="urban-card rounded-3xl overflow-hidden border border-[#DCE9E3]">
            <div className="h-44 w-full relative overflow-hidden bg-slate-100">
              <img 
                src={shop.imageUrl || "/images/clinic.jpg"} 
                alt={shop.name} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-3 right-3 bg-[#176B65] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                {shop.status || 'OPEN'}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#176B65] bg-[#DCE9E3] px-2.5 py-0.5 rounded">
                  {shop.categoryName || 'General Store'}
                </span>
                <h1 className="text-xl font-black text-[#283B3D] mt-2">{shop.name}</h1>
                <p className="text-xs text-[#283B3D]/70 flex items-start gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-[#176B65] shrink-0 mt-0.5" />
                  <span>{shop.address || 'Indira Nagar, Lucknow'}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#DCE9E3]">
                <div className="bg-[#F3F1E9] p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 block">Wait Time</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-4 h-4 text-[#176B65]" />
                    <span className="font-token font-bold text-sm text-[#283B3D]">~{shop.estimatedWaitMin || 15} mins</span>
                  </div>
                </div>

                <div className="bg-[#F3F1E9] p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 block">Queue Count</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Users className="w-4 h-4 text-[#176B65]" />
                    <span className="font-token font-bold text-sm text-[#283B3D]">{shop.waitingCount || 2} waiting</span>
                  </div>
                </div>
              </div>

              {shop.description && (
                <p className="text-xs text-[#283B3D]/70 font-medium leading-relaxed pt-1">
                  {shop.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Token Booking Form */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE9E3] shadow-md space-y-6">
          <div>
            <h2 className="text-2xl font-black text-[#283B3D]">Book Your Digital Token</h2>
            <p className="text-xs text-[#283B3D]/70 font-medium mt-1">
              Select people count, specify optional service requirements, and verify your phone.
            </p>
          </div>

          <form onSubmit={handleInitiateBooking} className="space-y-6">
            
            {/* 1. Group Size Mode Selection (1, 2, or Custom) */}
            <div>
              <label className="block text-xs font-bold text-[#283B3D] mb-2">
                Number of Persons
              </label>
              
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedGroupMode('1')}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    selectedGroupMode === '1'
                      ? 'bg-[#176B65] text-white border-[#176B65] shadow-sm'
                      : 'bg-[#F3F1E9]/70 text-[#283B3D] border-[#DCE9E3] hover:bg-[#DCE9E3]'
                  }`}
                >
                  1 Person
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGroupMode('2')}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    selectedGroupMode === '2'
                      ? 'bg-[#176B65] text-white border-[#176B65] shadow-sm'
                      : 'bg-[#F3F1E9]/70 text-[#283B3D] border-[#DCE9E3] hover:bg-[#DCE9E3]'
                  }`}
                >
                  2 People
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGroupMode('custom')}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    selectedGroupMode === 'custom'
                      ? 'bg-[#176B65] text-white border-[#176B65] shadow-sm'
                      : 'bg-[#F3F1E9]/70 text-[#283B3D] border-[#DCE9E3] hover:bg-[#DCE9E3]'
                  }`}
                >
                  Custom Group (3+)
                </button>
              </div>

              {/* Custom Number Input if 'custom' is selected */}
              {selectedGroupMode === 'custom' && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-4 bg-[#F3F1E9] rounded-2xl border border-[#DCE9E3] flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-[#283B3D] block">Enter Total People Count:</span>
                    <span className="text-[11px] text-[#283B3D]/60 font-medium">For families, groups, or multiple persons</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomCount(prev => Math.max(3, prev - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-[#DCE9E3] flex items-center justify-center font-bold text-[#176B65] hover:bg-[#DCE9E3] transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      min={3}
                      max={10}
                      value={customCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 3;
                        setCustomCount(Math.min(10, Math.max(3, val)));
                      }}
                      className="w-14 text-center font-token font-bold text-base bg-white border border-[#DCE9E3] rounded-xl py-1 focus:outline-none focus:border-[#176B65]"
                    />

                    <button
                      type="button"
                      onClick={() => setCustomCount(prev => Math.min(10, prev + 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-[#DCE9E3] flex items-center justify-center font-bold text-[#176B65] hover:bg-[#DCE9E3] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 2. Customer Details & Service Required */}
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#283B3D] mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#DCE9E3] focus:border-[#176B65] focus:outline-none text-sm text-[#283B3D] bg-[#F3F1E9]/40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#283B3D] mb-1.5">
                  10-Digit Mobile Number (For SMS & Live Alerts)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-xs font-bold text-[#283B3D]/60">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-13 pr-4 py-3 rounded-2xl border border-[#DCE9E3] focus:border-[#176B65] focus:outline-none text-sm font-semibold text-[#283B3D] bg-[#F3F1E9]/40 tracking-wider"
                    required
                  />
                </div>
              </div>

              {/* Service Required / Purpose of Visit (Optional) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#283B3D] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#176B65]" />
                    <span>Service Needed / Purpose of Visit <span className="text-slate-400 font-normal">(Optional)</span></span>
                  </label>
                </div>

                {/* Quick Selection Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {serviceSuggestions.map((srv, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomerPurpose(srv)}
                      className={`text-[11px] px-2.5 py-1 rounded-xl transition-all border ${
                        customerPurpose === srv
                          ? 'bg-[#176B65] text-white border-[#176B65] font-bold'
                          : 'bg-[#F3F1E9] text-[#283B3D]/80 border-[#DCE9E3] hover:border-[#176B65] font-medium'
                      }`}
                    >
                      {srv}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Or write custom service (e.g. Haircut & Beard, Tooth checkup...)"
                  value={customerPurpose}
                  onChange={(e) => setCustomerPurpose(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#DCE9E3] focus:border-[#176B65] focus:outline-none text-xs text-[#283B3D] bg-[#F3F1E9]/30"
                />
              </div>

              {/* 3. Companion Members Details (if groupSize > 1) */}
              {effectiveGroupSize > 1 && (
                <div className="space-y-4 pt-3 border-t border-[#DCE9E3]">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#176B65]" />
                    <span className="text-xs font-bold text-[#176B65]">
                      Companion Details ({effectiveGroupSize - 1} Members) — What services do they need?
                    </span>
                  </div>

                  <div className="space-y-3">
                    {companionDetails.map((comp, idx) => (
                      <div key={idx} className="p-3.5 bg-[#F3F1E9]/60 rounded-2xl border border-[#DCE9E3] space-y-2">
                        <span className="text-[11px] font-bold text-[#283B3D]">
                          Person #{idx + 2} Details:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder={`Companion #${idx + 2} Name (Optional)`}
                            value={comp.name}
                            onChange={(e) => {
                              const updated = [...companionDetails];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setCompanionDetails(updated);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#DCE9E3] focus:border-[#176B65] focus:outline-none text-xs text-[#283B3D] bg-white"
                          />

                          <input
                            type="text"
                            placeholder="What do they need? (e.g. Shave, Checkup...)"
                            value={comp.purpose}
                            onChange={(e) => {
                              const updated = [...companionDetails];
                              updated[idx] = { ...updated[idx], purpose: e.target.value };
                              setCompanionDetails(updated);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#DCE9E3] focus:border-[#176B65] focus:outline-none text-xs text-[#283B3D] bg-white"
                          />
                        </div>

                        {/* Quick preset chips for this companion */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {serviceSuggestions.slice(0, 3).map((srv, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => {
                                const updated = [...companionDetails];
                                updated[idx] = { ...updated[idx], purpose: srv };
                                setCompanionDetails(updated);
                              }}
                              className="text-[10px] px-2 py-0.5 rounded-lg bg-white border border-[#DCE9E3] text-[#283B3D]/70 hover:text-[#176B65] hover:border-[#176B65]"
                            >
                              + {srv}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-2xl border border-rose-200">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={booking}
              className="w-full py-4 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {booking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Issuing Token...</span>
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4 text-[#DCE9E3]" />
                  <span>Confirm & Get Digital Token</span>
                </>
              )}
            </button>
          </form>

          <div className="bg-[#DCE9E3]/50 rounded-2xl p-3.5 text-[11px] text-[#283B3D]/80 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-[#176B65] shrink-0" />
            <span>Specifying your services helps the store staff prepare your counter slot in advance.</span>
          </div>
        </div>

      </div>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-6 shadow-2xl border border-[#DCE9E3]"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-[#283B3D]">Verify Mobile OTP</h3>
                <p className="text-xs text-[#283B3D]/70 font-medium">
                  Enter the verification code sent to <br />
                  <strong className="text-[#176B65] font-bold">+91 {customerPhone}</strong>
                </p>
              </div>

              {otpSuccessMessage && (
                <div className="text-center text-[11px] font-bold text-[#176B65] bg-[#DCE9E3]/60 p-2 rounded-xl border border-[#176B65]/20">
                  {otpSuccessMessage}
                </div>
              )}

              <form onSubmit={handleVerifyOtpAndJoin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    placeholder="Enter 4-Digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-2xl border border-[#DCE9E3] focus:border-[#176B65] focus:outline-none text-center font-token text-2xl font-bold tracking-widest text-[#283B3D] bg-[#F3F1E9]/50"
                    required
                  />
                  <span className="block text-[11px] text-center text-slate-400 font-medium mt-1.5">
                    Testing in Dev Mode? Default OTP is <strong className="text-[#176B65]">1234</strong>
                  </span>
                </div>

                {otpError && (
                  <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200 text-center">
                    {otpError}
                  </p>
                )}

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {otpLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify & Book Token</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="w-full py-2.5 rounded-2xl text-xs font-bold text-[#283B3D]/70 hover:text-[#283B3D] transition-colors"
                  >
                    Change Phone Number
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
