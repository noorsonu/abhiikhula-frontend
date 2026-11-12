"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Ticket, Clock, CheckCircle2, RefreshCw, Store, Users, 
  MapPin, Zap, XCircle, AlertCircle, Compass, Volume2, Radio, BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { queueApi } from '@/lib/api';
import { playChime } from '@/lib/audioChime';

export default function MyTokensPage() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [calledTokenAlert, setCalledTokenAlert] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const activeEventSources = useRef(new Map());

  // Load customer tokens from backend and localStorage
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
      const activeList = combined.filter(t => t.status !== 'CANCELLED');
      setTokens(activeList);
      return activeList;
    } catch (e) {
      console.error(e);
      return [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  // Real-Time SSE Stream Subscription for each active shop queue
  useEffect(() => {
    if (typeof window === 'undefined' || tokens.length === 0) return;

    // Collect unique shopIds from tokens
    const shopIds = [...new Set(tokens.map(t => t.shopId).filter(Boolean))];

    shopIds.forEach(shopId => {
      // If already subscribed, skip
      if (activeEventSources.current.has(shopId)) return;

      const sseUrl = `/api/shops/${shopId}/queue/stream`;
      try {
        const es = new EventSource(sseUrl);

        es.onopen = () => {
          setSseConnected(true);
        };

        const handleUpdate = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (!data) return;

            setTokens(prevTokens => {
              return prevTokens.map(tk => {
                if (tk.shopId === shopId || String(tk.shopId) === String(shopId)) {
                  const servingDisplay = data.currentServingDisplayToken;
                  const servingNum = data.currentServingTokenNumber || 0;
                  const myNum = tk.tokenNumber || 0;

                  const isMyTurnNow = (servingDisplay && servingDisplay === tk.displayToken) ||
                                     (servingNum > 0 && myNum > 0 && servingNum === myNum);

                  let newPeopleAhead = tk.peopleAhead;
                  if (myNum > 0 && servingNum > 0) {
                    newPeopleAhead = Math.max(0, myNum - servingNum);
                  } else if (data.waitingCount !== undefined) {
                    newPeopleAhead = Math.max(0, Math.min(tk.peopleAhead ?? 1, data.waitingCount));
                  }

                  // If customer's turn just arrived!
                  if (isMyTurnNow && tk.status !== 'CALLED' && tk.status !== 'SERVING') {
                    if (soundEnabled) {
                      playChime('turn');
                    }
                    setCalledTokenAlert({
                      tokenNumber: tk.displayToken,
                      shopName: data.shopName || tk.shopName
                    });
                    return {
                      ...tk,
                      status: 'CALLED',
                      peopleAhead: 0,
                      estimatedWaitMin: 0,
                      currentServing: servingDisplay
                    };
                  }

                  // If approaching next in line (1 ahead)
                  if (newPeopleAhead === 1 && tk.peopleAhead > 1) {
                    if (soundEnabled) {
                      playChime('reminder');
                    }
                  }

                  return {
                    ...tk,
                    peopleAhead: isMyTurnNow ? 0 : newPeopleAhead,
                    currentServing: servingDisplay || tk.currentServing,
                    estimatedWaitMin: isMyTurnNow ? 0 : Math.max(1, newPeopleAhead * 5)
                  };
                }
                return tk;
              });
            });
          } catch (err) {
            console.warn('Error processing SSE data:', err);
          }
        };

        es.addEventListener('INIT', handleUpdate);
        es.addEventListener('QUEUE_UPDATE', handleUpdate);
        es.onmessage = handleUpdate;

        es.onerror = () => {
          setSseConnected(false);
          es.close();
          activeEventSources.current.delete(shopId);
        };

        activeEventSources.current.set(shopId, es);
      } catch (err) {
        console.warn('EventSource connection error:', err);
      }
    });

    // Fallback periodic poll every 12 seconds in case SSE disconnects
    const pollInterval = setInterval(() => {
      loadTokens();
    }, 12000);

    return () => {
      clearInterval(pollInterval);
      activeEventSources.current.forEach(es => es.close());
      activeEventSources.current.clear();
    };
  }, [tokens.length, soundEnabled]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTokens();
  };

  const handleTestChime = () => {
    playChime('turn');
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
      
      {/* High-Impact Alert Banner When Customer's Turn is Called */}
      <AnimatePresence>
        {calledTokenAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-5 rounded-3xl bg-emerald-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-emerald-400"
          >
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <BellRing className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/25 px-2.5 py-0.5 rounded">
                  COUNTER CALL ALERT
                </span>
                <h3 className="text-lg font-black mt-0.5">
                  Token {calledTokenAlert.tokenNumber} is Being Served Right Now!
                </h3>
                <p className="text-xs text-emerald-100 font-medium">
                  Please proceed to the counter at {calledTokenAlert.shopName}.
                </p>
              </div>
            </div>

            <button
              onClick={() => setCalledTokenAlert(null)}
              className="px-5 py-2 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-sm hover:bg-emerald-50 transition-all cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE9E3] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#283B3D] tracking-tight flex items-center gap-3">
              <Ticket className="w-7 h-7 text-[#176B65]" />
              <span>My Active Queue Tokens</span>
            </h1>

            {/* Real-time SSE Live Indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <Radio className="w-3 h-3 text-emerald-600" />
              <span>Live SSE Sync</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#283B3D]/70 font-medium mt-1">
            Real-time synchronization with the store counter desk. Turn updates and sound alerts are active.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Test Button */}
          <button
            onClick={handleTestChime}
            title="Test Turn Audio Chime"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#DCE9E3] shadow-xs text-xs font-bold text-[#176B65] hover:bg-[#DCE9E3]/50 transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-[#176B65]" />
            <span className="hidden sm:inline">Test Chime</span>
          </button>

          {/* Sync / Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#DCE9E3] shadow-xs text-xs font-bold text-[#176B65] hover:bg-[#DCE9E3]/50 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#176B65] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#176B65] animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#283B3D]/70">Checking your live tokens from cloud...</p>
        </div>
      ) : tokens.length === 0 ? (
        <div className="urban-card rounded-3xl p-10 sm:p-14 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center mx-auto border border-[#DCE9E3]">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-black text-[#283B3D] text-lg">No Active Tokens Found</h3>
            <p className="text-xs sm:text-sm text-[#283B3D]/60 mt-1 max-w-sm mx-auto">
              You do not have any tokens in queue right now. Browse nearby places to get an instant digital pass.
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
            {tokens.map((token) => {
              const isServing = token.status === 'CALLED' || token.status === 'SERVING' || (token.peopleAhead === 0 && token.currentServing === token.displayToken);

              return (
                <motion.div
                  key={token.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`urban-card rounded-3xl p-6 shadow-sm transition-all space-y-5 flex flex-col justify-between border ${
                    isServing 
                      ? 'border-2 border-emerald-500 bg-emerald-50/20 shadow-lg' 
                      : 'border-[#DCE9E3]'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#176B65] bg-[#DCE9E3] px-3 py-1 rounded-lg">
                        {token.groupSize > 1 ? `Group (${token.groupSize} Persons)` : 'Single Ticket'}
                      </span>

                      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                        isServing
                          ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isServing ? 'bg-white' : 'bg-emerald-500'} animate-ping`}></span>
                        <span>{isServing ? 'SERVING NOW' : (token.status || 'ACTIVE')}</span>
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
                        <span className={`font-token text-4xl font-bold tracking-tight ${
                          isServing ? 'text-emerald-700' : 'text-[#176B65]'
                        }`}>
                          {token.displayToken || `#${token.tokenNumber || '1'}`}
                        </span>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Your Token
                        </span>
                      </div>
                    </div>

                    {/* Progress Metrics */}
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
                          {token.estimatedWaitMin ?? 0} <span className="text-xs font-semibold">min</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Note & Cancel Button */}
                  <div className="pt-3.5 border-t border-[#DCE9E3] space-y-3">
                    <div className="text-xs font-bold">
                      {isServing ? (
                        <span className="text-emerald-700 flex items-center gap-1.5 font-bold">
                          <BellRing className="w-4 h-4 text-emerald-600 animate-bounce" />
                          <span>It's your turn! Please step up to the service counter.</span>
                        </span>
                      ) : (token.peopleAhead ?? 0) <= 1 ? (
                        <span className="text-[#176B65] flex items-center gap-1.5 font-bold">
                          <Zap className="w-3.5 h-3.5 fill-[#176B65] shrink-0" />
                          <span>Your turn is very close! Please head to the counter.</span>
                        </span>
                      ) : (
                        <span className="text-[#283B3D]/70 font-medium">
                          Relax! Live updates & audio chime are active on this device.
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
              );
            })}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
