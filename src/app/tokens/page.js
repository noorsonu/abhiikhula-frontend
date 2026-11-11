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
    <div className="space-y-8 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Ticket className="w-7 h-7 text-[#0284c7]" />
            <span>My Active Queue Tokens</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Your live booking tokens, current line rank and real-time arrival estimates
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-700 hover:text-slate-900 transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#0284c7] ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </motion.button>
      </div>

      {tokens.length === 0 ? (
        <div className="modern-card rounded-3xl p-10 sm:p-14 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-200">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg">No Active Tokens Found</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              You haven't queued for any store yet. Browse nearby live stores to get instant tokens.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0f2744] text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Store className="w-4 h-4" />
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
              className="modern-card rounded-3xl p-6 shadow-sm transition-all space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    {token.groupSize > 1 ? `Group (${token.groupSize} Persons)` : 'Single Ticket'}
                  </span>

                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {token.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight line-clamp-1">{token.shopName}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{token.customerName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-[#0284c7] tracking-tight">
                      {token.displayToken}
                    </span>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Token #
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 grid grid-cols-2 gap-3 text-center border border-slate-200/80">
                  <div className="border-r border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block tracking-wider">
                      Ahead of You
                    </span>
                    <span className="text-2xl font-black text-slate-900 mt-0.5 block">
                      {token.peopleAhead}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block tracking-wider">
                      Est. Wait
                    </span>
                    <span className="text-2xl font-black text-[#0284c7] mt-0.5 block">
                      {token.estimatedWaitMin} <span className="text-xs font-semibold">min</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 border-t border-slate-100 text-xs font-bold">
                {token.peopleAhead <= 1 ? (
                  <span className="text-amber-700 flex items-center gap-1.5 font-black">
                    <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                    <span>Your turn is very close! Please arrive at the store.</span>
                  </span>
                ) : (
                  <span className="text-slate-500">Relax at home; we'll notify you as your turn approaches.</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}
