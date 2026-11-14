"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Store, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, 
  MapPin, Clock, Phone, Smartphone, Ticket, Sparkles, Navigation,
  Scissors, Pill, Stethoscope, UtensilsCrossed, Activity, Wrench,
  QrCode, Printer, Check, LogIn, ExternalLink, RefreshCw, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OfficialBrandLogo from '@/components/OfficialBrandLogo';
import { shopApi } from '@/lib/api';

export default function MerchantRegisterPage() {
  const router = useRouter();

  // Multi-step Wizard: 1: Auth, 2: Shop Details, 3: Queue Settings, 4: Success
  const [step, setStep] = useState(1);

  // Existing registered shop check & bypass
  const [existingShop, setExistingShop] = useState(null);
  const [forceNewRegister, setForceNewRegister] = useState(false);
  const [isLoginTab, setIsLoginTab] = useState(false);
  const [existingShopDetectedOnPhone, setExistingShopDetectedOnPhone] = useState(null);

  // Quick Login State for returning merchants
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtpInput, setLoginOtpInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Step 1: Owner Auth
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [authError, setAuthError] = useState('');

  // Step 2: Shop Profile
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('salon');
  const [zone, setZone] = useState('Indira Nagar');
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState('09:00 AM – 09:00 PM');
  const [gpsCoords, setGpsCoords] = useState({ lat: 26.8861, lng: 80.9951 });
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(true);

  // Step 3: Queue Settings
  const [avgWaitMin, setAvgWaitMin] = useState(12);
  const [dailyTokenCap, setDailyTokenCap] = useState(100);
  const [tokenPrefix, setTokenPrefix] = useState('AK');
  const [enableWhatsapp, setEnableWhatsapp] = useState(true);

  // Step 4: Final Created Shop Data
  const [registeredShop, setRegisteredShop] = useState(null);

  // On mount check if shop already registered in localStorage or Database
  useEffect(() => {
    async function checkExisting() {
      if (typeof window !== 'undefined') {
        try {
          const activeStr = localStorage.getItem('ak_active_merchant_shop');
          const role = localStorage.getItem('ak_role');
          const phone = (localStorage.getItem('ak_phone') || '').replace(/\D/g, '').slice(-10);
          const params = new URLSearchParams(window.location.search);

          if (activeStr) {
            const parsed = JSON.parse(activeStr);
            let shopStillExistsInDb = false;

            // Verify with cloud database that shop wasn't deleted
            if (parsed.id) {
              try {
                const res = await shopApi.getShopById(parsed.id);
                if (res?.data?.data) {
                  shopStillExistsInDb = true;
                  setExistingShop(res.data.data);
                }
              } catch (err) {
                // Shop deleted from DB -> purge stale local storage
                localStorage.removeItem('ak_active_merchant_shop');
                localStorage.removeItem('ak_role');
                setExistingShop(null);
              }
            }

            // Only redirect to dashboard if shop is valid in cloud DB
            if (shopStillExistsInDb && role === 'MERCHANT' && params.get('new') !== 'true') {
              router.replace('/merchant/dashboard');
              return;
            }
          } else if (phone) {
            // Also check database by phone
            try {
              const res = await shopApi.getShopsByPhone(phone);
              if (res?.data?.data && res.data.data.length > 0) {
                const found = res.data.data[0];
                setExistingShop(found);
                setExistingShopDetectedOnPhone(found);
              }
            } catch (err) {}
          }

          if (params.get('new') === 'true') {
            setForceNewRegister(true);
          }
        } catch (e) {}
      }
    }
    checkExisting();
  }, [router]);

  const categoriesList = [
    { id: 'salon', name: 'Salon & Barber', icon: Scissors, img: '/images/barber.jpg', uuid: 'b1b2c3d4-0000-0000-0000-000000000001' },
    { id: 'pharmacy', name: 'Medical & Pharmacy', icon: Pill, img: '/images/pharmacy.jpg', uuid: 'b1b2c3d4-0000-0000-0000-000000000002' },
    { id: 'clinic', name: 'Doctor & Clinic', icon: Stethoscope, img: '/images/clinic.jpg', uuid: 'b1b2c3d4-0000-0000-0000-000000000003' },
    { id: 'food', name: 'Food & Chaat', icon: UtensilsCrossed, img: '/images/food.jpg', uuid: 'b1b2c3d4-0000-0000-0000-000000000004' },
    { id: 'diagnostic', name: 'Diagnostic & Lab', icon: Activity, img: '/images/diagnostic.jpg', uuid: 'b1b2c3d4-0000-0000-0000-000000000005' },
    { id: 'auto', name: 'Auto & Repair Service', icon: Wrench, img: '/images/auto.jpg', uuid: 'b1b2c3d4-0000-0000-0000-000000000006' },
  ];

  const zonesList = [
    'Indira Nagar', 'Gomti Nagar', 'Hazratganj', 'Alambagh', 'Mahanagar', 'Aliganj'
  ];

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const clean = ownerPhone.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setAuthError('');

    // Check if an existing shop is already registered with this phone in database OR localStorage
    let match = null;
    try {
      const res = await shopApi.getShopsByPhone(clean);
      if (res?.data?.data && res.data.data.length > 0) {
        match = res.data.data[0];
      }
    } catch (e) {}

    if (!match) {
      try {
        const allShops = JSON.parse(localStorage.getItem('ak_merchant_shops') || '[]');
        match = allShops.find(s => (s.phone || '').slice(-10) === clean);
        if (!match) {
          const active = JSON.parse(localStorage.getItem('ak_active_merchant_shop') || 'null');
          if (active && (active.phone || '').slice(-10) === clean) {
            match = active;
          }
        }
      } catch (e) {}
    }

    if (match) {
      setExistingShopDetectedOnPhone(match);
    } else {
      setExistingShopDetectedOnPhone(null);
    }

    setOtpSent(true);
    setOtpInput('123456'); // Auto-fill demo OTP
  };

  // Handle Quick Login Send OTP
  const handleQuickLoginSendOtp = async (e) => {
    e.preventDefault();
    const clean = loginPhone.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      setLoginError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoginError('');
    setLoginLoading(true);

    // Strictly check if a shop is registered with this phone number
    let shopExists = null;
    let backendChecked = false;
    try {
      const res = await shopApi.getShopsByPhone(clean);
      backendChecked = true;
      if (res?.data?.data && res.data.data.length > 0) {
        shopExists = res.data.data[0];
      }
    } catch (err) {
      console.warn("Backend phone lookup error:", err?.message);
    }

    // Only fallback to localStorage if backend check failed (offline),
    // NEVER if backend successfully verified that 0 shops exist in DB!
    if (!shopExists && !backendChecked) {
      try {
        const allShops = JSON.parse(localStorage.getItem('ak_merchant_shops') || '[]');
        shopExists = allShops.find(s => (s.phone || '').slice(-10) === clean);
        if (!shopExists) {
          const active = JSON.parse(localStorage.getItem('ak_active_merchant_shop') || 'null');
          if (active && (active.phone || '').slice(-10) === clean) {
            shopExists = active;
          }
        }
      } catch (err) {}
    }

    setLoginLoading(false);

    if (!shopExists) {
      setLoginError('❌ Your number is not registered! Is mobile number par koi dukan registered nahi mili. Kripya pehle "New Registration" tab me jakar dukan register karein.');
      return;
    }

    setLoginOtpSent(true);
    setLoginOtpInput('123456');
  };

  // Handle Quick Login Verify & Direct Dashboard Access
  const handleQuickLoginVerify = async (e) => {
    e.preventDefault();
    if (loginOtpInput.trim() !== '123456' && loginOtpInput.trim() !== '1234') {
      setLoginError('Invalid verification code. Enter 123456.');
      return;
    }

    const clean = loginPhone.replace(/\D/g, '').slice(-10);
    setLoginLoading(true);
    setLoginError('');
    let matchedShop = null;
    let backendChecked = false;

    // 1. Check Backend Database first
    try {
      const res = await shopApi.getShopsByPhone(clean);
      backendChecked = true;
      if (res?.data?.data && res.data.data.length > 0) {
        matchedShop = res.data.data[0];
      }
    } catch (e) {
      console.warn("Backend verify lookup error:", e?.message);
    }

    // 2. Check localStorage fallback only if backend was unreachable
    if (!matchedShop && !backendChecked) {
      try {
        const allShops = JSON.parse(localStorage.getItem('ak_merchant_shops') || '[]');
        matchedShop = allShops.find(s => (s.phone || '').slice(-10) === clean);
        if (!matchedShop) {
          const active = JSON.parse(localStorage.getItem('ak_active_merchant_shop') || 'null');
          if (active && (active.phone || '').slice(-10) === clean) {
            matchedShop = active;
          }
        }
      } catch (e) {}
    }

    setLoginLoading(false);

    if (matchedShop) {
      localStorage.setItem('ak_active_merchant_shop', JSON.stringify(matchedShop));
      localStorage.setItem('ak_role', 'MERCHANT');
      localStorage.setItem('ak_phone', clean);
      window.dispatchEvent(new Event('storage'));
      router.push('/merchant/dashboard');
      return;
    }

    // Strictly block access if shop does not exist - DO NOT advance to Step 2
    setLoginError('❌ Your number is not registered! Is mobile number par koi dukan registered nahi mili. Kripya pehle "New Registration" tab me jakar dukan register karein.');
  };

  // Direct login with already detected shop
  const handleDirectLoginWithShop = (shop) => {
    localStorage.setItem('ak_active_merchant_shop', JSON.stringify(shop));
    localStorage.setItem('ak_role', 'MERCHANT');
    window.dispatchEvent(new Event('storage'));
    router.push('/merchant/dashboard');
  };

  // Handle Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpInput.trim() !== '123456' && otpInput.trim() !== '1234') {
      setAuthError('Invalid OTP code. Please enter 123456.');
      return;
    }
    setAuthError('');
    setIsPhoneVerified(true);

    // If existing shop was already found for this phone, log in directly!
    if (existingShopDetectedOnPhone) {
      localStorage.setItem('ak_active_merchant_shop', JSON.stringify(existingShopDetectedOnPhone));
      localStorage.setItem('ak_role', 'MERCHANT');
      localStorage.setItem('ak_phone', ownerPhone.replace(/\D/g, '').slice(-10));
      window.dispatchEvent(new Event('storage'));
      router.push('/merchant/dashboard');
      return;
    }

    // Advance to Step 2 to register new shop
    setStep(2);
  };

  // Detect GPS Location
  const handleDetectGps = () => {
    setDetectingGps(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6))
          });
          setDetectingGps(false);
          setGpsDetected(true);
        },
        () => {
          // Fallback to Lucknow Indira Nagar center
          setGpsCoords({ lat: 26.8861, lng: 80.9951 });
          setDetectingGps(false);
          setGpsDetected(true);
        }
      );
    } else {
      setDetectingGps(false);
      setGpsDetected(true);
    }
  };

  // Handle Step 2 -> Step 3
  const handleProceedToSettings = (e) => {
    e.preventDefault();
    if (!shopName.trim()) {
      alert('Please enter your shop display name.');
      return;
    }
    if (!address.trim()) {
      alert('Please enter your complete shop street address.');
      return;
    }
    setStep(3);
  };

  // Handle Final Submit
  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    const selectedCategoryObj = categoriesList.find(c => c.id === category);
    const cleanPhone = ownerPhone.replace(/\D/g, '').slice(-10);

    // Save to real PostgreSQL Database via API
    const backendPayload = {
      name: shopName.trim(),
      address: address.trim() || `${zone}, Lucknow`,
      lat: Number(gpsCoords.lat) || 26.8861,
      lng: Number(gpsCoords.lng) || 80.9951,
      phone: cleanPhone,
      tokenCap: Number(dailyTokenCap) || 100,
      categoryId: selectedCategoryObj?.uuid || 'b1b2c3d4-0000-0000-0000-000000000001',
      zoneId: 'a1b2c3d4-0000-0000-0000-000000000001'
    };

    let createdId = `shop-${Date.now()}`;
    let createdSlug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      const res = await shopApi.createShop(backendPayload);
      if (res?.data?.data) {
        if (res.data.data.id) createdId = res.data.data.id;
        if (res.data.data.slug) createdSlug = res.data.data.slug;
      }
    } catch (apiErr) {
      console.warn("Backend createShop response notice:", apiErr?.response?.data || apiErr?.message);
    }

    const newShop = {
      id: createdId,
      slug: createdSlug,
      name: shopName.trim(),
      categoryName: selectedCategoryObj?.name || 'General Store',
      categoryId: category,
      zone,
      address: address.trim(),
      lat: gpsCoords.lat,
      lng: gpsCoords.lng,
      phone: cleanPhone,
      ownerName: ownerName.trim(),
      openingHours,
      avgWaitMin,
      dailyTokenCap,
      tokenPrefix: tokenPrefix.toUpperCase(),
      enableWhatsapp,
      status: 'OPEN',
      verified: true,
      currentServing: `${tokenPrefix.toUpperCase()}-001`,
      waitingCount: 0,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage merchant shops as unified client state
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('ak_merchant_shops') || '[]');
        const updated = [newShop, ...existing.filter(s => s.slug !== newShop.slug && s.id !== newShop.id)];
        localStorage.setItem('ak_merchant_shops', JSON.stringify(updated));
        localStorage.setItem('ak_active_merchant_shop', JSON.stringify(newShop));
        localStorage.setItem('ak_role', 'MERCHANT');
        localStorage.setItem('ak_phone', cleanPhone);
        const savedProfiles = JSON.parse(localStorage.getItem('ak_customer_profiles') || '{}');
        savedProfiles[cleanPhone] = { name: ownerName.trim() || 'Shop Owner', age: '' };
        localStorage.setItem('ak_customer_profiles', JSON.stringify(savedProfiles));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {}
    }

    setRegisteredShop(newShop);
    setExistingShop(newShop);
    setStep(4);
  };

  return (
    <div className="min-h-[85vh] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      {/* Top Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DCE9E3] text-[#176B65] text-xs font-bold shadow-2xs">
          <Store className="w-3.5 h-3.5" />
          <span>AbhiiKhula For Merchants • Partner Registration</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-[#283B3D]">
          Register Your Shop on AbhiiKhula
        </h1>

        <p className="text-xs sm:text-sm text-[#283B3D]/70 max-w-xl mx-auto font-medium">
          Say goodbye to crowded waiting rooms and lost customers. Give your customers instant digital queue passes and track your counter smoothly.
        </p>
      </div>

      {/* ========================================================= */}
      {/* ALREADY REGISTERED PROMINENT BANNER / CARD                */}
      {/* ========================================================= */}
      {existingShop && !forceNewRegister && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#176B65] shadow-md relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-[#176B65] text-[#F3F1E9] text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-bl-2xl flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Active Shop Found</span>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-2">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>You are already registered!</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#283B3D]">
                {existingShop.name}
              </h2>

              <p className="text-xs text-[#283B3D]/80 font-medium flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#176B65] px-2.5 py-0.5 rounded-md bg-[#DCE9E3]">
                  {existingShop.categoryName || 'Store'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F2A15A]" />
                  {existingShop.address || existingShop.zone || 'Indira Nagar'}, Lucknow
                </span>
                <span>•</span>
                <span>Prefix: <strong className="text-[#283B3D]">{existingShop.tokenPrefix || 'AK'}</strong></span>
              </p>

              <p className="text-xs text-[#283B3D]/60 pt-1">
                Owner Contact: <strong>+91 {existingShop.phone || '9876543210'}</strong> ({existingShop.ownerName || 'Verified Merchant'})
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleDirectLoginWithShop(existingShop)}
                className="px-6 py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white text-xs font-bold text-center transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Live Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#F2A15A]" />
              </button>

              <button
                type="button"
                onClick={() => setForceNewRegister(true)}
                className="px-4 py-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-[#283B3D] text-xs font-bold transition-all text-center cursor-pointer"
              >
                Register Another Branch
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stepper Progress Bar (Only shown when registering a new shop or forced) */}
      {(!existingShop || forceNewRegister) && (
        <div className="bg-white rounded-2xl p-4 border border-[#DCE9E3] shadow-xs">
          <div className="flex items-center justify-between max-w-md mx-auto text-xs font-bold">
            
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                step > 1 ? 'bg-emerald-600 text-white' : step === 1 ? 'bg-[#176B65] text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </span>
              <span className={step >= 1 ? 'text-[#283B3D]' : 'text-slate-400'}>Owner Auth</span>
            </div>

            <div className={`h-0.5 flex-1 mx-3 ${step > 1 ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                step > 2 ? 'bg-emerald-600 text-white' : step === 2 ? 'bg-[#176B65] text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {step > 2 ? <Check className="w-4 h-4" /> : '2'}
              </span>
              <span className={step >= 2 ? 'text-[#283B3D]' : 'text-slate-400'}>Shop Info</span>
            </div>

            <div className={`h-0.5 flex-1 mx-3 ${step > 2 ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>

            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                step > 3 ? 'bg-emerald-600 text-white' : step === 3 ? 'bg-[#176B65] text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {step > 3 ? <Check className="w-4 h-4" /> : '3'}
              </span>
              <span className={step >= 3 ? 'text-[#283B3D]' : 'text-slate-400'}>Queue Setup</span>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 1: OWNER VERIFICATION OR QUICK LOGIN                 */}
      {/* ========================================================= */}
      {(!existingShop || forceNewRegister) && step === 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-[#DCE9E3] shadow-sm space-y-6"
        >
          {/* Auth Tab Switcher */}
          <div className="flex items-center justify-between border-b border-[#DCE9E3] pb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-black text-[#283B3D]">
                {isLoginTab ? 'Merchant Quick Login' : 'Step 1: Shop Owner Verification'}
              </h2>
              <p className="text-xs text-[#283B3D]/70 font-medium">
                {isLoginTab ? 'Already registered? Login directly to access your counter.' : 'Verify your mobile number to manage your digital counter.'}
              </p>
            </div>

            <div className="inline-flex p-1 bg-[#F3F1E9] rounded-2xl border border-[#DCE9E3]">
              <button
                type="button"
                onClick={() => { setIsLoginTab(false); setAuthError(''); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isLoginTab ? 'bg-[#176B65] text-white shadow-2xs' : 'text-[#283B3D]/70 hover:text-[#283B3D]'
                }`}
              >
                New Registration
              </button>
              <button
                type="button"
                onClick={() => { setIsLoginTab(true); setLoginError(''); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLoginTab ? 'bg-[#176B65] text-white shadow-2xs' : 'text-[#283B3D]/70 hover:text-[#283B3D]'
                }`}
              >
                Quick Login
              </button>
            </div>
          </div>

          {/* Quick Login View */}
          {isLoginTab ? (
            <div className="space-y-4 max-w-lg">
              {loginError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#283B3D] mb-1.5">Registered 10-Digit Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-xs font-bold text-slate-400">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                    disabled={loginOtpSent}
                    className="w-full bg-[#F3F1E9]/60 border border-[#DCE9E3] rounded-2xl pl-12 pr-4 py-3 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                  />
                </div>
              </div>

              {!loginOtpSent ? (
                <button
                  type="button"
                  onClick={handleQuickLoginSendOtp}
                  disabled={loginLoading}
                  className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4 text-[#F2A15A]" />
                  <span>{loginLoading ? 'Checking Number in Database...' : 'Send Login OTP'}</span>
                </button>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center justify-between">
                    <span>Demo OTP sent: <strong>123456</strong></span>
                    <button 
                      type="button" 
                      onClick={() => { setLoginOtpSent(false); setLoginOtpInput(''); }}
                      className="text-[11px] underline text-emerald-700"
                    >
                      Change Number
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#283B3D] mb-1.5">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={loginOtpInput}
                      onChange={(e) => setLoginOtpInput(e.target.value)}
                      className="w-full bg-[#F3F1E9]/60 border border-[#DCE9E3] rounded-2xl px-4 py-3 text-center tracking-widest text-lg font-token font-bold text-[#176B65] focus:outline-none focus:border-[#176B65]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickLoginVerify}
                    disabled={loginLoading}
                    className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#F2A15A]" />
                    <span>{loginLoading ? 'Verifying with Database...' : 'Verify & Enter Dashboard'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* New Registration Step 1 Form */
            <div className="space-y-4 max-w-lg">
              {authError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                  {authError}
                </div>
              )}

              {/* Detected Existing Shop on Phone Banner */}
              {existingShopDetectedOnPhone && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-bold flex items-center justify-between gap-3">
                  <div>
                    <span>This mobile is already linked to <strong>{existingShopDetectedOnPhone.name}</strong>!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDirectLoginWithShop(existingShopDetectedOnPhone)}
                    className="px-3 py-1.5 rounded-xl bg-[#176B65] text-white text-[11px] font-bold shrink-0 hover:bg-[#125550] cursor-pointer"
                  >
                    Open Dashboard →
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#283B3D] mb-1.5">Shop Owner / Manager Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Verma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  disabled={otpSent}
                  className="w-full bg-[#F3F1E9]/60 border border-[#DCE9E3] rounded-2xl px-4 py-3 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#283B3D] mb-1.5">10-Digit Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-xs font-bold text-slate-400">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value.replace(/\D/g, ''))}
                    disabled={otpSent}
                    className="w-full bg-[#F3F1E9]/60 border border-[#DCE9E3] rounded-2xl pl-12 pr-4 py-3 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Send Verification OTP</span>
                  <ArrowRight className="w-4 h-4 text-[#F2A15A]" />
                </button>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center justify-between">
                    <span>Demo OTP sent: <strong>123456</strong></span>
                    <button 
                      type="button" 
                      onClick={() => { setOtpSent(false); setOtpInput(''); }}
                      className="text-[11px] underline text-emerald-700"
                    >
                      Change Number
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#283B3D] mb-1.5">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full bg-[#F3F1E9]/60 border border-[#DCE9E3] rounded-2xl px-4 py-3 text-center tracking-widest text-lg font-token font-bold text-[#176B65] focus:outline-none focus:border-[#176B65]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#F2A15A]" />
                    <span>Verify & Proceed to Shop Details</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* STEP 2: SHOP PROFILE & LOCATION FORM                     */}
      {/* ========================================================= */}
      {step === 2 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-[#DCE9E3] shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between border-b border-[#DCE9E3] pb-4">
            <div>
              <h2 className="text-xl font-black text-[#283B3D]">Step 2: Shop Details & Location</h2>
              <p className="text-xs text-[#283B3D]/70 font-medium">This information helps nearby customers find and book with you.</p>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-bold text-slate-500 hover:text-[#176B65] flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          <form onSubmit={handleProceedToSettings} className="space-y-5">
            
            {/* Shop Name */}
            <div>
              <label className="block text-xs font-bold text-[#283B3D] mb-1.5">Shop Display Name *</label>
              <input
                type="text"
                placeholder="e.g. Royal Barber & Hair Studio / Gupta Care Chemist"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                className="w-full bg-[#F3F1E9]/60 border border-[#DCE9E3] rounded-2xl px-4 py-3 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
              />
            </div>

            {/* Category Selector Grid */}
            <div>
              <label className="block text-xs font-bold text-[#283B3D] mb-2">Select Shop Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categoriesList.map((c) => {
                  const Icon = c.icon;
                  const isSelected = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected 
                          ? 'border-[#176B65] bg-[#DCE9E3]/50 shadow-xs' 
                          : 'border-[#DCE9E3] bg-[#F3F1E9]/40 hover:bg-[#F3F1E9]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#176B65] text-white' : 'bg-[#DCE9E3] text-[#176B65]'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#283B3D] line-clamp-1">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Zone & Opening Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#283B3D] mb-1.5">City Zone / Neighborhood *</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full bg-[#F3F1E9]/60 border border-[#DCE9E3] rounded-2xl px-4 py-3 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                >
                  {zonesList.map(z => (
                    <option key={z} value={z}>{z}, Lucknow</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#283B3D] mb-1.5">Store Timings *</label>
                <input
                  type="text"
                  placeholder="e.g. 09:00 AM – 09:30 PM"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  className="w-full bg-[#F3F1E9]/60 border border-[#DCE9E3] rounded-2xl px-4 py-3 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                />
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-xs font-bold text-[#283B3D] mb-1.5">Complete Street Address *</label>
              <textarea
                rows={2}
                placeholder="Shop No., Market / Road, Sector, Landmark, Lucknow"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full bg-[#F3F1E9]/60 border border-[#DCE9E3] rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
              />
            </div>

            {/* GPS Detection Card */}
            <div className="p-4 rounded-2xl bg-[#F3F1E9]/80 border border-[#DCE9E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#DCE9E3] text-[#176B65] flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#283B3D] block">Store GPS Coordinates</span>
                  <span className="text-[11px] text-[#283B3D]/70">
                    Lat: {gpsCoords.lat}, Lng: {gpsCoords.lng} ({zone})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDetectGps}
                disabled={detectingGps}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#DCE9E3]/50 border border-[#176B65]/30 text-xs font-bold text-[#176B65] cursor-pointer transition-colors shrink-0"
              >
                {detectingGps ? 'Detecting...' : 'Detect GPS Again'}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Continue to Queue Configuration</span>
              <ArrowRight className="w-4 h-4 text-[#F2A15A]" />
            </button>
          </form>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* STEP 3: QUEUE & TOKEN SETTINGS FORM                      */}
      {/* ========================================================= */}
      {step === 3 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-[#DCE9E3] shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between border-b border-[#DCE9E3] pb-4">
            <div>
              <h2 className="text-xl font-black text-[#283B3D]">Step 3: Queue & Token Settings</h2>
              <p className="text-xs text-[#283B3D]/70 font-medium">Configure how tokens are issued and wait times are estimated.</p>
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs font-bold text-slate-500 hover:text-[#176B65] flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          <form onSubmit={handleFinalSubmit} className="space-y-6 max-w-lg">
            
            {/* Average Service Time */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#283B3D]">Average Service Time Per Customer</label>
                <div className="flex items-center gap-1 bg-[#DCE9E3] px-2 py-0.5 rounded-lg border border-[#176B65]/20">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={avgWaitMin}
                    onChange={(e) => setAvgWaitMin(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-12 text-xs font-black text-[#176B65] bg-transparent text-center focus:outline-none"
                  />
                  <span className="text-xs font-bold text-[#176B65]">Min</span>
                </div>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={avgWaitMin}
                onChange={(e) => setAvgWaitMin(Number(e.target.value))}
                className="w-full accent-[#176B65] cursor-pointer"
              />
              <p className="text-[11px] text-[#283B3D]/60 mt-1">This calculates real-time estimated wait time for your customers.</p>
            </div>

            {/* Daily Token Cap */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#283B3D] mb-1.5">Daily Token Limit</label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={dailyTokenCap}
                  onChange={(e) => setDailyTokenCap(Number(e.target.value))}
                  className="w-full bg-[#F3F1E9]/60 border border-[#DCE9E3] rounded-2xl px-4 py-3 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#283B3D] mb-1.5">Token Prefix Code</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. AK, RB"
                  value={tokenPrefix}
                  onChange={(e) => setTokenPrefix(e.target.value.toUpperCase())}
                  className="w-full bg-[#F3F1E9]/60 border border-[#DCE9E3] rounded-2xl px-4 py-3 text-xs font-bold text-[#176B65] tracking-wider uppercase focus:outline-none focus:border-[#176B65]"
                />
              </div>
            </div>

            {/* Live WhatsApp / SMS Alerts */}
            <div className="p-4 rounded-2xl bg-[#DCE9E3]/40 border border-[#176B65]/20 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#283B3D] block">Automatic Turn Notifications</span>
                <span className="text-[11px] text-[#283B3D]/70">Alerts customers automatically when 2 people are ahead of them.</span>
              </div>
              <input
                type="checkbox"
                checked={enableWhatsapp}
                onChange={(e) => setEnableWhatsapp(e.target.checked)}
                className="w-5 h-5 accent-[#176B65] rounded cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-sm shadow-lg shadow-[#176B65]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-5 h-5 text-[#F2A15A]" />
              <span>Complete Registration & Launch Counter</span>
            </button>
          </form>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* STEP 4: REGISTRATION SUCCESS & QR POSTER                 */}
      {/* ========================================================= */}
      {step === 4 && registeredShop && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-[#DCE9E3] shadow-lg space-y-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#176B65] bg-[#DCE9E3] px-3.5 py-1 rounded-full">
              Registration Successful • Verified Live
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#283B3D]">
              Congratulations! {registeredShop.name} is Live
            </h2>
            <p className="text-xs sm:text-sm text-[#283B3D]/70 max-w-md mx-auto font-medium">
              Your digital queue station is set up. Customers can now book tokens online and scan your counter QR pass.
            </p>
          </div>

          {/* Printable Counter QR Card */}
          <div className="max-w-xs mx-auto bg-[#F3F1E9] rounded-3xl p-6 border-2 border-dashed border-[#176B65] space-y-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-[#176B65] tracking-widest block">Scan to take token</span>
              <h3 className="font-black text-sm text-[#283B3D] truncate">{registeredShop.name}</h3>
            </div>

            {/* Simulated Clean QR Code Graphic */}
            <div className="w-44 h-44 bg-white rounded-2xl p-3 mx-auto shadow-xs border border-[#DCE9E3] flex flex-col items-center justify-center">
              <QrCode className="w-32 h-32 text-[#283B3D]" />
              <span className="text-[9px] font-bold text-slate-400 mt-1">abhiikhula.in/book/{registeredShop.slug}</span>
            </div>

            <div className="text-[11px] font-bold text-[#176B65] flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#F2A15A]" />
              <span>Zero Physical Line • Instant Pass</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-[#DCE9E3] hover:bg-slate-50 text-xs font-bold text-[#283B3D] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-[#176B65]" />
              <span>Print Counter QR Poster</span>
            </button>

            <Link
              href="/merchant/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
            >
              <span>Open Merchant Counter Dashboard</span>
              <ArrowRight className="w-4 h-4 text-[#F2A15A]" />
            </Link>
          </div>
        </motion.div>
      )}

    </div>
  );
}
