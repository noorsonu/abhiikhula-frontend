"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket, Clock, CheckCircle2, RefreshCw, Store, Users, MapPin, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyTokensPage() {
  const [tokens, setTokens] = useState([
    {
      id: "tk-101",
      displayToken: "V-015",
      shopName: "Dr. Verma Dental & Oral Care Clinic",
      customerName: "Alex Morgan",
      groupSize: 2,
      peopleAhead: 1,
      estimatedWaitMin: 10,
      status: "ACTIVE",
    },
    {
      id: "tk-102",
      displayToken: "M-031",
      shopName: "Shree Krishna Medicos & Healthcare",
      customerName: "Alex Morgan",
      groupSize: 1,
      peopleAhead: 4,
      estimatedWaitMin: 14,
      status: "ACTIVE",
    }
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-12 pt-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE9E3] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#283B3D] tracking-tight flex items-center gap-3">
            <Ticket className="w-7 h-7 text-[#176B65]" />
            <span>My Active Queue Tokens</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#283B3D]/70 font-medium mt-1">
            Your live booking tokens, current line rank and real-time arrival estimates
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#DCE9E3] shadow-xs text-xs font-bold text-[#176B65] hover:bg-[#DCE9E3]/40 transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#176B65] ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {tokens.length === 0 ? (
        <div className="urban-card rounded-3xl p-10 sm:p-14 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center mx-auto border border-[#DCE9E3]">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-black text-[#283B3D] text-lg">No Active Tokens Found</h3>
            <p className="text-xs sm:text-sm text-[#283B3D]/60 mt-1 max-w-sm mx-auto">
              You haven't queued for any store yet. Browse nearby live stores to get instant tokens.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#176B65] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Store className="w-4 h-4 text-[#F2A15A]" />
            <span>Discover Stores</span>
          </Link>
        </div>
      ) : (
        /* Responsive Grid: 1 Col (Mobile) -> 2 Col (Tablet) -> 3 Col (Laptop/TV) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token) => (
            <motion.div
              key={token.id}
              whileHover={{ y: -5 }}
              className="urban-card rounded-3xl p-6 shadow-sm transition-all space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#176B65] bg-[#DCE9E3] px-3 py-1 rounded-lg">
                    {token.groupSize > 1 ? `Group (${token.groupSize} Persons)` : 'Single Ticket'}
                  </span>

                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {token.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-[#283B3D] text-lg tracking-tight line-clamp-1">{token.shopName}</h3>
                    <p className="text-xs text-[#283B3D]/60 font-semibold mt-0.5">{token.customerName}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-token text-4xl font-bold text-[#176B65] tracking-tight">
                      {token.displayToken}
                    </span>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Token #
                    </span>
                  </div>
                </div>

                <div className="bg-[#F3F1E9] rounded-2xl p-4 grid grid-cols-2 gap-3 text-center border border-[#DCE9E3]">
                  <div className="border-r border-[#DCE9E3]">
                    <span className="text-[#283B3D]/50 text-[10px] uppercase font-bold block tracking-wider">
                      Ahead of You
                    </span>
                    <span className="font-token text-2xl font-bold text-[#283B3D] mt-0.5 block">
                      {token.peopleAhead}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#283B3D]/50 text-[10px] uppercase font-bold block tracking-wider">
                      Est. Wait
                    </span>
                    <span className="font-token text-2xl font-bold text-[#F2A15A] mt-0.5 block">
                      {token.estimatedWaitMin} <span className="text-xs font-semibold">min</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 border-t border-[#DCE9E3] text-xs font-bold">
                {token.peopleAhead <= 1 ? (
                  <span className="text-[#F2A15A] flex items-center gap-1.5 font-bold">
                    <Zap className="w-3.5 h-3.5 fill-[#F2A15A] shrink-0" />
                    <span>Your turn is very close! Please arrive at the store.</span>
                  </span>
                ) : (
                  <span className="text-[#283B3D]/70">Relax at home; we'll notify you as your turn approaches.</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}
