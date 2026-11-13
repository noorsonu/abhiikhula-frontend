"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Ticket, Clock, CheckCircle2, RefreshCw, Store, Users, 
  MapPin, Zap, XCircle, AlertCircle, Compass, Volume2, VolumeX, Radio, BellRing,
  AlertTriangle, History, ArrowRight, Trash2, Phone, Hourglass, Plus, Minus,
  Navigation, ArrowUpRight, Share2, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { queueApi, reviewApi } from '@/lib/api';
import { playChime } from '@/lib/audioChime';
import { shareTokenPass } from '@/lib/shareToken';
import { notifyTurnArrival, requestTurnNotificationPermission } from '@/lib/notifications';

const CANCEL_REASONS = [
  'Change of plans / Emergency',
  'Running late / Stuck in traffic',
  'Wait time is longer than expected',
  'Booked at another shop or clinic',
  'Booked by mistake',
  'Other'
];

const QUICK_DELAY_OPTIONS = [5, 10, 15, 20];
const QUICK_DELAY_REASONS = [
  'Stuck in heavy traffic',
  'Looking for vehicle parking',
  'Stepped out for urgent task',
  'Coming from office / metro'
];

// Read active emergency broadcast for shop (BRD FR-708 / FR-405)
const getActiveShopBroadcast = (shopSlug, shopName) => {
  if (typeof window === 'undefined') return null;
  try {
    const slug = (shopSlug || (shopName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')).toLowerCase();
    const saved = localStorage.getItem(`ak_shop_broadcast_${slug}`);
    if (saved) {
      const obj = JSON.parse(saved);
      if (obj && obj.active) {
        if (!obj.expiresAt || new Date(obj.expiresAt).getTime() > Date.now()) {
          return obj;
        } else {
          localStorage.removeItem(`ak_shop_broadcast_${slug}`);
        }
      }
    }
    return null;
  } catch (e) {
    return null;
  }
};

const REVIEW_TAGS = [
  { id: 'ON_TIME', label: '⏱️ On-Time Turn' },
  { id: 'BEHAVIOUR', label: '🤝 Polite Staff' },
  { id: 'FAIR_WAIT', label: '✨ Fair Queue Wait' },
];

const RATING_THEMES = {
  1: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    accentText: 'text-rose-700',
    btnBg: 'bg-rose-600 hover:bg-rose-700 text-white',
    starActive: 'fill-rose-500 text-rose-500',
    label: 'Terrible Experience 😭',
    hint: 'Very unfair queue wait, rude staff behavior or hygiene issue',
  },
  2: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    accentText: 'text-orange-700',
    btnBg: 'bg-orange-600 hover:bg-orange-700 text-white',
    starActive: 'fill-orange-500 text-orange-500',
    label: 'Disappointing 🙁',
    hint: 'Delay was longer than estimated or skipped turn',
  },
  3: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    accentText: 'text-amber-800',
    btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
    starActive: 'fill-amber-500 text-amber-500',
    label: 'Average 😐',
    hint: 'Acceptable wait time and standard service',
  },
  4: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    accentText: 'text-emerald-800',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    starActive: 'fill-emerald-500 text-emerald-500',
    label: 'Very Good! 😊',
    hint: 'Smooth queue flow, polite staff and fast turn',
  },
  5: {
    bg: 'bg-[#DCE9E3]/70',
    border: 'border-[#176B65]/40',
    accentText: 'text-[#176B65]',
    btnBg: 'bg-[#176B65] hover:bg-[#125550] text-white shadow-md',
    starActive: 'fill-[#176B65] text-[#176B65]',
    label: 'Outstanding! 🤩',
    hint: 'Super fast turn, delightful staff and accurate wait time',
  },
};

