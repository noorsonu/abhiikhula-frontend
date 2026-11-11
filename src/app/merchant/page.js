"use client";

import React, { useState } from 'react';
import { 
  Store, Power, Play, CheckCircle2, UserX, Plus, RefreshCw, 
  Users, Clock, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MerchantDeskPage() {
  const [shopStatus, setShopStatus] = useState('OPEN'); // OPEN, BUSY, PAUSED, CLOSED
  const [currentServing, setCurrentServing] = useState('D-004');
  const [waitingTokens, setWaitingTokens] = useState([
    { id: '1', displayToken: 'D-005', customerName: 'Ramesh Gupta', groupSize: 1, waitMin: 6 },
    { id: '2', displayToken: 'D-006', customerName: 'Priya Verma', groupSize: 3, waitMin: 14 },
    { id: '3', displayToken: 'D-007', customerName: 'Amit Singh', groupSize: 1, waitMin: 22 },
  ]);

  // Offline walk-in token state
  const [walkinName, setWalkinName] = useState('');
  const [walkinGroupSize, setWalkinGroupSize] = useState(1);

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

  return (
    <div className="space-y-6 pb-12">
      
      {/* Merchant Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-sky-100 p-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md shadow-sky-500/20">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Dr. Verma Dental Care</h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-md border border-sky-200">
                Merchant Live Desk
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">B-23, Sector 14 Main Market, Indira Nagar</p>
          </div>
        </div>

        {/* Live Status Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'OPEN', label: 'Khula Hai', color: 'bg-emerald-600 text-white' },
            { key: 'BUSY', label: 'Bheed Hai', color: 'bg-amber-600 text-white' },
            { key: 'PAUSED', label: 'Pause Line', color: 'bg-orange-600 text-white' },
            { key: 'CLOSED', label: 'Band Hai', color: 'bg-rose-600 text-white' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setShopStatus(st.key)}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black transition-all ${
                shopStatus === st.key
                  ? `${st.color} shadow-sm ring-2 ring-slate-900/10`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Serving Desk (Left) & Waiting Queue (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column (7 Cols): Counter Action Deck */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Serving Desk Screen */}
          <div className="bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-sky-800/40 text-center space-y-6">
            <span className="text-xs uppercase font-black tracking-widest text-sky-400">
              Now Serving at Clinic / Counter
            </span>
            <div className="text-6xl sm:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-cyan-300">
              {currentServing}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-300 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-sky-500/20 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Call Next Token</span>
              </button>

              <button
                onClick={handleNoShow}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-rose-300 font-bold text-sm transition-all active:scale-95 border border-white/10"
              >
                <UserX className="w-5 h-5" />
                <span>Mark No-Show</span>
              </button>
            </div>
          </div>

          {/* Issue Offline / Walk-in Token Card */}
          <div className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-7 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Walk-in Customer Token</h2>
              <p className="text-xs text-slate-500">
                Jo customer seedha dukan par bina app ke aaye, unhe physical queue token issue karein.
              </p>
            </div>

            <form onSubmit={handleIssueWalkin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Customer Naam (Optional)"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                />

                <select
                  value={walkinGroupSize}
                  onChange={(e) => setWalkinGroupSize(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:bg-white focus:outline-none"
                >
                  <option value={1}>1 Person</option>
                  <option value={2}>2 Persons (Group)</option>
                  <option value={3}>3 Persons (Group)</option>
                  <option value={4}>4 Persons (Group)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Issue Walk-in Token</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Column (5 Cols): Live Waiting Line */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">Waiting Line</h2>
              <p className="text-xs text-slate-500 font-medium">Total: {waitingTokens.length} log line me hain</p>
            </div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
              Live Feed
            </span>
          </div>

          {waitingTokens.length === 0 ? (
            <div className="bg-white rounded-3xl border border-sky-100 p-8 text-center space-y-2">
              <p className="text-sm font-bold text-slate-800">Queue Khali Hai!</p>
              <p className="text-xs text-slate-400">Sabhi customers attend ho chuke hain.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitingTokens.map((t, index) => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center text-xs font-black">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black text-slate-900">{t.displayToken}</span>
                        {t.groupSize > 1 && (
                          <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded border border-sky-100">
                            {t.groupSize}P
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-500">{t.customerName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 block">~{t.waitMin} min</span>
                    <span className="text-[10px] text-slate-400 font-medium">Est. Wait</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

