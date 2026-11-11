"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Ticket, Clock, CheckCircle2, RefreshCw, Store, Users, 
  MapPin, Zap, XCircle, AlertCircle, Compass 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { queueApi } from '@/lib/api';

export default function MyTokensPage() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const loadTokens = async () => {
    try {
      let backendTokens = [];
      const token = typeof window !== 'undefined' ? localStorage.getItem('ak_token') : null;

      if (token) {
        try {
          const res = await queueApi.getMyActiveTokens();
          if (res?.data?.data && Array.isArray(res.data.data)) {
            backendTokens = res.data.data;
          }
        } catch (err) {
          console.warn('Backend active tokens fetch:', err);
        }
      }

      // Read locally stored customer tokens
      const localStr = typeof window !== 'undefined' ? localStorage.getItem('ak_customer_tokens') : null;
      const localTokens = localStr ? JSON.parse(localStr) : [];

      // Merge backend tokens with local tokens
      const mergedMap = new Map();
      backendTokens.forEach(t => mergedMap.set(String(t.id), t));
      localTokens.forEach(t => {
        if (!mergedMap.has(String(t.id))) {
          mergedMap.set(String(t.id), t);
        }
      });

      const combined = Array.from(mergedMap.values());
      // Filter out explicitly cancelled tokens
      setTokens(combined.filter(t => t.status !== 'CANCELLED'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTokens();
  };

  const handleCancelToken = async (tokenId) => {
    if (!window.confirm("Are you sure you want to cancel this queue token?")) return;

    try {
      setCancellingId(tokenId);
      try {
        await queueApi.cancelToken(tokenId, 'Cancelled by customer');
      } catch (err) {
        console.warn('Backend cancel failed, updating local state:', err);
      }

      // Update state and local storage
      const updated = tokens.filter(t => String(t.id) !== String(tokenId));
      setTokens(updated);

      if (typeof window !== 'undefined') {
        const localStr = localStorage.getItem('ak_customer_tokens');
        if (localStr) {
          const localTokens = JSON.parse(localStr);
          const updatedLocal = localTokens.filter(t => String(t.id) !== String(tokenId));
          localStorage.setItem('ak_customer_tokens', JSON.stringify(updatedLocal));
        }
      }
    } finally {
      setCancellingId(null);
    }
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
            Real-time synchronization with the counter desk. Track your turn and arrival estimates live.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#DCE9E3] shadow-xs text-xs font-bold text-[#176B65] hover:bg-[#DCE9E3]/40 transition-all self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#176B65] ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Syncing...' : 'Sync Live Status'}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#176B65] animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#283B3D]/70">Checking your active tokens...</p>
        </div>
      ) : tokens.length === 0 ? (
        <div className="urban-card rounded-3xl p-10 sm:p-14 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center mx-auto border border-[#DCE9E3]">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-black text-[#283B3D] text-lg">No Active Tokens Found</h3>
            <p className="text-xs sm:text-sm text-[#283B3D]/60 mt-1 max-w-sm mx-auto">
              You do not have any tokens in queue right now. Browse nearby places to skip physical waiting lines.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#176B65] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:bg-[#125550]"
          >
            <Compass className="w-4 h-4 text-[#DCE9E3]" />
            <span>Discover Nearby Places</span>
          </Link>
        </div>
      ) : (
        /* Responsive Grid of Active Tokens */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {tokens.map((token) => (
              <motion.div
                key={token.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="urban-card rounded-3xl p-6 shadow-sm transition-all space-y-5 flex flex-col justify-between border border-[#DCE9E3]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#176B65] bg-[#DCE9E3] px-3 py-1 rounded-lg">
                      {token.groupSize > 1 ? `Group (${token.groupSize} Persons)` : 'Single Ticket'}
                    </span>

                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>{token.status || 'ACTIVE'}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-[#283B3D] text-lg tracking-tight line-clamp-1">
                        {token.shopName || 'Partner Store'}
                      </h3>
                      <p className="text-xs text-[#283B3D]/60 font-semibold mt-0.5">
                        {token.customerName || 'Customer'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-token text-4xl font-bold text-[#176B65] tracking-tight">
                        {token.displayToken || `#${token.tokenNumber || '1'}`}
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
                        {token.peopleAhead ?? 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#283B3D]/50 text-[10px] uppercase font-bold block tracking-wider">
                        Est. Wait
                      </span>
                      <span className="font-token text-2xl font-bold text-[#176B65] mt-0.5 block">
                        {token.estimatedWaitMin ?? 5} <span className="text-xs font-semibold">min</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-[#DCE9E3] space-y-3">
                  <div className="text-xs font-bold">
                    {(token.peopleAhead ?? 0) <= 1 ? (
                      <span className="text-[#176B65] flex items-center gap-1.5 font-bold">
                        <Zap className="w-3.5 h-3.5 fill-[#176B65] shrink-0" />
                        <span>Your turn is very close! Please head to the counter.</span>
                      </span>
                    ) : (
                      <span className="text-[#283B3D]/70 font-medium">
                        Relax! We'll alert you as your turn approaches.
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleCancelToken(token.id)}
                    disabled={cancellingId === token.id}
                    className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{cancellingId === token.id ? 'Cancelling...' : 'Cancel This Token'}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
