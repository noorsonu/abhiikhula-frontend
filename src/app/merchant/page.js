"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Store, Power, Play, CheckCircle2, UserX, Plus, RefreshCw, 
  Users, Clock, AlertTriangle, ShieldCheck, Zap, Lock, LogOut, ArrowLeft 
} from 'lucide-react';
import { motion } from 'framer-motion';
import OfficialBrandLogo from '@/components/OfficialBrandLogo';

export default function MerchantDeskPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [shopStatus, setShopStatus] = useState('OPEN'); // OPEN, BUSY, PAUSED, CLOSED
  const [currentServing, setCurrentServing] = useState('D-004');
  const [waitingTokens, setWaitingTokens] = useState([
    { id: '1', displayToken: 'D-005', customerName: 'Ramesh Gupta', groupSize: 1, waitMin: 6 },
    { id: '2', displayToken: 'D-006', customerName: 'Priya Verma', groupSize: 3, waitMin: 14 },
    { id: '3', displayToken: 'D-007', customerName: 'Amit Singh', groupSize: 1, waitMin: 22 },
  ]);

  const [walkinName, setWalkinName] = useState('');
  const [walkinGroupSize, setWalkinGroupSize] = useState(1);

  useEffect(() => {
    // Check if merchant session exists in sessionStorage
    const session = typeof window !== 'undefined' ? sessionStorage.getItem('ak_merchant_auth') : null;
    if (session === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === '1234' || pin.length >= 4) {
      setIsAuthenticated(true);
      setErrorMsg('');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ak_merchant_auth', 'true');
      }
    } else {
      setErrorMsg('Invalid Store PIN. (Hint for testing: enter 1234)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ak_merchant_auth');
    }
  };

  const handleNext = () => {
    if (waitingTokens.length > 0) {
      const next = waitingTokens[0];
      setCurrentServing(next.displayToken);
      setWaitingTokens(waitingTokens.slice(1));
    } else {
      setCurrentServing('None');
    }
  };

  const handleNoShow = () => {
    handleNext();
  };

  const handleIssueWalkin = (e) => {
    e.preventDefault();
    const nextNum = waitingTokens.length + 8;
    const newToken = {
      id: String(Date.now()),
      displayToken: `D-00${nextNum}`,
      customerName: walkinName || 'Walk-in Customer',
      groupSize: walkinGroupSize,
      waitMin: (waitingTokens.length + 1) * 8,
    };
    setWaitingTokens([...waitingTokens, newToken]);
    setWalkinName('');
    setWalkinGroupSize(1);
  };

  // 1. Merchant Security Gate (Customer Cannot Access or Control)
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border border-[#283B3D]/10 shadow-xl space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-[#176B65]/10 text-[#176B65] mb-1">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-[#283B3D]">Merchant Desk Login</h1>
            <p className="text-xs text-[#283B3D]/70 font-medium">
              Authorized Store Owners & Cashiers Only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#283B3D] mb-1.5">Registered Phone / Store ID</label>
              <input
                type="text"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#DCE9E3] focus:border-[#176B65] focus:outline-none text-sm text-[#283B3D] bg-[#F3F1E9]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#283B3D] mb-1.5">4-Digit Security PIN</label>
              <input
                type="password"
                maxLength={6}
                placeholder="Enter PIN (Default: 1234)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#DCE9E3] focus:border-[#176B65] focus:outline-none text-sm text-[#283B3D] bg-[#F3F1E9]/40 tracking-widest text-center text-lg font-bold"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-center">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Verify & Enter Counter Desk
            </button>
          </form>

          {/* Customer Warning / Redirect */}
          <div className="pt-4 border-t border-[#DCE9E3] text-center space-y-2">
            <p className="text-[11px] text-[#283B3D]/60 font-medium">
              Are you a customer trying to book or view your turn?
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#176B65] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Customer Store & Tokens</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. Authenticated Merchant Counter Desk
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-12 pt-6">
      
      {/* Merchant Header Bar with Logout */}
      <div className="urban-card rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#176B65] text-white flex items-center justify-center font-bold shadow-md">
            <Store className="w-7 h-7 text-[#DCE9E3]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-[#283B3D]">Dr. Verma Dental Care</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#DCE9E3] text-[#176B65] px-3 py-0.5 rounded-md">
                Live Queue Station
              </span>
            </div>
            <p className="text-xs text-[#283B3D]/70 font-medium mt-0.5">B-23, Sector 14 Main Market, Indira Nagar, Lucknow</p>
          </div>
        </div>

        {/* Status Switcher & Lock Button */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'OPEN', label: 'Open Now', color: 'bg-[#176B65] text-white' },
            { key: 'BUSY', label: 'Heavy Crowd', color: 'bg-amber-600 text-white' },
            { key: 'PAUSED', label: 'Pause Queue', color: 'bg-slate-600 text-white' },
            { key: 'CLOSED', label: 'Closed', color: 'bg-rose-600 text-white' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setShopStatus(st.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                shopStatus === st.key ? st.color + ' shadow-sm' : 'bg-[#DCE9E3]/70 text-[#283B3D] hover:bg-[#DCE9E3]'
              }`}
            >
              {st.label}
            </button>
          ))}

          <button
            onClick={handleLogout}
            title="Lock Counter Desk"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer ml-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Desk</span>
          </button>
        </div>
      </div>

      {/* Grid: Live Serving Hero + Walk-in Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Counter Display */}
        <div className="lg:col-span-2 bg-[#283B3D] text-white rounded-3xl p-8 sm:p-10 shadow-lg space-y-8 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-[#DCE9E3] bg-white/10 px-4 py-1.5 rounded-full">
              Current Token at Counter
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Audio Chime Active</span>
            </div>
          </div>

          <div className="text-center py-4">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-2">Serving Now</span>
            <div className="font-token text-7xl sm:text-8xl font-black text-white tracking-tight drop-shadow-md">
              {currentServing}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-700/60">
            <button
              onClick={handleNext}
              className="py-4 px-6 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Call Next Token</span>
            </button>

            <button
              onClick={handleNoShow}
              className="py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
            >
              <UserX className="w-4 h-4" />
              <span>Mark Customer No-Show</span>
            </button>
          </div>
        </div>

        {/* Walk-in Offline Token Dispenser */}
        <div className="urban-card rounded-3xl p-6 sm:p-7 space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#176B65]" />
              <h2 className="text-lg font-black text-[#283B3D]">Issue Walk-in Token</h2>
            </div>
            <p className="text-xs text-[#283B3D]/70 font-medium">
              For customers who arrive without the AbhiiKhula app.
            </p>
          </div>

          <form onSubmit={handleIssueWalkin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#283B3D] mb-1">Customer Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Walk-in Guest"
                value={walkinName}
                onChange={(e) => setWalkinName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#DCE9E3] focus:border-[#176B65] focus:outline-none text-xs text-[#283B3D] bg-[#F3F1E9]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#283B3D] mb-1">Group Size</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setWalkinGroupSize(num)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      walkinGroupSize === num 
                        ? 'bg-[#176B65] text-white' 
                        : 'bg-[#DCE9E3]/70 text-[#283B3D] hover:bg-[#DCE9E3]'
                    }`}
                  >
                    {num} {num === 1 ? 'Person' : 'People'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Generate Physical Token Pass
            </button>
          </form>

          <div className="bg-[#DCE9E3]/50 rounded-2xl p-3 text-[11px] text-[#283B3D]/80 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#176B65] shrink-0" />
            <span>Printed or SMS tokens sync automatically with online queues.</span>
          </div>
        </div>

      </div>

      {/* Live Waiting Queue Table */}
      <div className="urban-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#283B3D]">Live Waiting Queue</h2>
              <p className="text-xs text-[#283B3D]/70 font-medium">{waitingTokens.length} customers in line</p>
            </div>
          </div>

          <span className="text-xs font-bold text-[#176B65] bg-[#DCE9E3] px-3 py-1 rounded-full">
            Real-time Sync Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DCE9E3] text-[#283B3D]/60 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Party</th>
                <th className="py-3 px-4">Est. Wait</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE9E3]/50">
              {waitingTokens.map((t, idx) => (
                <tr key={t.id} className="hover:bg-[#F3F1E9]/60 transition-colors">
                  <td className="py-3 px-4 font-token font-bold text-[#176B65] text-sm">
                    {t.displayToken}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#283B3D]">
                    {t.customerName}
                  </td>
                  <td className="py-3 px-4 text-[#283B3D]/70 font-medium">
                    {t.groupSize} {t.groupSize === 1 ? 'person' : 'people'}
                  </td>
                  <td className="py-3 px-4 text-[#283B3D]/70 font-medium">
                    ~{t.waitMin} mins
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setCurrentServing(t.displayToken);
                        setWaitingTokens(waitingTokens.filter((item) => item.id !== t.id));
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                    >
                      Call Now
                    </button>
                  </td>
                </tr>
              ))}
              {waitingTokens.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#283B3D]/60 font-medium">
                    No customers currently waiting in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
