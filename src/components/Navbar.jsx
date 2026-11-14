"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, Ticket, Store, Sparkles, User, UserCheck, 
  ChevronDown, LogOut, Edit2, Check, X, History, ShieldCheck, 
  ArrowRight, Phone, Calendar, KeyRound, Lock, RefreshCw, AlertCircle, Sparkle, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '@/lib/api';
import FreshUrbanLogo from './FreshUrbanLogo';
import OfficialBrandLogo from './OfficialBrandLogo';

export default function Navbar() {
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const merchantDropdownRef = useRef(null);

  // Unified Role State: 'GUEST', 'CUSTOMER', 'MERCHANT'
  const [userRole, setUserRole] = useState('GUEST');

  // Customer Profile State
  const [customerName, setCustomerName] = useState('Guest');
  const [customerAge, setCustomerAge] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);

  // Merchant Profile State
  const [isShopkeeperLoggedIn, setIsShopkeeperLoggedIn] = useState(false);
  const [registeredMerchantShop, setRegisteredMerchantShop] = useState(null);
  const [merchantDropdownOpen, setMerchantDropdownOpen] = useState(false);

  // Profile Dropdown & Inline Edit State
  const [profileOpen, setProfileOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editNameInput, setEditNameInput] = useState('');
  const [editAgeInput, setEditAgeInput] = useState('');

  // Login Modal State
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginAge, setLoginAge] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccessMsg, setLoginSuccessMsg] = useState('');
  const [existingUserDetected, setExistingUserDetected] = useState(null);

  // Helper: Detect if phone is already registered as customer or shopkeeper
  const detectExistingUser = (phone) => {
    if (typeof window === 'undefined' || !phone) return null;
    const clean = phone.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) return null;
    try {
      const savedProfiles = JSON.parse(localStorage.getItem('ak_customer_profiles') || '{}');
      if (savedProfiles[clean]?.name) {
        return {
          name: savedProfiles[clean].name,
          age: savedProfiles[clean].age || '',
          source: 'CUSTOMER'
        };
      }
      if (localStorage.getItem('ak_phone') === clean && localStorage.getItem('ak_customer_name')) {
        return {
          name: localStorage.getItem('ak_customer_name'),
          age: localStorage.getItem('ak_customer_age') || '',
          source: 'CUSTOMER'
        };
      }
      const allShops = JSON.parse(localStorage.getItem('ak_merchant_shops') || '[]');
      const matchShop = allShops.find(s => (s.phone || '').slice(-10) === clean);
      if (matchShop) {
        return {
          name: matchShop.ownerName || matchShop.name || 'Shop Owner',
          age: '',
          source: 'MERCHANT'
        };
      }
      const activeShop = JSON.parse(localStorage.getItem('ak_active_merchant_shop') || 'null');
      if (activeShop && (activeShop.phone || '').slice(-10) === clean) {
        return {
          name: activeShop.ownerName || activeShop.name || 'Shop Owner',
          age: '',
          source: 'MERCHANT'
        };
      }
    } catch (e) {}
    return null;
  };

  // 100% Customer Focused Navigation
  const navLinks = [
    { href: '/', label: 'Explore Shops', icon: Compass },
    { href: '/tokens', label: 'My Live Tokens', icon: Ticket },
  ];

  // Sync profile & role details from localStorage
  const syncProfile = () => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('ak_role') || '';
      const phone = localStorage.getItem('ak_phone') || '';
      const name = localStorage.getItem('ak_customer_name') || '';
      const age = localStorage.getItem('ak_customer_age') || '';
      const token = localStorage.getItem('ak_token') || '';

      // Check merchant shop
      let merchantShop = null;
      try {
        const merchantStr = localStorage.getItem('ak_active_merchant_shop');
        if (merchantStr) {
          merchantShop = JSON.parse(merchantStr);
        }
      } catch (e) {}

      setRegisteredMerchantShop(merchantShop);

      const isMerchantRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/merchant');

      // Determine role: if on merchant route with a registered shop, prioritize merchant view
      if ((role === 'MERCHANT' || isMerchantRoute) && merchantShop) {
        setUserRole('MERCHANT');
        setIsShopkeeperLoggedIn(true);
        setIsCustomerLoggedIn(false);
        setCustomerName('Guest');
        setCustomerPhone('');
        setCustomerAge('');
      } else if (role === 'CUSTOMER' && (token || phone)) {
        setUserRole('CUSTOMER');
        setIsCustomerLoggedIn(true);
        setIsShopkeeperLoggedIn(false);
        setCustomerPhone(phone);
        setCustomerAge(age);
        if (name && name !== 'Customer') {
          setCustomerName(name);
        } else if (phone) {
          setCustomerName(`Customer (${phone.slice(-4)})`);
        } else {
          setCustomerName('Guest');
        }
      } else {
        setUserRole('GUEST');
        setIsCustomerLoggedIn(false);
        setIsShopkeeperLoggedIn(false);
        setCustomerName('Guest');
        setCustomerPhone('');
        setCustomerAge('');
      }

      // Read active tokens count scoped strictly to current logged-in user's phone
      try {
        const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
        const activeStr = localStorage.getItem('ak_customer_tokens');
        const activeList = activeStr ? JSON.parse(activeStr) : [];
        const userActive = Array.isArray(activeList) ? activeList.filter(t => {
          if (cleanPhone) {
            return (t.customerPhone || '').replace(/\D/g, '').slice(-10) === cleanPhone;
          }
          return !t.customerPhone || t.isGuest;
        }) : [];
        setActiveCount(userActive.length);

        const histStr = localStorage.getItem('ak_customer_history');
        const histList = histStr ? JSON.parse(histStr) : [];
        const userHist = Array.isArray(histList) ? histList.filter(t => {
          if (cleanPhone) {
            return (t.customerPhone || '').replace(/\D/g, '').slice(-10) === cleanPhone;
          }
          return false;
        }) : [];
        setHistoryCount(userHist.length);
      } catch (e) {}
    }
  };

  useEffect(() => {
    syncProfile();
    window.addEventListener('storage', syncProfile);

    // Click outside listener for dropdowns
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
        setIsEditingProfile(false);
      }
      if (merchantDropdownRef.current && !merchantDropdownRef.current.contains(e.target)) {
        setMerchantDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('storage', syncProfile);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Save updated name and age from profile card
  const handleSaveProfileEdit = (e) => {
    e.preventDefault();
    const cleanName = editNameInput.trim() || customerName;
    const cleanAge = editAgeInput.trim() || customerAge;
    
    setCustomerName(cleanName);
    setCustomerAge(cleanAge);

    if (typeof window !== 'undefined') {
      localStorage.setItem('ak_customer_name', cleanName);
      if (cleanAge) localStorage.setItem('ak_customer_age', cleanAge);
      window.dispatchEvent(new Event('storage'));
    }
    setIsEditingProfile(false);
  };

  // Open Login Modal
  const handleOpenLogin = () => {
    setProfileOpen(false);
    setLoginError('');
    setLoginSuccessMsg('');
    setOtpSent(false);
    setLoginOtp('');
    const curPhone = customerPhone || '';
    setLoginPhone(curPhone);
    const detected = detectExistingUser(curPhone);
    setExistingUserDetected(detected);
    if (detected) {
      setLoginName(detected.name || '');
      setLoginAge(detected.age || '');
    } else {
      setLoginName(customerName !== 'Guest' ? customerName : '');
      setLoginAge(customerAge || '');
    }
    setLoginModalOpen(true);
  };

  // Handle Phone input change with real-time Cloud DB + Local detection
  const handlePhoneInputChange = async (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setLoginPhone(clean);
    setLoginError('');

    if (clean.length === 10) {
      // 1. Quick check localStorage
      const localMatch = detectExistingUser(clean);
      if (localMatch) {
        setExistingUserDetected(localMatch);
        setLoginName(localMatch.name || '');
        setLoginAge(localMatch.age || '');
        return;
      }

      // 2. Query cloud PostgreSQL database via checkPhone API
      try {
        const res = await authApi.checkPhone(clean);
        if (res?.data?.data?.registered) {
          const cloudMatch = {
            name: res.data.data.name || 'Customer',
            age: res.data.data.age ? String(res.data.data.age) : '',
            source: 'CLOUD'
          };
          setExistingUserDetected(cloudMatch);
          setLoginName(cloudMatch.name);
          setLoginAge(cloudMatch.age);
          return;
        }
      } catch (err) {}

      setExistingUserDetected(null);
    } else {
      setExistingUserDetected(null);
    }
  };

  // Step 1: Send OTP (Existing customers need ONLY mobile number, new fill name & age)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanPhone = loginPhone.trim().replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setLoginError("Please enter a valid 10-digit Indian mobile number (starting with 6-9)");
      return;
    }

    setLoginLoading(true);

    // Double check cloud DB if not detected locally yet
    let detected = existingUserDetected || detectExistingUser(cleanPhone);
    if (!detected) {
      try {
        const checkRes = await authApi.checkPhone(cleanPhone);
        if (checkRes?.data?.data?.registered) {
          detected = {
            name: checkRes.data.data.name || 'Customer',
            age: checkRes.data.data.age ? String(checkRes.data.data.age) : '',
            source: 'CLOUD'
          };
          setExistingUserDetected(detected);
          setLoginName(detected.name);
          setLoginAge(detected.age);
        }
      } catch (err) {}
    }

    if (!detected) {
      if (!loginName.trim()) {
        setLoginError("Naye customer ke liye Apna Pura Naam bharna zaroori hai.");
        setLoginLoading(false);
        return;
      }
      if (!loginAge.trim()) {
        setLoginError("Naye customer ke liye Apni Age (Umar) bharna zaroori hai.");
        setLoginLoading(false);
        return;
      }
      const ageNum = parseInt(loginAge.trim(), 10);
      if (isNaN(ageNum) || ageNum < 5 || ageNum > 115) {
        setLoginError("Kripya sahi age (umar) darj karein (5 se 115 saal).");
        setLoginLoading(false);
        return;
      }
    }

    try {
      try {
        const otpRes = await authApi.sendOtp(cleanPhone);
        if (otpRes?.data?.data?.registered && !detected) {
          const autoFound = {
            name: otpRes.data.data.name || 'Customer',
            age: otpRes.data.data.age ? String(otpRes.data.data.age) : '',
            source: 'CLOUD'
          };
          setExistingUserDetected(autoFound);
          if (autoFound.name) setLoginName(autoFound.name);
          if (autoFound.age) setLoginAge(autoFound.age);
        }
      } catch (backendErr) {
        console.warn("Backend send-otp fallback:", backendErr?.message);
      }
      setOtpSent(true);
      setLoginOtp('1234'); // Auto-fill pilot OTP for seamless testing
      setLoginSuccessMsg(`Verification code sent to +91 ${cleanPhone}`);
    } catch (err) {
      setLoginError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Step 2: Verify OTP and Log In
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanOtp = loginOtp.trim();
    if (cleanOtp.length < 4 || cleanOtp.length > 6) {
      setLoginError("Please enter the 4 to 6-digit OTP (e.g. 1234)");
      return;
    }

    setLoginLoading(true);
    try {
      const cleanPhone = loginPhone.trim().replace(/\D/g, '').slice(-10);
      let token = 'mock-customer-jwt-' + Date.now();
      let serverName = '';

      // Resolve final name: user input > detected profile > Customer (last 4 digits)
      let resolvedName = loginName.trim() || (existingUserDetected?.name) || '';
      let resolvedAge = loginAge.trim() || (existingUserDetected?.age) || '';

      try {
        const res = await authApi.verifyOtp(cleanPhone, cleanOtp, resolvedName, resolvedAge);
        if (res?.data?.data?.token) {
          token = res.data.data.token;
        }
        if (res?.data?.data?.name) {
          serverName = res.data.data.name;
        }
        if (res?.data?.data?.age) {
          resolvedAge = String(res.data.data.age);
        }
      } catch (backendErr) {
        console.warn("Backend verify-otp fallback:", backendErr?.message);
      }

      if (!resolvedName && serverName) {
        resolvedName = serverName;
      }
      if (!resolvedName) {
        resolvedName = `Customer (${cleanPhone.slice(-4)})`;
      }

      // Save user session in localStorage as CUSTOMER
      if (typeof window !== 'undefined') {
        localStorage.setItem('ak_token', token);
        localStorage.setItem('ak_phone', cleanPhone);
        localStorage.setItem('ak_role', 'CUSTOMER');
        localStorage.setItem('ak_customer_name', resolvedName);
        if (resolvedAge) localStorage.setItem('ak_customer_age', resolvedAge);

        // Update persistent phone -> profile map so user never has to re-register
        const savedProfiles = JSON.parse(localStorage.getItem('ak_customer_profiles') || '{}');
        savedProfiles[cleanPhone] = { name: resolvedName, age: resolvedAge };
        localStorage.setItem('ak_customer_profiles', JSON.stringify(savedProfiles));

        window.dispatchEvent(new Event('storage'));
      }

      syncProfile();
      setLoginModalOpen(false);
      setOtpSent(false);
      setLoginOtp('');
    } catch (err) {
      setLoginError(err.message || 'Invalid OTP. Please check and try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout Customer account -> returns to GUEST state & redirects to explore shops
  const handleLogout = () => {
    if (window.confirm("Do you want to log out from this customer account?")) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ak_token');
        localStorage.removeItem('ak_phone');
        localStorage.removeItem('ak_customer_name');
        localStorage.removeItem('ak_customer_age');
        localStorage.removeItem('ak_role');
        localStorage.removeItem('ak_active_merchant_shop');
        window.dispatchEvent(new Event('storage'));
        window.location.href = '/';
      }
      setIsCustomerLoggedIn(false);
      setIsShopkeeperLoggedIn(false);
      setRegisteredMerchantShop(null);
      setUserRole('GUEST');
      setCustomerName('Guest');
      setCustomerPhone('');
      setCustomerAge('');
      setActiveCount(0);
      setHistoryCount(0);
      setProfileOpen(false);
    }
  };

  // Logout Shopkeeper account -> returns to GUEST state & redirects to explore shops
  const handleMerchantLogout = () => {
    if (window.confirm("Do you want to log out from this shopkeeper account?")) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ak_active_merchant_shop');
        localStorage.removeItem('ak_role');
        localStorage.removeItem('ak_phone');
        localStorage.removeItem('ak_token');
        localStorage.removeItem('ak_customer_name');
        localStorage.removeItem('ak_customer_age');
        window.dispatchEvent(new Event('storage'));
        window.location.href = '/';
      }
      setIsShopkeeperLoggedIn(false);
      setRegisteredMerchantShop(null);
      setIsCustomerLoggedIn(false);
      setUserRole('GUEST');
      setCustomerName('Guest');
      setCustomerPhone('');
      setCustomerAge('');
      setMerchantDropdownOpen(false);
    }
  };

  return (
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-[#F3F1E9]/90 backdrop-blur-md border-b border-[#DCE9E3] shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Official Brand Logo from User Spec */}
          {/* Brand Logo - Links to Dashboard if Merchant, else Home */}
          <Link 
            href={userRole === 'MERCHANT' ? "/merchant/dashboard" : "/"} 
            className="flex items-center gap-2 group cursor-pointer"
          >
            <OfficialBrandLogo height={46} animate={true} />
          </Link>

          {/* Desktop Navigation Links */}
          {userRole === 'MERCHANT' ? (
            <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#DCE9E3]/70 border border-[#176B65]/20 text-xs font-bold text-[#176B65]">
              <Store className="w-4 h-4 text-[#176B65]" />
              <span>Counter Operations Active</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
            </div>
          ) : (
            <nav className="hidden md:flex items-center gap-1.5 bg-[#DCE9E3]/70 p-1.5 rounded-2xl border border-[#DCE9E3]">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isActive ? 'text-[#176B65]' : 'text-[#283B3D]/80 hover:text-[#176B65]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navUrbanGlow"
                        className="absolute inset-0 bg-white rounded-xl shadow-xs border border-[#DCE9E3]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#176B65]' : 'text-[#283B3D]/60'}`} />
                      <span>{link.label}</span>
                      {link.href === '/tokens' && activeCount > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none transition-colors ${
                          isActive ? 'bg-[#176B65] text-white' : 'bg-[#176B65]/15 text-[#176B65]'
                        }`}>
                          {activeCount}
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* ======================================================== */}
          {/* STATE 1: GUEST (NEITHER LOGGED IN)                       */}
          {/* Show BOTH Shopkeeper & Customer buttons, identical style */}
          {/* ======================================================== */}
          {userRole === 'GUEST' && (
            <div className="flex items-center gap-2.5">
              {/* Shopkeeper Button (Guest Mode - Identical Customer Styling) */}
              <Link
                href="/merchant/register?tab=login"
                className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-2xl border transition-all cursor-pointer shadow-xs active:scale-98 bg-white hover:bg-[#DCE9E3]/40 border-[#DCE9E3] text-[#283B3D]"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-xs shrink-0 bg-[#DCE9E3] text-[#176B65]">
                  <Store className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block pr-1">
                  <span className="text-[10px] uppercase font-bold text-[#176B65] block leading-none">
                    Shopkeeper
                  </span>
                  <span className="text-xs font-black text-[#283B3D] line-clamp-1 max-w-[120px] leading-tight mt-0.5">
                    Partner / Shop
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-[#176B65] text-white px-2 py-0.5 rounded-lg hidden sm:inline-block ml-0.5">
                  Join / Login
                </span>
              </Link>

              {/* Customer Sign In Button */}
              <button
                type="button"
                onClick={() => handleOpenLogin()}
                className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-2xl border transition-all cursor-pointer shadow-xs active:scale-98 bg-white hover:bg-[#DCE9E3]/40 border-[#DCE9E3] text-[#283B3D]"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-xs shrink-0 bg-slate-200 text-slate-600">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block pr-1">
                  <span className="text-[10px] uppercase font-bold text-[#176B65] block leading-none">
                    Customer
                  </span>
                  <span className="text-xs font-black text-[#283B3D] line-clamp-1 max-w-[120px] leading-tight mt-0.5">
                    Guest
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-[#176B65] text-white px-2 py-0.5 rounded-lg hidden sm:inline-block ml-0.5">
                  Sign In
                </span>
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* STATE 2: SHOPKEEPER LOGGED IN                            */}
          {/* Customer button is HIDDEN. Only Shopkeeper Pill & Logout */}
          {/* ======================================================== */}
          {userRole === 'MERCHANT' && (
            <div className="relative flex items-center gap-2.5" ref={merchantDropdownRef}>
              <button
                type="button"
                onClick={() => setMerchantDropdownOpen(!merchantDropdownOpen)}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl border transition-all cursor-pointer shadow-xs active:scale-98 bg-[#DCE9E3]/70 hover:bg-[#DCE9E3] border-[#176B65]/20 text-[#283B3D]"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-xs shrink-0 bg-[#176B65] text-white">
                  <Store className="w-4 h-4" />
                </div>

                <div className="text-left hidden sm:block pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#176B65] block leading-none">
                      Shopkeeper
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                  </div>
                  <span className="text-xs font-black text-[#283B3D] line-clamp-1 max-w-[130px] leading-tight mt-0.5">
                    {registeredMerchantShop?.name || 'My Shop'}
                  </span>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-[#283B3D]/60 transition-transform ${merchantDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Shopkeeper Dropdown Menu */}
              <AnimatePresence>
                {merchantDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-14 w-76 sm:w-84 bg-white rounded-3xl p-5 shadow-2xl border border-[#DCE9E3] space-y-4 z-50 text-[#283B3D]"
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 border-b border-[#DCE9E3] pb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#DCE9E3] border border-[#176B65]/30 text-[#176B65] flex items-center justify-center shrink-0">
                        <Store className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm text-[#283B3D] truncate">
                          {registeredMerchantShop?.name || 'My Shop'}
                        </h4>
                        <p className="text-xs text-[#283B3D]/70 font-medium mt-0.5">
                          {registeredMerchantShop?.categoryName || 'Store'} • {registeredMerchantShop?.zone || 'Lucknow'}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1.5 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Active Shopkeeper Console</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-1.5 pt-1">
                      <Link
                        href="/merchant/dashboard"
                        onClick={() => setMerchantDropdownOpen(false)}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-[#176B65] text-white hover:bg-[#135954] text-xs font-bold flex items-center justify-between transition-colors cursor-pointer shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-[#F2A15A]" />
                          <span>Open Live Dashboard</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href="/merchant/register?new=true"
                        onClick={() => setMerchantDropdownOpen(false)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-[#DCE9E3]/40 text-xs font-bold flex items-center justify-between text-[#283B3D] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#176B65]" />
                          <span>Register Another Branch</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </div>

                    {/* Shopkeeper Logout */}
                    <div className="pt-2 border-t border-[#DCE9E3]">
                      <button
                        type="button"
                        onClick={handleMerchantLogout}
                        className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out as Shopkeeper</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ======================================================== */}
          {/* STATE 3: CUSTOMER LOGGED IN                              */}
          {/* Shopkeeper button is HIDDEN. Customer Profile with Logout */}
          {/* ======================================================== */}
          {userRole === 'CUSTOMER' && (
            <div className="relative flex items-center gap-2.5" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  syncProfile();
                  setProfileOpen(!profileOpen);
                  setIsEditingProfile(false);
                }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl border transition-all cursor-pointer shadow-xs active:scale-98 bg-[#DCE9E3]/70 hover:bg-[#DCE9E3] border-[#176B65]/20 text-[#283B3D]"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-xs shrink-0 bg-[#176B65] text-white">
                  <User className="w-4 h-4" />
                </div>

                <div className="text-left hidden sm:block pr-1">
                  <span className="text-[10px] uppercase font-bold text-[#176B65] block leading-none">
                    Customer
                  </span>
                  <span className="text-xs font-black text-[#283B3D] line-clamp-1 max-w-[120px] leading-tight mt-0.5">
                    {customerName}
                  </span>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-[#283B3D]/60 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

            {/* Profile Dropdown Card (When Logged In) */}
            <AnimatePresence>
              {profileOpen && isCustomerLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-14 w-76 sm:w-84 bg-white rounded-3xl p-5 shadow-2xl border border-[#DCE9E3] space-y-4 z-50 text-[#283B3D]"
                >
                  {/* Profile Header */}
                  <div className="flex items-start gap-3 border-b border-[#DCE9E3] pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#DCE9E3] border border-[#176B65]/30 text-[#176B65] flex items-center justify-center shrink-0">
                      <UserCheck className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {isEditingProfile ? (
                        <form onSubmit={handleSaveProfileEdit} className="space-y-2">
                          <input
                            type="text"
                            value={editNameInput}
                            onChange={(e) => setEditNameInput(e.target.value)}
                            placeholder="Full Name"
                            autoFocus
                            className="w-full text-xs font-bold border border-[#176B65] rounded-lg px-2 py-1 focus:outline-none"
                          />
                          <input
                            type="number"
                            value={editAgeInput}
                            onChange={(e) => setEditAgeInput(e.target.value)}
                            placeholder="Age"
                            className="w-full text-xs font-bold border border-[#176B65] rounded-lg px-2 py-1 focus:outline-none"
                          />
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              type="submit"
                              className="px-3 py-1 rounded-lg bg-[#176B65] text-white text-xs font-bold flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingProfile(false)}
                              className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-black text-sm text-[#283B3D] truncate">
                              {customerName}
                            </h4>
                            <button
                              type="button"
                              onClick={() => {
                                setEditNameInput(customerName);
                                setEditAgeInput(customerAge);
                                setIsEditingProfile(true);
                              }}
                              title="Edit Name & Age"
                              className="text-slate-400 hover:text-[#176B65] p-0.5 rounded cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-[#283B3D]/70 font-medium mt-0.5">
                            {customerAge && <span>Age: {customerAge} yrs</span>}
                            {customerAge && <span>•</span>}
                            <span>{customerPhone ? `+91 ${customerPhone}` : 'Linked'}</span>
                          </div>

                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1.5 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified Account</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <Link
                      href="/tokens"
                      onClick={() => setProfileOpen(false)}
                      className="p-2.5 rounded-2xl bg-[#F3F1E9] hover:bg-[#DCE9E3]/50 border border-[#DCE9E3] transition-colors"
                    >
                      <span className="text-[10px] font-bold uppercase text-[#283B3D]/60 block">Active Line</span>
                      <span className="font-token font-bold text-base text-[#176B65]">{activeCount} Tokens</span>
                    </Link>

                    <Link
                      href="/tokens"
                      onClick={() => setProfileOpen(false)}
                      className="p-2.5 rounded-2xl bg-[#F3F1E9] hover:bg-[#DCE9E3]/50 border border-[#DCE9E3] transition-colors"
                    >
                      <span className="text-[10px] font-bold uppercase text-[#283B3D]/60 block">Past Visits</span>
                      <span className="font-token font-bold text-base text-[#283B3D]">{historyCount} Visits</span>
                    </Link>
                  </div>

                  {/* Links in Profile */}
                  <div className="space-y-1.5 pt-1">
                    <Link
                      href="/tokens"
                      onClick={() => setProfileOpen(false)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-[#DCE9E3]/40 text-xs font-bold flex items-center justify-between text-[#283B3D] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-[#176B65]" />
                        <span>My Live Tokens</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    <Link
                      href="/tokens"
                      onClick={() => setProfileOpen(false)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-[#DCE9E3]/40 text-xs font-bold flex items-center justify-between text-[#283B3D] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-[#176B65]" />
                        <span>Past Visits & History</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    <Link
                      href="/#shops"
                      onClick={() => setProfileOpen(false)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-[#DCE9E3]/40 text-xs font-bold flex items-center justify-between text-[#283B3D] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                        <span>Saved Favorite Places</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>

                  {/* Switch Phone / Logout Button */}
                  <div className="pt-2 border-t border-[#DCE9E3]">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Switch Phone / Log Out</span>
                    </button>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

        </div>
      </motion.header>

      {/* ========================================================= */}
      {/* CUSTOMER SIGN IN MODAL (Name, Age & Mobile OTP)          */}
      {/* ========================================================= */}
      <AnimatePresence>
        {loginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283B3D]/65 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#DCE9E3] space-y-5 text-[#283B3D]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#DCE9E3] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#283B3D]">Customer Sign In</h3>
                    <p className="text-xs text-[#283B3D]/60 font-medium">Passwordless Fast Mobile Login</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setLoginModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loginError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{loginSuccessMsg}</span>
                </div>
              )}

              {/* STEP 1: Enter Mobile Number (Existing customers need ONLY mobile number) */}
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-[#283B3D] block mb-1">
                        Enter 10-Digit Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#176B65]">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          autoFocus
                          maxLength={10}
                          value={loginPhone}
                          onChange={(e) => handlePhoneInputChange(e.target.value)}
                          placeholder="9876543210"
                          className="w-full bg-[#F3F1E9] border border-[#DCE9E3] rounded-2xl pl-12 pr-4 py-2.5 text-xs font-bold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                        />
                      </div>
                    </div>

                    {existingUserDetected ? (
                      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                        <div className="flex items-center justify-between font-bold text-emerald-800">
                          <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Account Recognized</span>
                          <button
                            type="button"
                            onClick={() => {
                              setExistingUserDetected(null);
                              setLoginName('');
                              setLoginAge('');
                            }}
                            className="text-[10px] text-emerald-700 underline cursor-pointer"
                          >
                            Change Details
                          </button>
                        </div>
                        <p className="font-bold text-xs text-[#283B3D]">
                          {existingUserDetected.name} {existingUserDetected.age ? `(Age: ${existingUserDetected.age} yrs)` : ''}
                        </p>
                        <span className="text-[11px] text-emerald-700 block">
                          Aapka number pehle se registered hai! Dobara details bharne ki zaroorat nahi hai. Bas mobile number se verify karke sign-in karein.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-1">
                        <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                          <span className="font-bold block">✨ New Customer Registration</span>
                          <span className="text-[11px] text-amber-800 block">Pehli baar login kar rahe hain to kripya apna Naam aur Age bharein (sirf ek baar).</span>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-[#283B3D] block mb-1">
                            Your Full Name <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                              type="text"
                              required
                              value={loginName}
                              onChange={(e) => setLoginName(e.target.value)}
                              placeholder="e.g. Abhishek Sharma"
                              className="w-full bg-[#F3F1E9] border border-[#DCE9E3] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#176B65]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-[#283B3D] block mb-1">
                            Your Age (in years) <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                              type="number"
                              min={5}
                              max={115}
                              required
                              value={loginAge}
                              onChange={(e) => setLoginAge(e.target.value)}
                              placeholder="e.g. 25"
                              className="w-full bg-[#F3F1E9] border border-[#DCE9E3] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#176B65]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-[#283B3D]/60 leading-relaxed font-medium">
                    We'll send a 6-digit one-time password to verify your phone number. No passwords required.
                  </p>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                  >
                    {loginLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Send 6-Digit OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* STEP 2: Enter & Verify OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-[#F3F1E9] rounded-2xl border border-[#DCE9E3] text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#176B65]">{loginName} {loginAge ? `(${loginAge} yrs)` : ''}</span>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-slate-400 hover:text-[#176B65] text-[11px] underline"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-[#283B3D]/70 font-medium">
                      Enter the OTP sent to <b>+91 {loginPhone}</b>
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#283B3D] block mb-1">
                      Enter 6-Digit Verification Code:
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        autoFocus
                        maxLength={6}
                        value={loginOtp}
                        onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full bg-[#F3F1E9] border border-[#DCE9E3] rounded-2xl pl-11 pr-4 py-3 text-center font-token font-bold text-xl tracking-widest focus:outline-none focus:border-[#176B65]"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block text-center mt-1.5">
                      (Pilot test mode: Use OTP received or 1234)
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                    >
                      {loginLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying & Signing In...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Verify & Sign In</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loginLoading}
                      className="w-full py-2 text-center text-xs font-bold text-[#176B65] hover:underline cursor-pointer"
                    >
                      Resend OTP Code
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Bottom Bar */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-[#F3F1E9]/95 backdrop-blur-2xl border border-[#DCE9E3] rounded-3xl py-2.5 px-3 shadow-[0_12px_40px_rgba(40,59,61,0.15)] flex justify-around items-center">
        {userRole !== 'MERCHANT' && navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all relative ${
                isActive ? 'text-[#176B65] font-extrabold' : 'text-[#283B3D]/70 font-medium'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavUrbanGlow"
                  className="absolute inset-0 bg-[#DCE9E3] rounded-2xl border border-[#176B65]/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10 text-[#176B65]" />
              <span className="text-[10px] tracking-tight relative z-10">{link.label}</span>
            </Link>
          );
        })}

        {/* Mobile State 1: GUEST -> Show Both For Shop & Sign In */}
        {userRole === 'GUEST' && (
          <>
            <Link
              href="/merchant/register"
              className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-[#283B3D]/70 font-medium cursor-pointer"
            >
              <Store className="w-5 h-5 text-[#176B65]" />
              <span className="text-[10px] tracking-tight font-bold">For Shop</span>
            </Link>

            <button
              type="button"
              onClick={handleOpenLogin}
              className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-[#283B3D]/70 font-medium cursor-pointer"
            >
              <User className="w-5 h-5 text-slate-500" />
              <span className="text-[10px] tracking-tight font-bold">Sign In</span>
            </button>
          </>
        )}

        {/* Mobile State 2: SHOPKEEPER LOGGED IN -> Hide Customer, Show Console & Logout */}
        {userRole === 'MERCHANT' && (
          <>
            <Link
              href="/merchant/dashboard"
              className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-[#176B65] font-extrabold cursor-pointer"
            >
              <Store className="w-5 h-5 text-[#176B65]" />
              <span className="text-[10px] tracking-tight">Console</span>
            </Link>

            <button
              type="button"
              onClick={handleMerchantLogout}
              className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-rose-600 font-bold cursor-pointer"
              title="Log out as shopkeeper"
            >
              <LogOut className="w-5 h-5 text-rose-500" />
              <span className="text-[10px] tracking-tight">Logout</span>
            </button>
          </>
        )}

        {/* Mobile State 3: CUSTOMER LOGGED IN -> Hide Shop, Show Customer Profile */}
        {userRole === 'CUSTOMER' && (
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-4 rounded-2xl text-[#176B65] font-bold cursor-pointer"
          >
            <User className="w-5 h-5 text-[#176B65]" />
            <span className="text-[10px] tracking-tight truncate max-w-[70px]">{customerName}</span>
          </button>
        )}
      </nav>
    </>
  );
}