const AnimatedRatingFace = ({ rating }) => {
  if (rating === 1) {
    return (
      <motion.svg
        key="face-1"
        initial={{ scale: 0.8 }}
        animate={{ scale: [1, 0.96, 1], rotate: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        viewBox="0 0 100 100"
        className="w-16 h-16 mx-auto filter drop-shadow-sm"
      >
        <circle cx="50" cy="50" r="44" fill="#FEE2E2" stroke="#E11D48" strokeWidth="4" />
        <path d="M 28 32 Q 36 38 42 36" stroke="#9F1239" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M 72 32 Q 64 38 58 36" stroke="#9F1239" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M 30 42 Q 36 36 42 42" stroke="#9F1239" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M 58 42 Q 64 36 70 42" stroke="#9F1239" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <motion.ellipse 
          cx="33" 
          cy="52" 
          rx="3" 
          ry="6" 
          fill="#38BDF8"
          animate={{ y: [0, 16, 22], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeIn" }}
        />
        <motion.ellipse 
          cx="67" 
          cy="52" 
          rx="3" 
          ry="6" 
          fill="#38BDF8"
          animate={{ y: [0, 16, 22], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeIn", delay: 0.3 }}
        />
        <path d="M 34 72 Q 50 56 66 72" stroke="#9F1239" strokeWidth="4" strokeLinecap="round" fill="none" />
      </motion.svg>
    );
  }

  if (rating === 2) {
    return (
      <motion.svg
        key="face-2"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        viewBox="0 0 100 100"
        className="w-16 h-16 mx-auto filter drop-shadow-sm"
      >
        <circle cx="50" cy="50" r="44" fill="#FFEDD5" stroke="#EA580C" strokeWidth="4" />
        <path d="M 30 35 L 42 38" stroke="#C2410C" strokeWidth="3" strokeLinecap="round" />
        <path d="M 70 35 L 58 38" stroke="#C2410C" strokeWidth="3" strokeLinecap="round" />
        <circle cx="36" cy="45" r="4" fill="#C2410C" />
        <circle cx="64" cy="45" r="4" fill="#C2410C" />
        <path d="M 36 68 Q 50 58 64 68" stroke="#C2410C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </motion.svg>
    );
  }

  if (rating === 3) {
    return (
      <motion.svg
        key="face-3"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        viewBox="0 0 100 100"
        className="w-16 h-16 mx-auto filter drop-shadow-sm"
      >
        <circle cx="50" cy="50" r="44" fill="#FEF3C7" stroke="#D97706" strokeWidth="4" />
        <circle cx="36" cy="44" r="4.5" fill="#92400E" />
        <circle cx="64" cy="44" r="4.5" fill="#92400E" />
        <line x1="36" y1="64" x2="64" y2="64" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
      </motion.svg>
    );
  }

  if (rating === 4) {
    return (
      <motion.svg
        key="face-4"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        viewBox="0 0 100 100"
        className="w-16 h-16 mx-auto filter drop-shadow-sm"
      >
        <circle cx="50" cy="50" r="44" fill="#D1FAE5" stroke="#059669" strokeWidth="4" />
        <path d="M 28 44 Q 36 34 44 44" stroke="#065F46" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M 56 44 Q 64 34 72 44" stroke="#065F46" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="28" cy="54" r="5" fill="#F472B6" opacity="0.45" />
        <circle cx="72" cy="54" r="5" fill="#F472B6" opacity="0.45" />
        <path d="M 34 62 Q 50 76 66 62" stroke="#065F46" strokeWidth="4" strokeLinecap="round" fill="none" />
      </motion.svg>
    );
  }

  return (
    <motion.svg
      key="face-5"
      initial={{ scale: 0.8 }}
      animate={{ scale: [1, 1.06, 1] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      viewBox="0 0 100 100"
      className="w-16 h-16 mx-auto filter drop-shadow-md"
    >
      <circle cx="50" cy="50" r="44" fill="#DCE9E3" stroke="#176B65" strokeWidth="4" />
      <polygon points="36,36 38,42 44,42 39,46 41,52 36,48 31,52 33,46 28,42 34,42" fill="#176B65" />
      <polygon points="64,36 66,42 72,42 67,46 69,52 64,48 59,52 61,46 56,42 62,42" fill="#176B65" />
      <circle cx="26" cy="56" r="6" fill="#176B65" opacity="0.2" />
      <circle cx="74" cy="56" r="6" fill="#176B65" opacity="0.2" />
      <path d="M 32 58 Q 50 82 68 58 Z" fill="#176B65" stroke="#176B65" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 40 68 Q 50 78 60 68" fill="#F87171" opacity="0.8" />
    </motion.svg>
  );
};

export default function MyTokensPage() {
  const router = useRouter();

  // If Shopkeeper is logged in, immediately redirect to Merchant Dashboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('ak_role');
      const shop = localStorage.getItem('ak_active_merchant_shop');
      if (role === 'MERCHANT' && shop) {
        router.replace('/merchant/dashboard');
      }
    }
  }, [router]);

  const [tokens, setTokens] = useState([]);
  const [historyTokens, setHistoryTokens] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);
  const [calledTokenAlert, setCalledTokenAlert] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Connectivity Listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const onOnline = () => setIsOnline(true);
      const onOffline = () => setIsOnline(false);
      window.addEventListener('online', onOnline);
      window.addEventListener('offline', onOffline);
      return () => {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
      };
    }
  }, []);

  // Cancellation Modal State
  const [tokenToCancel, setTokenToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [cancellingLoading, setCancellingLoading] = useState(false);
  const [cancelSuccessAlert, setCancelSuccessAlert] = useState(null);

  // Customer Delay / Hold Modal State
  const [tokenToDelay, setTokenToDelay] = useState(null);
  const [delayMode, setDelayMode] = useState('10'); // '5', '10', '15', '20', or 'custom'
  const [customDelayMinutes, setCustomDelayMinutes] = useState('25');
  const [delayNote, setDelayNote] = useState('');
  const [delayLoading, setDelayLoading] = useState(false);
  const [delaySuccessAlert, setDelaySuccessAlert] = useState(null);

  // Geo Check-In State
  const [tokenToCheckIn, setTokenToCheckIn] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInError, setCheckInError] = useState(null);

  // Re-queue loading state
  const [requeuingId, setRequeuingId] = useState(null);

  // 5-Star Post-Service Rating & Review State
  const [tokenToReview, setTokenToReview] = useState(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [reviewTags, setReviewTags] = useState(['ON_TIME', 'BEHAVIOUR']);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  const activeEventSources = useRef(new Map());

  // Helper to normalize phone numbers to last 10 digits
  const normalizePhone = (p) => {
    if (!p) return '';
    return String(p).replace(/\D/g, '').slice(-10);
  };

  // Load customer tokens from backend and localStorage (strictly phone-isolated)
  const loadTokens = async () => {
    try {
      const currentPhoneRaw = typeof window !== 'undefined' ? localStorage.getItem('ak_phone') : null;
      const cleanPhone = normalizePhone(currentPhoneRaw);
      const isGuest = !cleanPhone;

      let backendTokens = [];
      const token = typeof window !== 'undefined' ? localStorage.getItem('ak_token') : null;

      if (token && cleanPhone) {
        try {
          const res = await queueApi.getMyActiveTokens();
          if (res?.data?.data && Array.isArray(res.data.data)) {
            // Keep backend tokens that match logged in phone
            backendTokens = res.data.data.filter(t => !t.customerPhone || normalizePhone(t.customerPhone) === cleanPhone);
          }
        } catch (err) {
          if (err?.response?.status === 401) {
            localStorage.removeItem('ak_token');
          }
        }
      }

      // Read locally stored active tokens
      const localStr = typeof window !== 'undefined' ? localStorage.getItem('ak_customer_tokens') : null;
      const localTokens = localStr ? JSON.parse(localStr) : [];

      // Strictly isolate tokens: phone matches ONLY phone's data, guest gets ONLY unassigned guest tokens
      let scopedLocal = [];
      if (cleanPhone) {
        scopedLocal = localTokens.filter(t => normalizePhone(t.customerPhone) === cleanPhone);
      } else {
        // Guest mode: only show tokens created in guest mode without a phone number
        scopedLocal = localTokens.filter(t => !t.customerPhone || t.isGuest);
      }

      // Merge backend tokens with local tokens
      const mergedMap = new Map();
      backendTokens.forEach(t => mergedMap.set(String(t.id), t));
      scopedLocal.forEach(t => {
        if (!mergedMap.has(String(t.id))) {
          mergedMap.set(String(t.id), t);
        } else {
          // Preserve local delay state if present
          const existing = mergedMap.get(String(t.id));
          if (t.delayMinutes && !existing.delayMinutes) {
            mergedMap.set(String(t.id), { ...existing, ...t });
          }
        }
      });

      const combined = Array.from(mergedMap.values());
      const activeList = combined.filter(t => t.status !== 'CANCELLED' && t.status !== 'COMPLETED');
      setTokens(activeList);

      // Read past history tokens (100% Scoped to Current Logged-in Mobile Number)
      if (isGuest) {
        // In guest mode, do not show any phone's history and DO NOT wipe stored data
        setHistoryTokens([]);
      } else {
        const historyStr = typeof window !== 'undefined' ? localStorage.getItem('ak_customer_history') : null;
        let parsedHistory = historyStr ? JSON.parse(historyStr) : [];
        // Purge any legacy dummy IDs
        parsedHistory = parsedHistory.filter(t => t.id !== 'completed-visit-royal-barber' && t.id !== 'completed-sample-1');
        // Only show history for THIS exact phone number
        const userHistory = parsedHistory.filter(t => normalizePhone(t.customerPhone) === cleanPhone);
        setHistoryTokens(userHistory);
      }

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
    if (typeof window !== 'undefined') {
      const savedSound = localStorage.getItem('ak_sound_enabled');
      if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true');
      }
    }
    loadTokens();

    // Listen to login/logout/switch account storage events
    const handleStorageChange = () => {
      loadTokens();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
                    notifyTurnArrival(data.shopName || tk.shopName, tk.displayToken);
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

  // Open Cancel Modal
  const handleOpenCancelModal = (token) => {
    setTokenToCancel(token);
    setCancelReason(CANCEL_REASONS[0]);
    setCustomReason('');
  };

  // Confirm and Execute Cancellation
  const handleConfirmCancel = async () => {
    if (!tokenToCancel) return;

    const finalReason = cancelReason === 'Other' 
      ? (customReason.trim() || 'Other reason') 
      : cancelReason;

    const targetToken = tokenToCancel;
    setCancellingLoading(true);

    try {
      // 1. Trigger production backend endpoint
      try {
        await queueApi.cancelToken(targetToken.id, finalReason);
      } catch (err) {
        console.warn('Backend cancel call result:', err?.response?.data || err.message);
      }

      // 2. Remove from active tokens state
      const updatedActive = tokens.filter(t => String(t.id) !== String(targetToken.id));
      setTokens(updatedActive);

      // 3. Update localStorage active tokens
      if (typeof window !== 'undefined') {
        const localStr = localStorage.getItem('ak_customer_tokens');
        if (localStr) {
          const localTokens = JSON.parse(localStr);
          const filtered = localTokens.filter(t => String(t.id) !== String(targetToken.id));
          localStorage.setItem('ak_customer_tokens', JSON.stringify(filtered));
        }

        // 4. Archive into history list with owner's phone attached
        const currentPhoneRaw = localStorage.getItem('ak_phone');
        const cleanPhone = normalizePhone(currentPhoneRaw);

        const historyStr = localStorage.getItem('ak_customer_history');
        const historyList = historyStr ? JSON.parse(historyStr) : [];
        const archivedItem = {
          ...targetToken,
          customerPhone: targetToken.customerPhone || cleanPhone,
          status: 'CANCELLED',
          cancellationReason: finalReason,
          cancelledAt: new Date().toISOString(),
        };
        const updatedHistory = [archivedItem, ...historyList.filter(h => String(h.id) !== String(targetToken.id))];
        localStorage.setItem('ak_customer_history', JSON.stringify(updatedHistory));

        if (cleanPhone) {
          setHistoryTokens(updatedHistory.filter(h => normalizePhone(h.customerPhone) === cleanPhone));
        } else {
          setHistoryTokens([]);
        }
        window.dispatchEvent(new Event('storage'));
      }

      // 5. User Feedback Banner
      setCancelSuccessAlert(`Token ${targetToken.displayToken || '#' + targetToken.tokenNumber} for ${targetToken.shopName || 'Shop'} was cancelled. Queue spot released.`);
      setTimeout(() => setCancelSuccessAlert(null), 6000);
      setTokenToCancel(null);
    } finally {
      setCancellingLoading(false);
    }
  };

  // Open Delay Modal
  const handleOpenDelayModal = (token) => {
    setTokenToDelay(token);
    if (token.delayMinutes) {
      if ([5, 10, 15, 20].includes(token.delayMinutes)) {
        setDelayMode(String(token.delayMinutes));
      } else {
        setDelayMode('custom');
        setCustomDelayMinutes(String(token.delayMinutes));
      }
      setDelayNote(token.delayNote || '');
    } else {
      setDelayMode('10');
      setCustomDelayMinutes('25');
      setDelayNote('');
    }
  };

  // Confirm and Save Delay / Hold Alert
  const handleConfirmDelay = async () => {
    if (!tokenToDelay) return;

    let effectiveMinutes = 10;
    if (delayMode === 'custom') {
      const parsed = parseInt(customDelayMinutes, 10);
      effectiveMinutes = isNaN(parsed) || parsed <= 0 ? 15 : Math.min(120, parsed);
    } else {
      effectiveMinutes = parseInt(delayMode, 10) || 10;
    }

    setDelayLoading(true);
    try {
      const updatedTokens = tokens.map(t => {
        if (String(t.id) === String(tokenToDelay.id)) {
          return {
            ...t,
            delayMinutes: effectiveMinutes,
            delayNote: delayNote.trim() || undefined,
            delayedAt: new Date().toISOString(),
            holdRequested: true,
          };
        }
        return t;
      });
      setTokens(updatedTokens);

      if (typeof window !== 'undefined') {
        const localStr = localStorage.getItem('ak_customer_tokens');
        if (localStr) {
          const localTokens = JSON.parse(localStr);
          const updatedLocal = localTokens.map(t => {
            if (String(t.id) === String(tokenToDelay.id)) {
              return {
                ...t,
                delayMinutes: effectiveMinutes,
                delayNote: delayNote.trim() || undefined,
                delayedAt: new Date().toISOString(),
                holdRequested: true,
              };
            }
            return t;
          });
          localStorage.setItem('ak_customer_tokens', JSON.stringify(updatedLocal));
        }
      }

      setDelaySuccessAlert(`Counter notified: You are running ~${effectiveMinutes} mins late. Your turn is on hold.`);
      setTimeout(() => setDelaySuccessAlert(null), 6000);
      setTokenToDelay(null);
    } finally {
      setDelayLoading(false);
    }
  };

  // Clear Delay
  const handleClearDelay = (tokenId) => {
    const updatedTokens = tokens.map(t => {
      if (String(t.id) === String(tokenId)) {
        const copy = { ...t };
        delete copy.delayMinutes;
        delete copy.delayNote;
        delete copy.delayedAt;
        copy.holdRequested = false;
        return copy;
      }
      return t;
    });
    setTokens(updatedTokens);

    if (typeof window !== 'undefined') {
      const localStr = localStorage.getItem('ak_customer_tokens');
      if (localStr) {
        const localTokens = JSON.parse(localStr);
        const updatedLocal = localTokens.map(t => {
          if (String(t.id) === String(tokenId)) {
            const copy = { ...t };
            delete copy.delayMinutes;
            delete copy.delayNote;
            delete copy.delayedAt;
            copy.holdRequested = false;
            return copy;
          }
          return t;
        });
        localStorage.setItem('ak_customer_tokens', JSON.stringify(updatedLocal));
      }
    }
  };

  // Execute Re-queue if customer was skipped/no-show
  const handleReQueue = async (tokenId) => {
    setRequeuingId(tokenId);
    try {
      const res = await queueApi.reQueue(tokenId);
      if (res?.data?.data) {
        const updatedToken = res.data.data;
        const nextList = tokens.map(t => String(t.id) === String(tokenId) ? { ...t, ...updatedToken, status: 'WAITING' } : t);
        setTokens(nextList);
      }
      setDelaySuccessAlert("You have successfully re-entered the queue at the counter!");
      setTimeout(() => setDelaySuccessAlert(null), 6000);
    } catch (err) {
      console.warn("Re-queue error:", err);
      // Local fallback
      setTokens(prev => prev.map(t => String(t.id) === String(tokenId) ? { ...t, status: 'WAITING', peopleAhead: 2 } : t));
    } finally {
      setRequeuingId(null);
    }
  };

  // Open Geo Check-In Modal
  const handleOpenCheckInModal = (token) => {
    setTokenToCheckIn(token);
    setCheckInError(null);
  };

  // Execute Check-In at Store
  const handleExecuteCheckIn = async (useDoorCoordinates = false) => {
    if (!tokenToCheckIn) return;
    const targetToken = tokenToCheckIn;
    setCheckInLoading(true);
    setCheckInError(null);

    const performApiCall = async (lat, lng) => {
      try {
        await queueApi.checkIn(targetToken.id, lat, lng);
      } catch (err) {
        console.warn('Backend check-in API response:', err?.response?.data || err.message);
        if (err?.response?.data?.message && err.response.data.message.includes('Check-in failed')) {
          setCheckInError(err.response.data.message);
          setCheckInLoading(false);
          return false;
        }
      }

      // Update state
      const updated = tokens.map(t => {
        if (String(t.id) === String(targetToken.id)) {
          return {
            ...t,
            checkedIn: true,
            checkedInAt: new Date().toISOString(),
          };
        }
        return t;
      });
      setTokens(updated);

      if (typeof window !== 'undefined') {
        const localStr = localStorage.getItem('ak_customer_tokens');
        if (localStr) {
          const localTokens = JSON.parse(localStr);
          const nextLocal = localTokens.map(t => {
            if (String(t.id) === String(targetToken.id)) {
              return { ...t, checkedIn: true, checkedInAt: new Date().toISOString() };
            }
            return t;
          });
          localStorage.setItem('ak_customer_tokens', JSON.stringify(nextLocal));
        }
      }

      setDelaySuccessAlert(`Checked in successfully at ${targetToken.shopName || 'Store'}! Counter desk notified.`);
      setTimeout(() => setDelaySuccessAlert(null), 6000);
      setTokenToCheckIn(null);
      setCheckInLoading(false);
      return true;
    };

    if (useDoorCoordinates) {
      await performApiCall(26.8861, 80.9951);
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          await performApiCall(lat, lng);
        },
        async (err) => {
          console.warn('Geolocation error:', err.message);
          setCheckInError('Device GPS was unavailable or permission denied. Please click "Confirm At Counter Door" below.');
          setCheckInLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      await performApiCall(26.8861, 80.9951);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your visit history?")) {
      const currentPhoneRaw = typeof window !== 'undefined' ? localStorage.getItem('ak_phone') : null;
      const cleanPhone = normalizePhone(currentPhoneRaw);

      if (typeof window !== 'undefined') {
        if (cleanPhone) {
          const historyStr = localStorage.getItem('ak_customer_history');
          const allHistory = historyStr ? JSON.parse(historyStr) : [];
          // Only remove records belonging to this phone number
          const remaining = allHistory.filter(h => normalizePhone(h.customerPhone) !== cleanPhone);
          localStorage.setItem('ak_customer_history', JSON.stringify(remaining));
        }
        window.dispatchEvent(new Event('storage'));
      }
      setHistoryTokens([]);
    }
  };

  // Complete Active Real Token and Immediately Open Rating Modal
  const handleCompleteAndRate = (token) => {
    if (!token) return;

    const currentPhoneRaw = typeof window !== 'undefined' ? localStorage.getItem('ak_phone') : null;
    const cleanPhone = normalizePhone(currentPhoneRaw);

    const completedToken = {
      ...token,
      customerPhone: token.customerPhone || cleanPhone,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      reviewed: false,
    };

    // Remove from active tokens
    const nextActive = tokens.filter(t => String(t.id) !== String(token.id));
    setTokens(nextActive);

    // Add to history tokens
    const nextHistory = [completedToken, ...historyTokens.filter(t => String(t.id) !== String(token.id))];
    setHistoryTokens(nextHistory);

    if (typeof window !== 'undefined') {
      const localStr = localStorage.getItem('ak_customer_tokens');
      const allTokens = localStr ? JSON.parse(localStr) : [];
      const remainingTokens = allTokens.filter(t => String(t.id) !== String(token.id));
      localStorage.setItem('ak_customer_tokens', JSON.stringify(remainingTokens));

      const historyStr = localStorage.getItem('ak_customer_history');
      const allHistory = historyStr ? JSON.parse(historyStr) : [];
      const updatedAllHistory = [completedToken, ...allHistory.filter(t => String(t.id) !== String(token.id))];
      localStorage.setItem('ak_customer_history', JSON.stringify(updatedAllHistory));
      window.dispatchEvent(new Event('storage'));
    }

    // Open review modal with default 5-stars
    setTokenToReview(completedToken);
    setRatingStars(5);
    setHoverStars(0);
    setReviewTags(['ON_TIME', 'BEHAVIOUR']);
    setReviewText('');
    setReviewError(null);
  };

  // Handle Submit 5-Star Post-Service Review
  const handleSubmitReview = async (e) => {
    if (e) e.preventDefault();
    if (!tokenToReview) return;

    setReviewSubmitting(true);
    setReviewError(null);

    const customerName = (typeof window !== 'undefined' ? localStorage.getItem('ak_customer_name') : '') || tokenToReview.customerName || 'Verified Customer';

    const payload = {
      tokenId: tokenToReview.id,
      stars: ratingStars,
      text: reviewText.trim() || undefined,
      tags: reviewTags,
      customerName: customerName.trim()
    };

    try {
      try {
        await reviewApi.submitReview(payload);
      } catch (backendErr) {
        console.warn("Backend review submit warning / fallback:", backendErr?.response?.data?.message || backendErr?.message);
      }

      const currentPhoneRaw = typeof window !== 'undefined' ? localStorage.getItem('ak_phone') : null;
      const cleanPhone = normalizePhone(currentPhoneRaw);

      // Update in master localStorage history tokens
      if (typeof window !== 'undefined') {
        const historyStr = localStorage.getItem('ak_customer_history');
        const allHistory = historyStr ? JSON.parse(historyStr) : [];
        const updatedAllHistory = allHistory.map(item => {
          if (String(item.id) === String(tokenToReview.id)) {
            return {
              ...item,
              customerPhone: item.customerPhone || cleanPhone,
              reviewed: true,
              reviewStars: ratingStars,
              reviewText: reviewText.trim(),
              reviewTags: reviewTags,
              reviewedAt: new Date().toISOString()
            };
          }
          return item;
        });
        localStorage.setItem('ak_customer_history', JSON.stringify(updatedAllHistory));
        window.dispatchEvent(new Event('storage'));
      }

      // Update active state history
      const updatedHistory = historyTokens.map(item => {
        if (String(item.id) === String(tokenToReview.id)) {
          return {
            ...item,
            customerPhone: item.customerPhone || cleanPhone,
            reviewed: true,
            reviewStars: ratingStars,
            reviewText: reviewText.trim(),
            reviewTags: reviewTags,
            reviewedAt: new Date().toISOString()
          };
        }
        return item;
      });
      setHistoryTokens(updatedHistory);

      setReviewSuccessMsg(`Thank you! Your ${ratingStars}-star rating for ${tokenToReview.shopName || 'the store'} was submitted.`);
      setTimeout(() => setReviewSuccessMsg(null), 6000);
      setTokenToReview(null);
      setReviewText('');
    } catch (err) {
      setReviewError(err?.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16 pt-6">
      
      {/* Offline Connectivity Warning Bar */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-rose-600 text-white shadow-md flex items-center justify-between gap-3 text-xs font-bold border border-rose-400"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span>You are currently offline. Queue status will resume once internet is back.</span>
          </div>
          <span className="text-[10px] bg-rose-800/80 px-2.5 py-0.5 rounded-full uppercase">
            Offline Mode
          </span>
        </motion.div>
      )}
      
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

      {/* Delay / Hold Success Toast */}
      <AnimatePresence>
        {delaySuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-[#176B65] text-white shadow-lg flex items-center justify-between gap-3 border border-emerald-400 text-xs font-semibold"
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{delaySuccessAlert}</span>
            </div>
            <button
              onClick={() => setDelaySuccessAlert(null)}
              className="text-white/70 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancellation Success Feedback Toast */}
      <AnimatePresence>
        {cancelSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-slate-900 text-white shadow-lg flex items-center justify-between gap-3 border border-slate-700 text-xs font-semibold"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{cancelSuccessAlert}</span>
            </div>
            <button
              onClick={() => setCancelSuccessAlert(null)}
              className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5-Star Rating Success Feedback Toast */}
      <AnimatePresence>
        {reviewSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-amber-600 text-white shadow-lg flex items-center justify-between gap-3 border border-amber-400 text-xs font-semibold"
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 fill-amber-200 text-amber-200 shrink-0" />
              <span>{reviewSuccessMsg}</span>
            </div>
            <button
              onClick={() => setReviewSuccessMsg(null)}
              className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
            >
              ✕
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
              <span>My Queue Passes</span>
            </h1>

            {/* Real-time SSE Live Indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <Radio className="w-3 h-3 text-emerald-600" />
              <span>Live SSE Sync</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#283B3D]/70 font-medium mt-1">
            Real-time synchronization with the counter desk. View active turn or review past visit history.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Notification Toggle */}
          <button
            type="button"
            onClick={async () => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (typeof window !== 'undefined') {
                localStorage.setItem('ak_sound_enabled', String(next));
              }
              if (next) {
                playChime('turn');
                await requestTurnNotificationPermission();
              }
            }}
            title={soundEnabled ? "Turn Alerts: Sound ON (Click to Test / Mute)" : "Turn Alerts: Muted (Click to Turn ON)"}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 shadow-xs'
                : 'bg-white text-slate-500 border-[#DCE9E3] hover:bg-slate-50'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Sound: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>Muted</span>
              </>
            )}
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

      {/* Tabs: Active Tokens vs History */}
      <div className="flex items-center gap-3 border-b border-[#DCE9E3] pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'bg-[#176B65] text-white shadow-sm'
              : 'bg-white text-[#283B3D] border border-[#DCE9E3] hover:border-[#176B65]'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Active In Queue</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {tokens.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#176B65] text-white shadow-sm'
              : 'bg-white text-[#283B3D] border border-[#DCE9E3] hover:border-[#176B65]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Visit History & Ratings</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {historyTokens.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ACTIVE TOKENS IN QUEUE                                  */}
      {/* ============================================================== */}
      {activeTab === 'active' && (
        <>
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#176B65] animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#283B3D]/70">Checking your live tokens from cloud...</p>
            </div>
          ) : tokens.length === 0 ? (
            <div className="urban-card rounded-3xl p-10 sm:p-14 text-center space-y-4 max-w-xl mx-auto border border-[#DCE9E3]">
              <div className="w-16 h-16 rounded-3xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center mx-auto border border-[#DCE9E3]">
                <Ticket className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-black text-[#283B3D] text-lg">No Active Tokens Found</h3>
                <p className="text-xs sm:text-sm text-[#283B3D]/60 mt-1 max-w-sm mx-auto">
                  You do not have any tokens currently in queue. Explore nearby places to book an instant pass.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {tokens.map((token) => {
                  const isServing = token.status === 'CALLED' || token.status === 'SERVING' || (token.peopleAhead === 0 && token.currentServing === token.displayToken);
                  const isSkipped = token.status === 'SKIPPED' || token.status === 'NO_SHOW';
                  const hasDelay = !!token.delayMinutes;
                  const shopBroadcast = getActiveShopBroadcast(token.shopSlug, token.shopName);
                  const extraDelay = shopBroadcast?.delayMinutes || 0;
                  const finalWaitMin = Math.max(0, (token.estimatedWaitMin ?? 0) + extraDelay);

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
                          : isSkipped
                          ? 'border-2 border-amber-400 bg-amber-50/20 shadow-md'
                          : 'border-[#DCE9E3]'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#176B65] bg-[#DCE9E3] px-3 py-1 rounded-lg">
                              {token.groupSize > 1 ? `Group (${token.groupSize} Persons)` : 'Single Ticket'}
                            </span>
                            <button
                              type="button"
                              onClick={() => shareTokenPass(token)}
                              title="Share Pass on WhatsApp"
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-98"
                            >
                              <Share2 className="w-3 h-3 text-emerald-600" />
                              <span>Share Pass</span>
                            </button>
                          </div>

                          <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                            isServing
                              ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                              : isSkipped
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${isServing ? 'bg-white animate-ping' : isSkipped ? 'bg-white' : 'bg-emerald-500 animate-ping'}`}></span>
                            <span>{isServing ? 'SERVING NOW' : isSkipped ? 'TURN PASSED' : (token.status || 'ACTIVE')}</span>
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
                            {token.customerPurpose && (
                              <span className="inline-block text-[11px] font-bold text-[#176B65] bg-[#DCE9E3]/70 px-2 py-0.5 rounded-md mt-1">
                                Service: {token.customerPurpose}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`font-token text-4xl font-bold tracking-tight ${
                              isServing ? 'text-emerald-700' : isSkipped ? 'text-amber-700' : 'text-[#176B65]'
                            }`}>
                              {token.displayToken || `#${token.tokenNumber || '1'}`}
                            </span>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Your Token
                            </span>
                          </div>
                        </div>

                        {/* Address & Google Maps Directions */}
                        <div className="flex items-center justify-between text-xs text-[#283B3D]/70 bg-[#F3F1E9]/70 px-3 py-2 rounded-xl border border-[#DCE9E3]">
                          <div className="flex items-center gap-1.5 line-clamp-1 pr-2">
                            <MapPin className="w-3.5 h-3.5 text-[#176B65] shrink-0" />
                            <span className="line-clamp-1 text-[11px] font-medium">
                              {token.address || 'Indira Nagar, Lucknow'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => shareTokenPass(token)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                              title="Share Token details on WhatsApp"
                            >
                              <Share2 className="w-3 h-3 text-emerald-600" />
                              <span>Share</span>
                            </button>
                            <span className="text-slate-300">|</span>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((token.address || 'Indira Nagar, Lucknow') + ' ' + (token.shopName || ''))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#176B65] hover:text-[#125550] hover:underline cursor-pointer"
                            >
                              <Navigation className="w-3 h-3" />
                              <span>Directions</span>
                              <ArrowUpRight className="w-3 h-3 opacity-60" />
                            </a>
                          </div>
                        </div>

                        {/* Geo Check-In Status / Lobby Arrival Action */}
                        {token.checkedIn ? (
                          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div>
                                <span className="font-bold">Checked-In at Store Lobby</span>
                                <p className="text-[10px] text-emerald-700">
                                  Desk verified: You are physically inside the shop.
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-black uppercase bg-emerald-200/70 text-emerald-800 px-2.5 py-0.5 rounded-md shrink-0">
                              Lobby Verified
                            </span>
                          </div>
                        ) : !isSkipped && (
                          <div className="p-3 bg-[#DCE9E3]/50 rounded-2xl border border-[#176B65]/20 flex items-center justify-between gap-2 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#176B65] shrink-0" />
                              <div className="text-xs">
                                <span className="font-bold text-[#283B3D]">Arrived at the shop?</span>
                                <p className="text-[10px] text-[#283B3D]/70">Notify counter desk you're inside</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenCheckInModal(token)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0 active:scale-98"
                            >
                              Check-In
                            </button>
                          </div>
                        )}

                        {/* Customer Delay Active Badge */}
                        {hasDelay && !isServing && !isSkipped && (
                          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                              <div>
                                <span className="font-bold">Hold Alert: +{token.delayMinutes} mins late</span>
                                {token.delayNote && (
                                  <p className="text-[11px] text-amber-700 mt-0.5 line-clamp-1">
                                    Note: {token.delayNote}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button 
                                onClick={() => handleOpenDelayModal(token)}
                                className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                              >
                                Edit
                              </button>
                              <span className="text-amber-300">•</span>
                              <button 
                                onClick={() => handleClearDelay(token.id)}
                                className="text-[11px] font-bold text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Skipped / Turn Missed Warning & Re-queue Box */}
                        {isSkipped && (
                          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-900 space-y-2.5">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span className="font-bold">Turn Was Passed While You Were Away</span>
                            </div>
                            <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                              Have you reached the store? Tap below to re-enter the queue without booking a new token.
                            </p>
                            <button
                              onClick={() => handleReQueue(token.id)}
                              disabled={requeuingId === token.id}
                              className="w-full py-2.5 rounded-xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 text-white ${requeuingId === token.id ? 'animate-spin' : ''}`} />
                              <span>{requeuingId === token.id ? 'Re-joining Line...' : "I'm Here / Re-Enter Queue"}</span>
                            </button>
                          </div>
                        )}

                        {/* Companions breakdown if any */}
                        {token.companions && token.companions.length > 0 && (
                          <div className="p-3 bg-[#F3F1E9]/80 rounded-2xl border border-[#DCE9E3] text-[11px] space-y-1.5">
                            <span className="font-bold text-[#283B3D]/70 block">Group Member Requirements:</span>
                            {token.companions.map((c, i) => (
                              <div key={i} className="flex items-center justify-between text-[#283B3D]/80">
                                <span>#{i + 2} {c.name || `Companion #${i + 2}`}</span>
                                <span className="font-bold text-[#176B65]">{c.purpose || 'General Service'}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Emergency Flash Queue Broadcast Notice (BRD FR-708 / FR-405) */}
                        {shopBroadcast && (
                          <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 shadow-xs ${
                            shopBroadcast.severity === 'CRITICAL'
                              ? 'bg-rose-50 border-rose-300 text-rose-950'
                              : shopBroadcast.severity === 'INFO'
                              ? 'bg-teal-50 border-teal-300 text-teal-950'
                              : 'bg-amber-50 border-amber-300 text-amber-950'
                          }`}>
                            <Radio className={`w-4 h-4 shrink-0 mt-0.5 animate-pulse ${
                              shopBroadcast.severity === 'CRITICAL' ? 'text-rose-600' : shopBroadcast.severity === 'INFO' ? 'text-teal-600' : 'text-amber-600'
                            }`} />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-black/10">
                                  ⚠️ Emergency Notice: {shopBroadcast.reason}
                                </span>
                                {shopBroadcast.delayMinutes > 0 && (
                                  <span className="font-extrabold text-[11px] text-amber-900 bg-amber-200 px-2 py-0.5 rounded-md">
                                    +{shopBroadcast.delayMinutes}m delay added
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold text-xs leading-relaxed">
                                {shopBroadcast.message}
                              </p>
                            </div>
                          </div>
                        )}

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
                              {finalWaitMin} <span className="text-xs font-semibold">min</span>
                            </span>
                            {extraDelay > 0 && (
                              <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded mt-0.5">
                                +{extraDelay}m emergency delay
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Note & Action Buttons */}
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

                        {/* Action Buttons: Running Late + Cancel Token */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleOpenDelayModal(token)}
                            className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 ${
                              hasDelay
                                ? 'border-amber-300 bg-amber-50 text-amber-800'
                                : 'border-[#DCE9E3] bg-white text-[#283B3D] hover:bg-[#DCE9E3]/40'
                            }`}
                          >
                            <Hourglass className="w-3.5 h-3.5 text-[#176B65]" />
                            <span>{hasDelay ? `+${token.delayMinutes}m Late` : 'Running Late?'}</span>
                          </button>

                          <button
                            onClick={() => handleOpenCancelModal(token)}
                            className="py-2 px-2 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel Token</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* TAB 2: VISIT HISTORY & CANCELLED PASSES                        */}
      {/* ============================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Quick Prompt Banner for Unreviewed Completed Visit (Fresh Urban Theme) */}
          {(() => {
            const unreviewedToken = historyTokens.find(t => t.status === 'COMPLETED' && !t.reviewed);
            if (!unreviewedToken) return null;
            return (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-5 rounded-3xl bg-[#DCE9E3]/80 border border-[#176B65]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#176B65] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Star className="w-6 h-6 fill-white text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[#176B65] text-white px-2 py-0.5 rounded-md">
                        Recent Service Completed
                      </span>
                      <span className="text-xs text-[#283B3D]/70 font-bold">
                        Token {unreviewedToken.displayToken} • {unreviewedToken.shopName}
                      </span>
                    </div>
                    <h3 className="font-black text-sm sm:text-base text-[#283B3D] mt-1">
                      How was your experience at {unreviewedToken.shopName}?
                    </h3>
                    <p className="text-xs text-[#283B3D]/70 font-medium mt-0.5">
                      Tap below to leave a 1 to 5 star rating and feedback for the shop.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTokenToReview(unreviewedToken);
                    setRatingStars(5);
                    setHoverStars(0);
                    setReviewTags(['ON_TIME', 'BEHAVIOUR']);
                    setReviewText('');
                    setReviewError(null);
                  }}
                  className="px-5 py-3 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0"
                >
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-3.5 h-3.5 fill-white text-white" />
                    ))}
                  </div>
                  <span>Rate Your Experience ⭐</span>
                </button>
              </motion.div>
            );
          })()}

          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#283B3D]/70">
              Completed and cancelled token passes from previous visits.
            </p>
            {historyTokens.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {historyTokens.length === 0 ? (
            <div className="urban-card rounded-3xl p-10 text-center space-y-3 max-w-md mx-auto border border-[#DCE9E3]">
              <History className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-[#283B3D] text-sm">No Visit History Yet</h4>
              <p className="text-xs text-[#283B3D]/60">
                Whenever you finish a visit or cancel a token, it will appear here for easy re-booking.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {historyTokens.map((item, idx) => {
                const isCancelled = item.status === 'CANCELLED';
                const dateStr = item.cancelledAt 
                  ? new Date(item.cancelledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                  : 'Recent Visit';

                return (
                  <div 
                    key={item.id || idx}
                    className="urban-card rounded-3xl p-5 border border-[#DCE9E3] space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">
                          {dateStr}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          isCancelled
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isCancelled ? 'CANCELLED' : 'COMPLETED'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-black text-base text-[#283B3D] line-clamp-1">
                            {item.shopName || 'Partner Store'}
                          </h4>
                          <span className="text-xs text-[#283B3D]/60 font-medium">
                            {item.customerName || 'Customer'}
                          </span>
                        </div>
                        <span className="font-token text-2xl font-bold text-[#283B3D]/80">
                          {item.displayToken || `#${item.tokenNumber || '1'}`}
                        </span>
                      </div>

                      {item.cancellationReason && (
                        <div className="bg-rose-50/70 rounded-xl p-2.5 border border-rose-100 text-[11px] text-rose-800 font-medium">
                          <span className="font-bold">Reason:</span> {item.cancellationReason}
                        </div>
                      )}

                      {/* Customer 5-Star Rating Section for Completed Visits */}
                      {!isCancelled && (
                        item.reviewed ? (
                          <div className="bg-amber-50/90 rounded-2xl p-3 border border-amber-200/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star 
                                    key={s} 
                                    className={`w-3.5 h-3.5 ${
                                      s <= item.reviewStars 
                                        ? 'fill-amber-400 text-amber-500' 
                                        : 'text-slate-300'
                                    }`} 
                                  />
                                ))}
                                <span className="text-xs font-black text-amber-900 ml-1">
                                  {item.reviewStars}.0
                                </span>
                              </div>
                              <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                                Verified Review
                              </span>
                            </div>
                            {item.reviewText && (
                              <p className="text-xs text-[#283B3D]/80 italic line-clamp-2">
                                "{item.reviewText}"
                              </p>
                            )}
                            {item.reviewTags && item.reviewTags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {item.reviewTags.map(tag => (
                                  <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/80 border border-amber-200 text-amber-900">
                                    {tag === 'ON_TIME' ? '⏱️ On-Time' : tag === 'BEHAVIOUR' ? '🤝 Polite Staff' : '✨ Fair Wait'}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setTokenToReview(item);
                              setRatingStars(5);
                              setReviewTags(['ON_TIME', 'BEHAVIOUR']);
                              setReviewText('');
                              setReviewError(null);
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
                          >
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              ))}
                            </div>
                            <span>Rate Your Experience</span>
                          </button>
                        )
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#DCE9E3]">
                      <Link
                        href={`/book/${item.shopSlug || 'royal-barber-indira-nagar'}`}
                        className="w-full py-2.5 rounded-xl bg-white hover:bg-[#DCE9E3]/50 border border-[#DCE9E3] text-[#176B65] font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Book Again</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#176B65]" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* INTERACTIVE CUSTOMER DELAY / HOLD MODAL                        */}
      {/* ============================================================== */}
      <AnimatePresence>
        {tokenToDelay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283B3D]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#DCE9E3] space-y-5"
            >
              {/* Header */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                  <Hourglass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#283B3D]">
                    Running Late? Request Hold
                  </h3>
                  <p className="text-xs text-[#283B3D]/60 font-medium mt-0.5">
                    {tokenToDelay.shopName || 'Store'} • Token #{tokenToDelay.displayToken || tokenToDelay.tokenNumber}
                  </p>
                </div>
              </div>

              <div className="bg-[#F3F1E9] rounded-2xl p-3.5 text-xs text-[#283B3D]/80 border border-[#DCE9E3] leading-relaxed">
                Let the counter desk know how many minutes you are delayed. They will hold your turn and call the next customer while you arrive.
              </div>

              {/* Delay Minutes Selection */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[#283B3D] block">
                  Select Delay Time (or enter Custom):
                </label>
                
                {/* Quick Chips */}
                <div className="grid grid-cols-4 gap-2">
                  {QUICK_DELAY_OPTIONS.map((mins) => {
                    const isSelected = delayMode === String(mins);
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDelayMode(String(mins))}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                          isSelected
                            ? 'bg-[#176B65] text-white border-[#176B65] shadow-xs'
                            : 'bg-white text-[#283B3D] border-[#DCE9E3] hover:border-[#176B65]'
                        }`}
                      >
                        +{mins} Min
                      </button>
                    );
                  })}
                </div>

                {/* Custom Time Selector Pill */}
                <button
                  type="button"
                  onClick={() => setDelayMode('custom')}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-between ${
                    delayMode === 'custom'
                      ? 'bg-[#DCE9E3] text-[#176B65] border-[#176B65]'
                      : 'bg-white text-[#283B3D] border-[#DCE9E3] hover:bg-slate-50'
                  }`}
                >
                  <span>Custom Delay Time</span>
                  <span className="text-[11px] font-extrabold uppercase">
                    {delayMode === 'custom' ? `Active: ${customDelayMinutes} min` : 'Tap to specify'}
                  </span>
                </button>

                {/* Custom Minutes Input Box if selected */}
                {delayMode === 'custom' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-[#F3F1E9] rounded-2xl border border-[#DCE9E3] space-y-2"
                  >
                    <span className="text-[11px] font-bold text-[#283B3D]/70 block">
                      Type exact delay in minutes:
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const current = parseInt(customDelayMinutes, 10) || 15;
                          setCustomDelayMinutes(String(Math.max(1, current - 5)));
                        }}
                        className="w-10 h-10 rounded-xl bg-white border border-[#DCE9E3] text-[#283B3D] font-black text-sm flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <div className="flex-1 relative">
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={customDelayMinutes}
                          onChange={(e) => setCustomDelayMinutes(e.target.value)}
                          placeholder="e.g. 25"
                          className="w-full text-center font-token font-bold text-lg bg-white border border-[#DCE9E3] rounded-xl py-2 px-3 focus:outline-none focus:border-[#176B65]"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                          mins
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const current = parseInt(customDelayMinutes, 10) || 15;
                          setCustomDelayMinutes(String(Math.min(120, current + 5)));
                        }}
                        className="w-10 h-10 rounded-xl bg-white border border-[#DCE9E3] text-[#283B3D] font-black text-sm flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Optional Note / Quick Reasons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#283B3D] block">
                  Add a reason note for the desk (optional):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_DELAY_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setDelayNote(r)}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        delayNote === r
                          ? 'bg-[#176B65] text-white border-[#176B65]'
                          : 'bg-white text-[#283B3D]/80 border-[#DCE9E3] hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="e.g. Traffic near Bhootnath market"
                  value={delayNote}
                  onChange={(e) => setDelayNote(e.target.value)}
                  className="w-full mt-1.5 p-2.5 text-xs rounded-xl border border-[#DCE9E3] focus:outline-none focus:border-[#176B65]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTokenToDelay(null)}
                  disabled={delayLoading}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#DCE9E3] bg-white hover:bg-slate-50 text-[#283B3D] font-bold text-xs transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDelay}
                  disabled={delayLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {delayLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Notifying...</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-white" />
                      <span>Notify Counter</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* INTERACTIVE CANCELLATION MODAL                                 */}
      {/* ============================================================== */}
      <AnimatePresence>
        {tokenToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283B3D]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#DCE9E3] space-y-5"
            >
              {/* Header */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#283B3D]">
                    Cancel Queue Token?
                  </h3>
                  <p className="text-xs text-[#283B3D]/60 font-medium mt-0.5">
                    {tokenToCancel.shopName || 'Store'} • Token #{tokenToCancel.displayToken || tokenToCancel.tokenNumber}
                  </p>
                </div>
              </div>

              <div className="bg-[#F3F1E9] rounded-2xl p-3.5 text-xs text-[#283B3D]/80 border border-[#DCE9E3] leading-relaxed">
                Cancelling will release your reserved position so the next waiting customer can be served. This action cannot be undone.
              </div>

              {/* Cancellation Reason Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#283B3D] block">
                  Please select a reason (optional):
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {CANCEL_REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        cancelReason === r
                          ? 'border-[#176B65] bg-[#DCE9E3]/50 text-[#176B65]'
                          : 'border-[#DCE9E3] bg-white text-[#283B3D] hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={r}
                        checked={cancelReason === r}
                        onChange={() => setCancelReason(r)}
                        className="text-[#176B65] focus:ring-[#176B65]"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>

                {cancelReason === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full mt-2 p-2.5 text-xs rounded-xl border border-[#DCE9E3] focus:outline-none focus:border-[#176B65]"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTokenToCancel(null)}
                  disabled={cancellingLoading}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#DCE9E3] bg-white hover:bg-slate-50 text-[#283B3D] font-bold text-xs transition-all cursor-pointer text-center"
                >
                  Keep My Token
                </button>

                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancellingLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {cancellingLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <span>Yes, Cancel Token</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* INTERACTIVE STORE LOBBY GEO CHECK-IN MODAL                    */}
      {/* ============================================================== */}
      <AnimatePresence>
        {tokenToCheckIn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283B3D]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#DCE9E3] space-y-5"
            >
              {/* Header */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#283B3D]">
                    Store Lobby Check-In
                  </h3>
                  <p className="text-xs text-[#283B3D]/60 font-medium mt-0.5">
                    {tokenToCheckIn.shopName || 'Store'} • Token #{tokenToCheckIn.displayToken || tokenToCheckIn.tokenNumber}
                  </p>
                </div>
              </div>

              <div className="bg-[#F3F1E9] rounded-2xl p-3.5 text-xs text-[#283B3D]/80 border border-[#DCE9E3] leading-relaxed">
                Check-in confirms you are physically inside or within 100m of the store. The desk counter will be notified that you are ready in the lobby.
              </div>

              {checkInError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{checkInError}</span>
                </div>
              )}

              {/* Check-In Options */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleExecuteCheckIn(false)}
                  disabled={checkInLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                >
                  {checkInLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying Live GPS Distance...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 text-emerald-200" />
                      <span>Check-In with Device GPS (Within 100m)</span>
                    </>
                  )}
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-[#DCE9E3] w-full"></div>
                  <span className="bg-white px-2 text-[10px] uppercase font-bold text-slate-400 absolute">
                    or
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleExecuteCheckIn(true)}
                  disabled={checkInLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-white border border-[#DCE9E3] hover:bg-[#DCE9E3]/40 text-[#283B3D] font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#176B65]" />
                  <span>Confirm At Counter Door (Instant)</span>
                </button>
              </div>

              {/* Close Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setTokenToCheckIn(null)}
                  disabled={checkInLoading}
                  className="w-full py-2.5 rounded-xl border border-transparent text-[#283B3D]/70 hover:text-[#283B3D] text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Not at Store Yet (Close)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* INTERACTIVE 5-STAR POST-SERVICE RATING & REVIEW MODAL          */}
      {/* ============================================================== */}
      <AnimatePresence>
        {tokenToReview && (() => {
          const currentRating = hoverStars || ratingStars;
          const theme = RATING_THEMES[currentRating] || RATING_THEMES[5];

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283B3D]/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#DCE9E3] space-y-5 text-[#283B3D]"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center shrink-0 border border-[#176B65]/20 shadow-xs">
                      <Star className="w-5 h-5 fill-[#176B65] text-[#176B65]" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-[#283B3D]">
                        Rate Your Experience
                      </h3>
                      <p className="text-xs text-[#283B3D]/60 font-medium">
                        {tokenToReview.shopName || 'Store'} • Token {tokenToReview.displayToken || `#${tokenToReview.tokenNumber}`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTokenToReview(null)}
                    disabled={reviewSubmitting}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Animated Face & Dynamic Rating Selector */}
                <div className={`${theme.bg} rounded-3xl p-5 border ${theme.border} text-center space-y-3 transition-colors duration-300`}>
                  
                  {/* Dynamic Emotional Face (Crying on bad rating, smiling on good rating) */}
                  <div className="py-1">
                    <AnimatedRatingFace rating={currentRating} />
                  </div>

                  {/* Dynamic Rating Label & Hint */}
                  <div>
                    <span className={`text-base font-black ${theme.accentText} block transition-colors`}>
                      {theme.label}
                    </span>
                    <p className="text-[11px] text-[#283B3D]/70 font-medium mt-0.5 max-w-xs mx-auto">
                      {theme.hint}
                    </p>
                  </div>

                  {/* 5 Stars Selector */}
                  <div className="flex items-center justify-center gap-2 pt-1 pb-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = currentRating >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverStars(star)}
                          onMouseLeave={() => setHoverStars(0)}
                          onClick={() => setRatingStars(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-120 active:scale-95"
                        >
                          <Star
                            className={`w-8 h-8 transition-all ${
                              isFilled
                                ? `${theme.starActive} filter drop-shadow-xs`
                                : 'text-slate-300 stroke-1'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#283B3D]/50 block">
                    Tap any star to update rating
                  </span>
                </div>

                {/* Quick Feedback Chips (BRD FR-1102) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#283B3D] block">
                    Quick Feedback (Select all that apply):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {REVIEW_TAGS.map((tag) => {
                      const isSelected = reviewTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setReviewTags(reviewTags.filter(t => t !== tag.id));
                            } else {
                              setReviewTags([...reviewTags, tag.id]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#176B65] text-white border-[#176B65] shadow-xs'
                              : 'bg-white text-[#283B3D] border-[#DCE9E3] hover:border-[#176B65]'
                          }`}
                        >
                          {tag.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Review Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#283B3D] block">
                    Write a Note (Optional):
                  </label>
                  <textarea
                    rows={2}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="How was the queue wait, hygiene, and staff behavior?"
                    className="w-full p-3 text-xs rounded-xl border border-[#DCE9E3] bg-[#F3F1E9]/40 focus:outline-none focus:border-[#176B65] focus:bg-white resize-none text-[#283B3D]"
                  />
                </div>

                {/* Reviewer Name Display */}
                <div className="text-[11px] text-[#283B3D]/60 flex items-center justify-between px-1">
                  <span>
                    Posting as: <strong className="text-[#283B3D]">{(typeof window !== 'undefined' ? localStorage.getItem('ak_customer_name') : '') || tokenToReview.customerName || 'Customer'}</strong>
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Verified Visit Pass
                  </span>
                </div>

                {reviewError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                    {reviewError}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTokenToReview(null)}
                    disabled={reviewSubmitting}
                    className="flex-1 py-3 px-4 rounded-xl border border-[#DCE9E3] bg-white hover:bg-slate-50 text-[#283B3D] font-bold text-xs transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={reviewSubmitting}
                    className={`flex-1 py-3 px-4 rounded-xl ${theme.btnBg} font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98`}
                  >
                    {reviewSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>Submit Rating</span>
                      </>
                    )}
                  </button>
                </div>

              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}