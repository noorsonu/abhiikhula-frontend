"use client";

import React, { useState } from 'react';
import { 
  Store, Power, Play, CheckCircle2, UserX, Plus, RefreshCw, 
  Users, Clock, AlertTriangle, ShieldCheck, Zap 
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-12 pt-6">
      
      {/* Merchant Header Bar */}
      <div className="urban-card rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#176B65] text-white flex items-center justify-center font-bold shadow-md">
            <Store className="w-7 h-7 text-[#F2A15A]" />
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

        {/* Status Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'OPEN', label: 'Open Now', color: 'bg-[#176B65] text-white' },
            { key: 'BUSY', label: 'Heavy Crowd', color: 'bg-[#F2A15A] text-white' },
            { key: 'PAUSED', label: 'Pause Queue', color: 'bg-amber-600 text-white' },
            { key: 'CLOSED', label: 'Closed', color: 'bg-rose-600 text-white' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setShopStatus(st.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                shopStatus === st.key
                  ? `${st.color} shadow-sm font-extrabold ring-2 ring-[#283B3D]/20`
                  : 'bg-white text-[#283B3D] hover:bg-slate-50 border border-[#DCE9E3]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Serving Desk (Left) & Waiting Queue (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (7 Cols): Counter Action Deck */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Serving Desk Screen */}
          <div className="bg-[#283B3D] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-700/60 text-center space-y-6">
            <span className="text-xs uppercase font-bold tracking-widest text-[#DCE9E3]">
              Now Serving at Clinic / Counter
            </span>
            <div className="font-token text-7xl sm:text-8xl font-black tracking-tight text-[#F2A15A]">
              {currentServing}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-[#F2A15A]" />
                <span>Call Next Token</span>
              </button>

              <button
                onClick={handleNoShow}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/20 cursor-pointer"
              >
                <UserX className="w-5 h-5 text-rose-300" />
                <span>Mark No-Show</span>
              </button>
            </div>
          </div>

          {/* Issue Offline / Walk-in Token Card */}
          <div className="urban-card rounded-3xl p-6 sm:p-7 space-y-4">
            <div>
              <h2 className="text-xl font-black text-[#283B3D]">Walk-in Customer Offline Token</h2>
              <p className="text-xs text-[#283B3D]/70 mt-0.5">
                Issue a physical queue ticket for customers walking directly into the store without the app.
              </p>
            </div>

            <form onSubmit={handleIssueWalkin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Customer Name (Optional)"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="bg-[#F3F1E9] border border-[#DCE9E3] rounded-xl px-4 py-3 text-xs font-semibold text-[#283B3D] focus:outline-none focus:bg-white focus:border-[#176B65]"
                />

                <select
                  value={walkinGroupSize}
                  onChange={(e) => setWalkinGroupSize(Number(e.target.value))}
                  className="bg-[#F3F1E9] border border-[#DCE9E3] rounded-xl px-4 py-3 text-xs font-semibold text-[#283B3D] focus:outline-none focus:bg-white focus:border-[#176B65]"
                >
                  <option value={1}>1 Person</option>
                  <option value={2}>2 Persons (Group)</option>
                  <option value={3}>3 Persons (Group)</option>
                  <option value={4}>4 Persons (Group)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#F2A15A]" />
                <span>Print / Issue Walk-in Token</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Live Waiting Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE9E3] pb-3">
            <div>
              <h2 className="text-lg font-black text-[#283B3D]">Live Waiting Line</h2>
              <p className="text-xs text-[#283B3D]/70 font-medium">Total: {waitingTokens.length} customers in line</p>
            </div>
            <span className="text-xs font-bold text-[#176B65] bg-[#DCE9E3] px-3 py-1 rounded-lg">
              Live Station
            </span>
          </div>

          {waitingTokens.length === 0 ? (
            <div className="urban-card rounded-3xl p-10 text-center space-y-2">
              <p className="text-sm font-bold text-slate-800">Queue is Clear!</p>
              <p className="text-xs text-slate-400">All customers have been served.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitingTokens.map((t, index) => (
                <div
                  key={t.id}
                  className="bg-white border border-[#DCE9E3] rounded-2xl p-4 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-8 h-8 rounded-xl bg-[#F3F1E9] border border-[#DCE9E3] text-[#283B3D] flex items-center justify-center text-xs font-black">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-token text-base font-bold text-[#283B3D]">{t.displayToken}</span>
                        {t.groupSize > 1 && (
                          <span className="text-[10px] font-bold bg-[#DCE9E3] text-[#176B65] px-2 py-0.5 rounded">
                            {t.groupSize}P Group
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#283B3D]/60 mt-0.5">{t.customerName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-token text-xs font-bold text-[#176B65] block">~{t.waitMin} min</span>
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
