"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket, Clock, CheckCircle2, RefreshCw, Store, Users, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyTokensPage() {
  const [tokens, setTokens] = useState([
    {
      id: "tk-101",
      displayToken: "V-015",
      shopName: "Dr. Verma Dental & Oral Care Clinic",
      customerName: "Rahul Verma",
      groupSize: 2,
      peopleAhead: 1,
      estimatedWaitMin: 10,
      status: "ACTIVE",
    },
    {
      id: "tk-102",
      displayToken: "M-031",
      shopName: "Shree Krishna Medicos & Pharmacy",
      customerName: "Rahul Verma",
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
    }, 800);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-sky-600" />
            <span>My Active Queue Tokens</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Aapke live booking tokens, line position aur estimated arrival time
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/80 shadow-sm active:scale-95 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Live</span>
        </button>
      </div>

      {tokens.length === 0 ? (
        <div className="bg-white rounded-3xl border border-sky-100 p-8 sm:p-12 text-center space-y-4 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg">Koi Active Token Nahi Hai</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Aapne abhi kisi dukan ki line me token nahi liya hai. Apne aas-paas ki live dukaanein dekhein.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-black text-xs sm:text-sm shadow-md transition-all"
          >
            <Store className="w-4 h-4" />
            <span>Dukaanein Explore Karein</span>
          </Link>
        </div>
      ) : (
        /* Responsive Grid: 1 Col (Mobile) -> 2 Col (Tablet) -> 3 Col (Laptop/TV) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token) => (
            <motion.div
              key={token.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl border border-slate-200/80 hover:border-sky-300 p-6 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 transition-all space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                    {token.groupSize > 1 ? `Group (${token.groupSize} Persons)` : 'Single Ticket'}
                  </span>

                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {token.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight line-clamp-1">{token.shopName}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{token.customerName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-600 tracking-tight">
                      {token.displayToken}
                    </span>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Token #
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 grid grid-cols-2 gap-3 text-center border border-slate-100">
                  <div className="border-r border-slate-200/60">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block tracking-wider">
                      Aage Log
                    </span>
                    <span className="text-2xl font-black text-slate-900 mt-0.5 block">
                      {token.peopleAhead}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block tracking-wider">
                      Est. Wait
                    </span>
                    <span className="text-2xl font-black text-sky-600 mt-0.5 block">
                      {token.estimatedWaitMin} <span className="text-xs font-semibold">min</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
                {token.peopleAhead <= 1 ? (
                  <span className="text-amber-600">⚠️ Aapka number bas aane wala hai! Dukan par pahuchein.</span>
                ) : (
                  <span>Ghar par aaram se wait karein, notification aayegi.</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}

