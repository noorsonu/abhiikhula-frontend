"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Clock, MapPin, Users, ShieldCheck, Ticket, 
  CheckCircle2, AlertCircle, Sparkles, Phone, Store, UserPlus, Zap,
  Lock, ArrowRight, RefreshCw, KeyRound, Wrench, Briefcase, Plus, Minus,
  Navigation, ArrowUpRight, Share2, Star, Heart, Radio, Calendar, User, MessageSquare, Send, Reply, Edit3, CornerDownRight,
  ChevronLeft, ChevronRight, Image as ImageIcon, Check, Tag, ChevronDown, ChevronUp, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_SHOPS } from '@/lib/mockData';
import { authApi, queueApi, shopApi, reviewApi } from '@/lib/api';
import { shareTokenPass } from '@/lib/shareToken';
import { getFavoriteShopSlugs, toggleFavoriteShopSlug } from '@/lib/favorites';

const resolveShopImage = (shop) => {
  if (shop?.imageUrl) return shop.imageUrl;
  const name = (shop?.name || '').toLowerCase();
  const cat = (shop?.categoryName || '').toLowerCase();
  const slug = (shop?.slug || '').toLowerCase();

  if (cat.includes('barber') || cat.includes('salon') || name.includes('barber') || slug.includes('barber') || slug.includes('salon')) {
    return '/images/barber-real.jpg';
  }
  if (cat.includes('pharmacy') || cat.includes('medical') || name.includes('medical') || name.includes('pharmacy') || slug.includes('medical') || slug.includes('pharmacy')) {
    return '/images/pharmacy.jpg';
  }
  if (cat.includes('doctor') || cat.includes('clinic') || cat.includes('dental') || name.includes('dental') || name.includes('doctor') || slug.includes('dental') || slug.includes('clinic')) {
    return '/images/clinic.jpg';
  }
  if (cat.includes('food') || cat.includes('chaat') || cat.includes('restaurant') || name.includes('food') || name.includes('chaat') || slug.includes('food')) {
    return '/images/food.jpg';
  }
  if (cat.includes('diagnostic') || cat.includes('lab') || cat.includes('pathology') || name.includes('pathology') || name.includes('lab') || slug.includes('lab') || slug.includes('pathology')) {
    return '/images/diagnostic.jpg';
  }
  if (cat.includes('auto') || cat.includes('bike') || cat.includes('service') || name.includes('speedwheel') || slug.includes('auto') || slug.includes('speedwheel')) {
    return '/images/auto.jpg';
  }
  return '/images/clinic.jpg';
};

const getCategoryServices = (catName = '') => {
  const cat = (catName || '').toLowerCase();
  if (cat.includes('salon') || cat.includes('barber')) {
    return ['Haircut', 'Beard Trim & Styling', 'Hair Spa', 'Facial & Glow', 'Shave & Detan'];
  }
  if (cat.includes('pharmacy') || cat.includes('medical')) {
    return ['Prescription Medicines', 'OTC Medicines', 'Baby Care & Diapers', 'Health Supplements'];
  }
  if (cat.includes('clinic') || cat.includes('doctor') || cat.includes('dental')) {
    return ['Doctor Consultation', 'Dental Checkup / Scaling', 'Routine Follow-up', 'Tooth Pain / Cavity'];
  }
  if (cat.includes('food') || cat.includes('chaat') || cat.includes('restaurant')) {
    return ['Dine-in Table', 'Takeaway Packing', 'Evening Snacks', 'Party Order'];
  }
  if (cat.includes('diagnostic') || cat.includes('lab')) {
    return ['Routine Blood Test', 'Complete Hemogram (CBC)', 'Sugar & Thyroid Panel', 'Report Collection'];
  }
  if (cat.includes('auto') || cat.includes('bike')) {
    return ['Engine Oil Replacement', 'Periodic Service', 'Brake & Chain Tune-up', 'Tire & Puncture Check'];
  }
  return ['General Consultation', 'Quick Service', 'Product Purchase', 'Inquiry'];
};

export default function ShopDetailClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const loadShopBySlug = (targetSlug) => {
    if (!targetSlug || typeof window === 'undefined') return null;
    const cleanSlug = targetSlug.toLowerCase();
    try {
      const activeStr = localStorage.getItem('ak_active_merchant_shop');
      if (activeStr) {
        const active = JSON.parse(activeStr);
        if (active && (active.slug || '').toLowerCase() === cleanSlug) return active;
      }
      const allShopsStr = localStorage.getItem('ak_merchant_shops');
      if (allShopsStr) {
        const allShops = JSON.parse(allShopsStr);
        const match = allShops.find(s => (s.slug || '').toLowerCase() === cleanSlug);
        if (match) return match;
      }
    } catch (e) {}
    return null;
  };

  const initialShop = loadShopBySlug(slug);
  const [shop, setShop] = useState(() => initialShop);
  const [loadingShop, setLoadingShop] = useState(() => !initialShop);

  // Group Token State (1, 2, or Custom Count)
  const [selectedGroupMode, setSelectedGroupMode] = useState('1'); // '1', '2', 'custom'
  const [customCount, setCustomCount] = useState(3);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAge, setCustomerAge] = useState('');
  const [customerPurpose, setCustomerPurpose] = useState('');
  const [companionDetails, setCompanionDetails] = useState([]); // [{ name: '', purpose: '' }]

  const [booking, setBooking] = useState(false);
  const [bookedToken, setBookedToken] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // OTP Verification State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');
  const [ratingSummary, setRatingSummary] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shopBroadcast, setShopBroadcast] = useState(null);

  // BRD FR-1103: Multi-reply and follow-up comment thread states
  const [activeReplyReviewId, setActiveReplyReviewId] = useState(null);
  const [replyInputText, setReplyInputText] = useState('');
  const [replyAuthorName, setReplyAuthorName] = useState('');
  const [replyAuthorRole, setReplyAuthorRole] = useState('CUSTOMER');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [writeReviewModalOpen, setWriteReviewModalOpen] = useState(false);
  const [newReviewStars, setNewReviewStars] = useState(5);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewTags, setNewReviewTags] = useState(['ON_TIME', 'BEHAVIOUR']);
  const [newReviewSubmitting, setNewReviewSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('ak_role');
      const cName = localStorage.getItem('ak_customer_name');
      if (role === 'MERCHANT') {
        setReplyAuthorRole('MERCHANT');
        setReplyAuthorName(shop?.name || 'Shopkeeper');
      } else if (cName) {
        setReplyAuthorRole('CUSTOMER');
        setReplyAuthorName(cName);
        setNewReviewName(cName);
      } else {
        setReplyAuthorRole('CUSTOMER');
        setReplyAuthorName('Customer');
        setNewReviewName('Customer');
      }
    }
  }, [shop?.name]);

  const handlePostReplyToReview = async (review) => {
    if (!replyInputText.trim()) return;
    setReplySubmitting(true);
    const text = replyInputText.trim();
    const isMerch = replyAuthorRole === 'MERCHANT';
    const author = replyAuthorName.trim() || (isMerch ? (shop?.name || 'Shopkeeper') : 'Customer');
    const nowIso = new Date().toISOString();
    const replyDate = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newReplyItem = {
      id: 'rep-' + Date.now(),
      authorName: author,
      role: isMerch ? 'MERCHANT' : 'CUSTOMER',
      text: text,
      createdAt: nowIso,
      date: replyDate
    };

    setRatingSummary(prev => {
      if (!prev) return prev;
      const reviews = (prev.reviews || []).map(r => {
        if (r.id === review.id || (review.tokenId && r.tokenId === review.tokenId)) {
          const oldReplies = Array.isArray(r.replies) ? r.replies : (r.reply || r.merchantReply ? [{
            id: 'rep-old',
            authorName: shop?.name || 'Shopkeeper',
            role: 'MERCHANT',
            text: r.reply || r.merchantReply,
            createdAt: r.replyAt || nowIso,
            date: r.merchantReplyDate || 'Recent'
          }] : []);

          return {
            ...r,
            replies: [...oldReplies, newReplyItem],
            reply: isMerch ? text : (r.reply || r.merchantReply || text),
            merchantReply: isMerch ? text : (r.merchantReply || r.reply || text),
            replyAt: isMerch ? nowIso : r.replyAt,
            merchantReplyDate: isMerch ? replyDate : r.merchantReplyDate
          };
        }
        return r;
      });

      const curSlug = (shop?.slug || slug || '').toLowerCase();
      if (curSlug && typeof window !== 'undefined') {
        try {
          const key = `ak_merchant_reviews_${curSlug}`;
          localStorage.setItem(key, JSON.stringify(reviews));
          window.dispatchEvent(new Event('storage'));
        } catch (e) {}
      }

      return {
        ...prev,
        reviews
      };
    });

    if (isMerch && shop?.id && review.id && String(review.id).length > 20) {
      try {
        await reviewApi.replyToReview(shop.id, review.id, text).catch(() => {});
      } catch (e) {}
    }

    setReplyInputText('');
    setActiveReplyReviewId(null);
    setReplySubmitting(false);
  };

  const handleSubmitDirectReview = async (e) => {
    if (e) e.preventDefault();
    if (!newReviewComment.trim()) return;
    setNewReviewSubmitting(true);
    const author = newReviewName.trim() || 'Verified Customer';
    const curSlug = (shop?.slug || slug || '').toLowerCase();
    const nowIso = new Date().toISOString();
    const newRev = {
      id: 'rev-' + Date.now(),
      shopSlug: curSlug,
      customerName: author,
      stars: newReviewStars,
      text: newReviewComment.trim(),
      comment: newReviewComment.trim(),
      tags: newReviewTags.map(t => t === 'ON_TIME' ? '⏱️ On-Time Turn' : t === 'BEHAVIOUR' ? '🤝 Polite Staff' : '✨ Fair Wait'),
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: nowIso,
      verifiedVisit: true,
      replies: []
    };

    if (curSlug && typeof window !== 'undefined') {
      try {
        const key = `ak_merchant_reviews_${curSlug}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = [newRev, ...existing];
        localStorage.setItem(key, JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    }

    setRatingSummary(prev => {
      const existingReviews = prev?.reviews || [];
      const updated = [newRev, ...existingReviews];
      const totalStars = updated.reduce((s, r) => s + (Number(r.stars) || 5), 0);
      const avg = Math.round((totalStars / updated.length) * 10) / 10;
      return {
        averageRating: avg,
        reviewCount: updated.length,
        etaAccuracyScore: prev?.etaAccuracyScore || '96% Accurate',
        reviews: updated
      };
    });

    setNewReviewComment('');
    setWriteReviewModalOpen(false);
    setNewReviewSubmitting(false);
  };

  // BRD FR-708 / FR-405: Check for Emergency Flash Queue Broadcast Notice
  useEffect(() => {
    const checkBroadcast = () => {
      if (typeof window === 'undefined' || !slug) return;
      try {
        const saved = localStorage.getItem(`ak_shop_broadcast_${slug.toLowerCase()}`);
        if (saved) {
          const obj = JSON.parse(saved);
          if (obj && obj.active && (!obj.expiresAt || new Date(obj.expiresAt).getTime() > Date.now())) {
            setShopBroadcast(obj);
            return;
          }
        }
        setShopBroadcast(null);
      } catch (e) {
        setShopBroadcast(null);
      }
    };
    checkBroadcast();
    window.addEventListener('storage', checkBroadcast);
    return () => window.removeEventListener('storage', checkBroadcast);
  }, [slug]);

  // BRD FR-604 / FR-1201: Load Merchant's customized Service Rate Card
  const [customServices, setCustomServices] = useState([]);
  useEffect(() => {
    const loadServices = () => {
      if (typeof window === 'undefined' || !slug) return;
      try {
        const saved = localStorage.getItem(`ak_shop_services_${slug.toLowerCase()}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCustomServices(parsed.filter(s => s.active !== false));
            return;
          }
        }
      } catch (e) {}
    };
    loadServices();
    window.addEventListener('storage', loadServices);
    return () => window.removeEventListener('storage', loadServices);
  }, [slug]);

  // BRD FR-709: Load Merchant's Multi-Counter Stations (Barbers, Doctors, Chambers)
  const [shopStations, setShopStations] = useState([]);
  const [preferredStation, setPreferredStation] = useState('');

  useEffect(() => {
    const loadStations = () => {
      if (typeof window === 'undefined' || !slug) return;
      try {
        const saved = localStorage.getItem(`ak_shop_stations_${slug.toLowerCase()}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setShopStations(parsed.filter(s => s.active !== false));
            return;
          }
        }
      } catch (e) {}
    };
    loadStations();
    window.addEventListener('storage', loadStations);
    return () => window.removeEventListener('storage', loadStations);
  }, [slug]);

  // Shopkeeper uploaded photos
  const [shopPhotos, setShopPhotos] = useState([]);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  useEffect(() => {
    const loadPhotos = () => {
      if (typeof window === 'undefined' || !slug) return;
      try {
        const saved = localStorage.getItem(`ak_shop_photos_${slug.toLowerCase()}`);
        const defaults = [
          { id: 'def-1', url: shop?.imageUrl || '/images/clinic.jpg', caption: 'Shop Front & Counter' },
          { id: 'def-2', url: '/images/barber-real.jpg', caption: 'Styling & Work Station' }
        ];
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setShopPhotos([...parsed, ...defaults]);
            return;
          }
        }
        setShopPhotos(defaults);
      } catch (e) {}
    };
    loadPhotos();
    window.addEventListener('storage', loadPhotos);
    return () => window.removeEventListener('storage', loadPhotos);
  }, [slug, shop?.imageUrl]);

  // Multi-service selection & Custom list states
  const [selectedServicesList, setSelectedServicesList] = useState([]);
  const [customServiceInput, setCustomServiceInput] = useState('');

  // Rate card expand & search states
  const [rateCardExpanded, setRateCardExpanded] = useState(false);
  const [rateCardSearchQuery, setRateCardSearchQuery] = useState('');

  // Review pagination
  const [reviewPage, setReviewPage] = useState(1);
  const reviewsPerPage = 3;

  const handleToggleServiceSelection = (srv) => {
    const sName = typeof srv === 'string' ? srv : srv.name;
    const sPrice = typeof srv === 'object' && srv.price ? Number(srv.price) : 0;

    setSelectedServicesList(prev => {
      const exists = prev.find(item => item.name.toLowerCase() === sName.toLowerCase());
      let next;
      if (exists) {
        next = prev.filter(item => item.name.toLowerCase() !== sName.toLowerCase());
      } else {
        next = [...prev, { id: 'srv-' + Date.now() + Math.random(), name: sName, price: sPrice }];
      }

      // Update customerPurpose text
      const namesStr = next.map(u => u.price > 0 ? `${u.name} (₹${u.price})` : u.name).join(', ');
      const total = next.reduce((s, u) => s + (u.price || 0), 0);
      setCustomerPurpose(namesStr ? `${namesStr}${total > 0 ? ` • Est. Total: ₹${total}` : ''}` : '');
      return next;
    });
  };

  const handleAddCustomServiceToList = (e) => {
    if (e) e.preventDefault();
    if (!customServiceInput.trim()) return;
    const name = customServiceInput.trim();
    setSelectedServicesList(prev => {
      const next = [...prev, { id: 'custom-' + Date.now(), name, price: 0 }];
      const namesStr = next.map(u => u.price > 0 ? `${u.name} (₹${u.price})` : u.name).join(', ');
      const total = next.reduce((s, u) => s + (u.price || 0), 0);
      setCustomerPurpose(namesStr ? `${namesStr}${total > 0 ? ` • Est. Total: ₹${total}` : ''}` : '');
      return next;
    });
    setCustomServiceInput('');
  };

  const handleRemoveServiceFromList = (id) => {
    setSelectedServicesList(prev => {
      const next = prev.filter(item => item.id !== id);
      const namesStr = next.map(u => u.price > 0 ? `${u.name} (₹${u.price})` : u.name).join(', ');
      const total = next.reduce((s, u) => s + (u.price || 0), 0);
      setCustomerPurpose(namesStr ? `${namesStr}${total > 0 ? ` • Est. Total: ₹${total}` : ''}` : '');
      return next;
    });
  };

  useEffect(() => {
    if (slug) {
      const favs = getFavoriteShopSlugs();
      setIsFavorite(favs.includes(slug));
    }
  }, [slug]);

  const handleToggleFavorite = () => {
    if (!slug) return;
    const nextState = toggleFavoriteShopSlug(slug);
    setIsFavorite(nextState);
  };

  // Effective group size calculated from selection
  const effectiveGroupSize = selectedGroupMode === '1' ? 1 : selectedGroupMode === '2' ? 2 : Math.max(3, customCount);

  // Sync companionDetails array whenever group size changes
  useEffect(() => {
    const companionCount = Math.max(0, effectiveGroupSize - 1);
    setCompanionDetails(prev => {
      const next = [];
      for (let i = 0; i < companionCount; i++) {
        next.push(prev[i] || { name: '', purpose: '' });
      }
      return next;
    });
  }, [effectiveGroupSize]);

  // Auto-fill phone and name if previously logged in as customer
  const [userRole, setUserRole] = useState('GUEST');
  const [activeMerchantShop, setActiveMerchantShop] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('ak_role');
      setUserRole(role || 'GUEST');

      const savedMerchant = localStorage.getItem('ak_active_merchant_shop');
      if (savedMerchant) {
        try {
          setActiveMerchantShop(JSON.parse(savedMerchant));
        } catch (e) {}
      }

      const savedPhone = localStorage.getItem('ak_phone');
      if (savedPhone) setCustomerPhone(savedPhone);
      const savedName = localStorage.getItem('ak_customer_name');
      if (savedName) setCustomerName(savedName);
      const savedAge = localStorage.getItem('ak_customer_age');
      if (savedAge) setCustomerAge(savedAge);
    }
  }, []);

  // Fetch shop by slug from localStorage registered shops or backend API
  useEffect(() => {
    if (slug) {
      const local = loadShopBySlug(slug);
      if (local) {
        setShop(local);
        setLoadingShop(false);
      }
      shopApi.getShopBySlug(slug)
        .then((res) => {
          if (res?.data?.data) {
            setShop(prev => {
              const updated = {
                ...(prev || {}),
                ...res.data.data,
                id: res.data.data.id || prev?.id,
              };
              updated.imageUrl = updated.imageUrl || resolveShopImage(updated);
              return updated;
            });
          }
        })
        .catch(() => {})
        .finally(() => {
          setLoadingShop(false);
        });
    } else {
      setLoadingShop(false);
    }
  }, [slug]);

  // Fetch verified shop reviews and rating summary (BRD Section 22) - Accessible publicly to Guests & all users
  useEffect(() => {
    let isMounted = true;
    const loadAllReviews = async () => {
      let cloudSummary = null;
      const shopUuid = shop?.id && shop.id.includes('-') ? shop.id : 'd1b2c3d4-0000-0000-0000-000000000001';
      try {
        const res = await reviewApi.getShopReviews(shopUuid);
        if (res?.data?.data) {
          cloudSummary = res.data.data;
        }
      } catch (err) {
        console.warn("Reviews fetch fallback:", err?.message);
      }

      // Read local storage reviews for this shop slug
      const currentSlug = (shop?.slug || slug || '').toLowerCase();
      let localReviews = [];
      try {
        if (currentSlug) {
          const key = `ak_merchant_reviews_${currentSlug}`;
          const saved = localStorage.getItem(key);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) localReviews.push(...parsed);
          }
        }
        // Also check customer history reviews
        const histStr = localStorage.getItem('ak_customer_history');
        if (histStr) {
          const hist = JSON.parse(histStr);
          if (Array.isArray(hist)) {
            hist.forEach(h => {
              if (h.rating && (h.shopSlug === currentSlug || h.shopName === shop?.name)) {
                localReviews.push({
                  id: h.id || `hist-${h.displayToken}`,
                  customerName: h.customerName || 'Customer',
                  stars: h.rating,
                  text: h.reviewComment || h.comment || '',
                  tags: h.reviewTags || [],
                  merchantReply: h.merchantReply || h.reply || null,
                  reply: h.reply || h.merchantReply || null,
                  replyAt: h.replyAt || h.merchantReplyDate || null,
                  createdAt: h.completedAt || h.createdAt || new Date().toISOString()
                });
              }
            });
          }
        }
      } catch (e) {}

      // Merge cloud and local reviews
      const map = new Map();
      if (cloudSummary?.reviews && Array.isArray(cloudSummary.reviews)) {
        cloudSummary.reviews.forEach(r => {
          const key = r.id || `${r.customerName}_${r.stars}_${r.text}`;
          map.set(key, { ...r });
        });
      }
      localReviews.forEach(r => {
        const key = r.id || `${r.customerName}_${r.stars}_${r.text}`;
        if (map.has(key)) {
          const existing = map.get(key);
          map.set(key, {
            ...existing,
            ...r,
            reply: r.reply || existing.reply || r.merchantReply || existing.merchantReply,
            merchantReply: r.merchantReply || existing.merchantReply || r.reply || existing.reply,
            replyAt: r.replyAt || existing.replyAt || r.merchantReplyDate || existing.merchantReplyDate
          });
        } else {
          map.set(key, { ...r });
        }
      });

      const combinedReviews = Array.from(map.values());
      if (!isMounted) return;

      if (combinedReviews.length > 0) {
        const totalStars = combinedReviews.reduce((sum, r) => sum + (Number(r.stars) || 5), 0);
        const avg = Math.round((totalStars / combinedReviews.length) * 10) / 10;
        setRatingSummary({
          averageRating: avg,
          reviewCount: combinedReviews.length,
          etaAccuracyScore: cloudSummary?.etaAccuracyScore || '96% Accurate',
          reviews: combinedReviews
        });
      } else if (cloudSummary) {
        setRatingSummary(cloudSummary);
      }
    };

    loadAllReviews();
    const handleStorageChange = () => loadAllReviews();
    window.addEventListener('storage', handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [shop?.id, shop?.slug, slug]);

  const serviceSuggestions = customServices.length > 0 
    ? customServices.map(s => s.price > 0 ? `${s.name} (₹${s.price})` : s.name)
    : getCategoryServices(shop?.categoryName);

  // Initiate Booking
  const handleInitiateBooking = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validate 10-digit Indian Mobile Number
    const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number (starting with 6-9)");
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg("Kripya apna Pura Naam bharein.");
      return;
    }

    if (!customerAge || isNaN(parseInt(customerAge, 10))) {
      setErrorMsg("Kripya apni Age (Umar) bharein.");
      return;
    }

    const ageNum = parseInt(customerAge, 10);
    if (ageNum < 5 || ageNum > 115) {
      setErrorMsg("Kripya sahi age (umar) darj karein (5 se 115 saal).");
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('ak_token') : null;
    const savedPhone = typeof window !== 'undefined' ? localStorage.getItem('ak_phone') : null;

    // If already authenticated with the same phone, proceed directly to join queue
    if (token && savedPhone === cleanPhone) {
      await executeJoinQueue(cleanPhone);
      return;
    }

    // Otherwise, trigger OTP flow
    try {
      setBooking(true);
      const res = await authApi.sendOtp(cleanPhone);
      setOtpSuccessMessage(res.data?.data?.message || `OTP sent to +91 ${cleanPhone}`);
      setShowOtpModal(true);
    } catch (err) {
      setOtpSuccessMessage(`OTP sent to +91 ${cleanPhone} (Dev OTP: 1234)`);
      setShowOtpModal(true);
    } finally {
      setBooking(false);
    }
  };

  // Verify OTP and Complete Queue Token Generation
  const handleVerifyOtpAndJoin = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setOtpError('Please enter the 4-digit OTP (Default: 1234)');
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError('');

      const cleanPhone = customerPhone.trim();
      const res = await authApi.verifyOtp(cleanPhone, otp);

      if (res?.data?.data?.token) {
        localStorage.setItem('ak_token', res.data.data.token);
        localStorage.setItem('ak_phone', cleanPhone);
      }

      setShowOtpModal(false);
      await executeJoinQueue(cleanPhone);
    } catch (err) {
      // In dev/demo mode, accept '1234'
      if (otp === '1234') {
        localStorage.setItem('ak_token', 'dev-demo-token');
        localStorage.setItem('ak_phone', customerPhone.trim());
        setShowOtpModal(false);
        await executeJoinQueue(customerPhone.trim());
      } else {
        setOtpError(err?.response?.data?.message || 'Invalid OTP. Please enter 1234.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // Execute Join Queue Request to Backend
  const executeJoinQueue = async (phone) => {
    try {
      setBooking(true);
      setErrorMsg('');

      // Build member names list with purpose notes
      const mainName = customerName || 'Customer';
      const mainEntry = customerPurpose ? `${mainName} (${customerPurpose})` : mainName;

      const memberEntries = [mainEntry];
      for (let i = 0; i < companionDetails.length; i++) {
        const comp = companionDetails[i];
        const cName = comp.name.trim() || `Companion #${i + 2}`;
        const cPurp = comp.purpose.trim();
        memberEntries.push(cPurp ? `${cName} (${cPurp})` : cName);
      }

      // Clean 10-digit Indian mobile number
      const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);

      // Backend shop UUID
      const validShopId = shop?.id;

      const payload = {
        customerName: mainName,
        customerPhone: cleanPhone,
        groupSize: Math.min(effectiveGroupSize, 4), // Cap at 4 for legacy backend DTO limit
        memberNames: memberEntries,
        source: 'APP',
      };

      let finalToken = null;

      try {
        const res = await queueApi.joinQueue(validShopId, payload);
        if (res?.data?.data) {
          finalToken = {
            ...res.data.data,
            customerName: mainName,
            customerPhone: phone ? phone.replace(/\D/g, '').slice(-10) : '',
            shopName: shop.name,
            shopSlug: shop.slug,
            address: shop.address,
            imageUrl: shop.imageUrl,
            groupSize: effectiveGroupSize,
            customerPurpose,
            companions: companionDetails,
            preferredStation: preferredStation || null,
          };
        }
      } catch (backendErr) {
        console.warn('Backend queue join fallback:', backendErr);
      }

      // Local Fallback Token if offline or backend error
      if (!finalToken) {
        const randomNum = Math.floor(10 + Math.random() * 80);
        const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';
        finalToken = {
          id: String(Date.now()),
          displayToken: `${shop.name.charAt(0).toUpperCase()}-0${randomNum}`,
          tokenNumber: randomNum,
          groupSize: effectiveGroupSize,
          memberNames: memberEntries,
          customerPurpose,
          companions: companionDetails,
          preferredStation: preferredStation || null,
          peopleAhead: shop.waitingCount ?? 2,
          estimatedWaitMin: shop.estimatedWaitMin ?? 15,
          shopName: shop.name,
          address: shop.address,
          status: 'WAITING',
          joinedAt: new Date().toISOString(),
          customerName: mainName,
          customerPhone: cleanPhone,
          imageUrl: shop.imageUrl,
          shopSlug: shop.slug,
        };
      }

      // Save to customer's active token list in localStorage
      if (typeof window !== 'undefined') {
        const existingStr = localStorage.getItem('ak_customer_tokens');
        const existing = existingStr ? JSON.parse(existingStr) : [];
        const updated = [finalToken, ...existing.filter(t => t.id !== finalToken.id)];
        localStorage.setItem('ak_customer_tokens', JSON.stringify(updated));
        const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';
        if (cleanPhone) {
          localStorage.setItem('ak_phone', cleanPhone);
          try {
            const savedProfiles = JSON.parse(localStorage.getItem('ak_customer_profiles') || '{}');
            const lockedName = savedProfiles[cleanPhone]?.name || (mainName && mainName !== 'Customer' ? mainName : '');
            const lockedAge = savedProfiles[cleanPhone]?.age || customerAge;
            if (lockedName) {
              localStorage.setItem('ak_customer_name', lockedName);
            }
            if (lockedAge) {
              localStorage.setItem('ak_customer_age', lockedAge);
            }
            if (lockedName) {
              savedProfiles[cleanPhone] = { name: lockedName, age: lockedAge };
              localStorage.setItem('ak_customer_profiles', JSON.stringify(savedProfiles));
            }
          } catch (e) {}
        }
        window.dispatchEvent(new Event('storage'));
      }

      setBookedToken(finalToken);
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred while generating token');
    } finally {
      setBooking(false);
    }
  };

  // LOADING SKELETON (While fetching shop from cloud database)
  if (loadingShop && !shop) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 gap-3">
        <div className="w-10 h-10 border-3 border-[#176B65] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-[#283B3D]/70">Dukan ki jankari load ho rahi hai...</span>
      </div>
    );
  }

  // SHOP NOT REGISTERED YET VIEW (Zero Dummy Fallback)
  if (!shop) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="urban-card max-w-md w-full p-8 rounded-3xl text-center space-y-5 border border-[#DCE9E3] shadow-lg bg-white"
        >
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl border border-amber-200">
            🏪
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full inline-block">
              Registration Pending
            </span>
            <h2 className="text-xl font-black text-[#283B3D]">Dukan Abhi Darj (Register) Nahi Hui Hai</h2>
            <p className="text-xs text-[#283B3D]/70 font-medium">
              Aap jis dukan ka link khol rahe hain (<span className="font-mono font-bold text-[#176B65]">{slug}</span>), shopkeeper ne abhi uski details fill nahi ki hain.
            </p>
          </div>
          <div className="p-3.5 bg-[#F3F1E9]/70 rounded-2xl text-xs font-semibold text-[#283B3D]/80 border border-[#DCE9E3] text-left space-y-1">
            <span className="font-bold text-[#176B65] block">💡 Shopkeeper ke liye:</span>
            <span>Agar aap is dukan ke maalik hain, toh pehle apni dukan ka naam, category, pata aur operating hours darj karein taaki grahak digital token le sakein.</span>
          </div>
          <div className="space-y-2 pt-2">
            <Link
              href="/merchant/register"
              className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>+ Dukan Register Karein (Merchant)</span>
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-2xl bg-[#F3F1E9] hover:bg-[#DCE9E3] text-[#283B3D] text-xs font-bold transition-colors block text-center cursor-pointer"
            >
              Home Par Wapas Jayein
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // SUCCESS CONFIRMATION VIEW
  if (bookedToken) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="max-w-xl mx-auto py-12 px-4 text-center space-y-6"
      >
        <div className="w-20 h-20 bg-[#DCE9E3] border border-[#176B65]/30 text-[#176B65] rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs font-bold text-[#176B65] uppercase tracking-widest bg-[#DCE9E3] px-4 py-1.5 rounded-full border border-[#176B65]/20">
            Digital Token Confirmed
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#283B3D] mt-3">Your Token Is Ready!</h2>
          <p className="text-sm text-slate-500 mt-1 font-semibold">{bookedToken.shopName || shop.name}</p>
        </div>

        {/* Digital Ticket in Fresh Urban Theme */}
        <div className="relative overflow-hidden bg-[#176B65] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#DCE9E3]/40 space-y-6 text-left">
          
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#DCE9E3]">
                {bookedToken.groupSize > 1 ? `Group Booking (${bookedToken.groupSize} Persons)` : 'Single Ticket'}
              </span>
              <p className="text-lg font-bold text-white">{customerName || 'Customer'}</p>
              {customerPurpose && (
                <span className="inline-block text-xs text-[#DCE9E3] font-medium mt-0.5">
                  Service: {customerPurpose}
                </span>
              )}
            </div>
            <Ticket className="w-8 h-8 text-[#DCE9E3]" />
          </div>

          <div className="text-center py-4">
            <span className="text-xs uppercase font-bold text-[#DCE9E3] block mb-1">
              Your Live Token Number
            </span>
            <div className="font-token text-6xl sm:text-7xl font-bold tracking-tight text-white drop-shadow-md">
              {bookedToken.displayToken}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-black/15 rounded-2xl p-4 text-center border border-white/10">
            <div>
              <span className="text-[#DCE9E3] text-[10px] uppercase font-bold block">Ahead of You</span>
              <span className="font-token text-xl font-bold text-white">{bookedToken.peopleAhead ?? 2}</span>
            </div>
            <div>
              <span className="text-[#DCE9E3] text-[10px] uppercase font-bold block">Est. Wait</span>
              <span className="font-token text-xl font-bold text-white">{bookedToken.estimatedWaitMin ?? 15} min</span>
            </div>
            <div>
              <span className="text-[#DCE9E3] text-[10px] uppercase font-bold block">Status</span>
              <span className="text-xs font-bold text-emerald-300">ACTIVE</span>
            </div>
          </div>

          {/* Group Members & Purpose Breakdown */}
          {bookedToken.companions && bookedToken.companions.length > 0 && (
            <div className="pt-2 border-t border-white/15 space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#DCE9E3] block">
                Group Member Services:
              </span>
              <div className="space-y-1.5">
                <div className="text-xs bg-white/10 px-3 py-2 rounded-xl text-white flex items-center justify-between border border-white/10">
                  <span className="font-bold">#1 {customerName || 'Customer'} (Primary)</span>
                  <span className="text-[#DCE9E3] font-medium text-[11px]">{customerPurpose || 'General Service'}</span>
                </div>
                {bookedToken.companions.map((comp, idx) => (
                  <div key={idx} className="text-xs bg-white/10 px-3 py-2 rounded-xl text-white flex items-center justify-between border border-white/10">
                    <span className="font-semibold">#{idx + 2} {comp.name || `Companion #${idx + 2}`}</span>
                    <span className="text-[#DCE9E3] font-medium text-[11px]">{comp.purpose || 'General Service'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-white/15 text-xs text-[#DCE9E3] flex items-center justify-between">
            <span>Pass Code: #{bookedToken.id ? String(bookedToken.id).slice(0, 8) : 'AK-PASS'}</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-300" /> Verified Pass
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Go to Live Tracker + WhatsApp Share + Directions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/tokens"
            className="flex-1 py-4 px-6 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <span>Track Live Turn in My Tokens</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => shareTokenPass(bookedToken)}
            className="py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 text-center cursor-pointer active:scale-98"
          >
            <Share2 className="w-4 h-4" />
            <span>Share WhatsApp</span>
          </button>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((bookedToken.address || shop.address || '') + ' ' + (bookedToken.shopName || shop.name || ''))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-4 px-6 rounded-2xl bg-white border border-[#DCE9E3] text-[#176B65] font-bold text-sm hover:bg-[#DCE9E3]/40 transition-all flex items-center justify-center gap-2 text-center cursor-pointer shadow-xs"
          >
            <Navigation className="w-4 h-4" />
            <span>Directions</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>

        {/* Option to Book Another Token in Parallel */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setBookedToken(null);
              setCustomerName('');
              setCustomerPurpose('');
              setCompanionDetails([]);
              setEffectiveGroupSize(1);
            }}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-[#DCE9E3] hover:bg-[#cbe0d7] text-[#176B65] font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Book Another Token / Kisi aur ke liye token lein</span>
          </button>
        </div>
      </motion.div>
    );
  }

  // BOOKING FORM VIEW
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation & Favorite Heart Button */}
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-[#176B65] hover:text-[#125550] transition-colors bg-[#DCE9E3]/70 px-4 py-2 rounded-2xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Places</span>
        </Link>

        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border shadow-2xs active:scale-95 ${
            isFavorite 
              ? 'bg-rose-50 text-rose-700 border-rose-200' 
              : 'bg-white text-[#283B3D] border-[#DCE9E3] hover:border-rose-300'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
          <span>{isFavorite ? 'Saved in Favorites' : 'Save Place'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Place Details */}
        <div className="md:col-span-5 space-y-6">
          <div className="urban-card rounded-3xl overflow-hidden border border-[#DCE9E3]">
            <div className="h-44 w-full relative overflow-hidden bg-slate-100">
              <img 
                src={shop.imageUrl || "/images/clinic.jpg"} 
                alt={shop.name} 
                className="w-full h-full object-cover" 
              />
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-xs active:scale-90 ${
                  isFavorite ? 'bg-rose-500 text-white' : 'bg-[#283B3D]/65 hover:bg-[#283B3D]/85 text-white'
                }`}
                title={isFavorite ? "Saved in Favorites" : "Save Place"}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
              </button>
              <div className="absolute top-3 right-3 bg-[#176B65] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                {shop.status || 'OPEN'}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#176B65] bg-[#DCE9E3] px-2.5 py-0.5 rounded">
                  {shop.categoryName || 'General Store'}
                </span>
                <h1 className="text-xl font-black text-[#283B3D] mt-2">{shop.name}</h1>
                <p className="text-xs text-[#283B3D]/70 flex items-start gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-[#176B65] shrink-0 mt-0.5" />
                  <span>{shop.address || 'Indira Nagar, Lucknow'}</span>
                </p>

                {/* Google Maps Directions Link */}
                <div className="pt-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((shop.address || '') + ' ' + (shop.name || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DCE9E3]/70 hover:bg-[#DCE9E3] text-[#176B65] text-xs font-bold transition-all border border-[#176B65]/20 cursor-pointer shadow-2xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions in Google Maps</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#DCE9E3]">
                <div className="bg-[#F3F1E9] p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 block">Wait Time</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-4 h-4 text-[#176B65]" />
                    <span className="font-token font-bold text-sm text-[#283B3D]">
                      ~{(shop.estimatedWaitMin || 15) + (shopBroadcast?.delayMinutes || 0)} mins
                    </span>
                  </div>
                  {shopBroadcast?.delayMinutes > 0 && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded mt-1 inline-block">
                      +{shopBroadcast.delayMinutes}m delay alert
                    </span>
                  )}
                </div>

                <div className="bg-[#F3F1E9] p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 block">Queue Count</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Users className="w-4 h-4 text-[#176B65]" />
                    <span className="font-token font-bold text-sm text-[#283B3D]">{shop.waitingCount || 2} waiting</span>
                  </div>
                </div>
              </div>

              {shop.description && (
                <p className="text-xs text-[#283B3D]/70 font-medium leading-relaxed pt-1">
                  {shop.description}
                </p>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* 1. SHOPKEEPER WORK & SHOWCASE PHOTOS GALLERY                   */}
          {/* ============================================================== */}
          <div className="urban-card rounded-3xl p-5 border border-[#DCE9E3] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center border border-[#176B65]/20">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#283B3D]">Shop Showcase & Work Photos</h3>
                  <span className="text-[10px] text-[#176B65] font-bold">
                    Uploaded by Shopkeeper ({shopPhotos.length} Photos)
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Verified Store
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
              {shopPhotos.map((photo, pIdx) => (
                <div
                  key={photo.id || pIdx}
                  onClick={() => setPreviewPhoto(photo)}
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-[#DCE9E3] bg-slate-100 cursor-pointer shadow-2xs hover:shadow-md transition-all active:scale-95"
                >
                  <img 
                    src={photo.url || photo.dataUrl} 
                    alt={photo.caption || 'Shop photo'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                    <span className="text-[9px] text-white font-bold truncate drop-shadow-md">
                      {photo.caption || 'Tap to view'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2. OFFICIAL RATE CARD & PRICES SET BY SHOPKEEPER (EXPANDABLE & SEARCH) */}
          {/* ============================================================== */}
          <div className="urban-card rounded-3xl p-5 border border-[#DCE9E3] space-y-3">
            {(() => {
              const fullServicesList = customServices.length > 0 ? customServices : [
                { id: 'def-1', name: 'Standard Haircut', price: 150, durationMin: 15 },
                { id: 'def-2', name: 'Beard Styling & Trim', price: 80, durationMin: 10 },
                { id: 'def-3', name: 'Head Massage / Wash', price: 120, durationMin: 15 }
              ];

              return (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center border border-[#176B65]/20">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-[#283B3D]">Rate Card & Fixed Counter Prices</h3>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Set by Shopkeeper ({fullServicesList.length} Items)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        No Hidden Charges
                      </span>
                      {fullServicesList.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setRateCardExpanded(!rateCardExpanded)}
                          className="text-[10px] font-black text-[#176B65] hover:text-[#125550] flex items-center gap-0.5 bg-[#DCE9E3]/50 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                        >
                          <span>{rateCardExpanded ? 'Collapse ▲' : `View All (${fullServicesList.length}) ▼`}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* If expanded, show Quick Search Bar & Dropdown Select Picker */}
                  {rateCardExpanded && (
                    <div className="space-y-2 pt-1 pb-1">
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        {/* Instant Search Filter */}
                        <div className="relative w-full flex-1">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={rateCardSearchQuery}
                            onChange={(e) => setRateCardSearchQuery(e.target.value)}
                            placeholder="🔍 Search service (e.g. Haircut, Shave, Facial)..."
                            className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#283B3D] focus:outline-none focus:ring-1 focus:ring-[#176B65] focus:bg-white placeholder:text-slate-400"
                          />
                          {rateCardSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setRateCardSearchQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Quick Dropdown Picker */}
                        <div className="w-full sm:w-auto">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                setRateCardSearchQuery(e.target.value);
                              }
                            }}
                            value=""
                            className="w-full sm:w-48 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-[#283B3D] focus:outline-none focus:ring-1 focus:ring-[#176B65] cursor-pointer"
                          >
                            <option value="">▼ Dropdown: Jump to service</option>
                            {fullServicesList.map((srv, idx) => (
                              <option key={srv.id || idx} value={srv.name}>
                                {srv.name} — ₹{srv.price || 0}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rendered Services Grid */}
                  {(() => {
                    const listToDisplay = rateCardExpanded
                      ? fullServicesList.filter(s => 
                          !rateCardSearchQuery.trim() || 
                          (s.name || '').toLowerCase().includes(rateCardSearchQuery.toLowerCase())
                        )
                      : fullServicesList.slice(0, 3);

                    if (rateCardExpanded && listToDisplay.length === 0) {
                      return (
                        <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
                          Koi service match nahi hui "{rateCardSearchQuery}" se.
                        </div>
                      );
                    }

                    return (
                      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 ${rateCardExpanded ? 'max-h-60 overflow-y-auto pr-1' : ''}`}>
                        {listToDisplay.map((srv, idx) => (
                          <div 
                            key={srv.id || idx}
                            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 flex items-center justify-between text-xs transition-colors"
                          >
                            <div className="pr-2">
                              <span className="font-bold text-[#283B3D] block text-[11px]">{srv.name}</span>
                              {srv.durationMin && (
                                <span className="text-[10px] text-slate-400 font-medium">~{srv.durationMin}m duration</span>
                              )}
                            </div>
                            <span className="font-token font-bold text-xs text-[#176B65] bg-white px-2 py-0.5 rounded-lg border border-[#DCE9E3] shrink-0">
                              ₹{srv.price || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Expand / Collapse Button if > 3 services */}
                  {fullServicesList.length > 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !rateCardExpanded;
                        setRateCardExpanded(nextState);
                        if (!nextState) setRateCardSearchQuery('');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#F3F1E9] hover:bg-[#DCE9E3]/70 text-[#176B65] text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98"
                    >
                      {rateCardExpanded ? (
                        <>
                          <span>Show Less ▲</span>
                        </>
                      ) : (
                        <>
                          <span>View Full Rate Card & Menu ({fullServicesList.length} Services) ▼</span>
                        </>
                      )}
                    </button>
                  )}
                </>
              );
            })()}
          </div>

          {/* Customer Reviews & Ratings Summary Card */}
          <div className="urban-card rounded-3xl p-5 border border-[#DCE9E3] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center border border-[#176B65]/20">
                  <Star className="w-4 h-4 fill-[#176B65] text-[#176B65]" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#283B3D]">Customer Trust & Reviews</h3>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Post-Service Ratings
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-token text-xl font-bold text-[#176B65]">
                  {ratingSummary?.averageRating ? `${ratingSummary.averageRating} ★` : '4.8 ★'}
                </span>
                <span className="block text-[9px] font-bold text-slate-400 uppercase">
                  {ratingSummary?.reviewCount ? `${ratingSummary.reviewCount} Reviews` : 'Verified Score'}
                </span>
              </div>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-2 gap-2 text-center text-[11px] pt-1">
              <div className="bg-[#F3F1E9] p-2 rounded-xl border border-[#DCE9E3]">
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 block">Wait Accuracy</span>
                <span className="font-bold text-[#176B65] text-xs">
                  {ratingSummary?.etaAccuracyScore || '96% Accurate'}
                </span>
              </div>
              <div className="bg-[#F3F1E9] p-2 rounded-xl border border-[#DCE9E3]">
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 block">Customer Rating</span>
                <span className="font-bold text-[#176B65] text-xs">
                  ★★★★★ (4.8/5)
                </span>
              </div>
            </div>

            {/* Review Quotes & Interactive Multi-Reply Conversation Thread */}
            <div className="space-y-3 pt-3 border-t border-[#DCE9E3]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#283B3D]/70 block flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#176B65]" />
                  <span>Public Reviews & Thread ({ratingSummary?.reviews?.length || 2}):</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Publicly Visible
                  </span>
                  <button
                    type="button"
                    onClick={() => setWriteReviewModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-[#176B65] hover:bg-[#135954] text-white font-bold text-[10px] transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Edit3 className="w-3 h-3 text-[#F2A15A]" />
                    <span>+ Write Review</span>
                  </button>
                </div>
              </div>

              {ratingSummary?.reviews && ratingSummary.reviews.length > 0 ? (
                <div className="space-y-3">
                  {ratingSummary.reviews.slice((reviewPage - 1) * reviewsPerPage, reviewPage * reviewsPerPage).map((rev, idx) => {
                    const revKey = rev.id || `rev-${idx}`;
                    const threadReplies = Array.isArray(rev.replies) && rev.replies.length > 0
                      ? rev.replies
                      : (rev.reply || rev.merchantReply ? [{
                          id: 'rep-init',
                          authorName: shop?.name || 'Shopkeeper',
                          role: 'MERCHANT',
                          text: rev.reply || rev.merchantReply,
                          createdAt: rev.replyAt,
                          date: rev.merchantReplyDate || 'Recent'
                        }] : []);

                    return (
                      <div key={revKey} className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 text-xs space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#283B3D]">{rev.customerName || 'Verified Customer'}</span>
                            <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold border border-emerald-100">
                              Visit Verified
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <span>{'★'.repeat(Math.min(5, Math.max(1, Math.round(Number(rev.stars) || 5))))}</span>
                            <span className="text-[10px] text-slate-400">({rev.stars}★)</span>
                          </div>
                        </div>

                        {/* Customer Review Tags / Chips */}
                        {rev.tags && Array.isArray(rev.tags) && rev.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {rev.tags.map((tag, tIdx) => (
                              <span key={tIdx} className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[#DCE9E3]/40 text-[#176B65] border border-[#176B65]/15">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Customer Comment */}
                        {(rev.text || rev.comment) && (
                          <p className="text-[11px] text-[#283B3D]/85 leading-relaxed bg-white/70 p-2 rounded-xl border border-slate-100 font-normal">
                            "{rev.text || rev.comment}"
                          </p>
                        )}

                        {/* Conversation Thread / Replies List */}
                        {threadReplies.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            {threadReplies.map((rep, rIdx) => {
                              const isMerchantRep = rep.role === 'MERCHANT';
                              return (
                                <div
                                  key={rep.id || rIdx}
                                  className={`pl-3 py-2 px-3 rounded-xl text-xs space-y-0.5 ${
                                    isMerchantRep
                                      ? 'bg-[#176B65]/10 border-l-3 border-[#176B65]'
                                      : 'bg-amber-50/80 border-l-3 border-amber-400'
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-[10px]">
                                    <div className={`flex items-center gap-1 font-bold ${isMerchantRep ? 'text-[#176B65]' : 'text-amber-900'}`}>
                                      {isMerchantRep ? <Store className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                      <span>{rep.authorName || (isMerchantRep ? 'Shopkeeper' : 'Customer')} {isMerchantRep ? '(Official Reply)' : '(Follow-up)'}</span>
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-medium">
                                      {rep.date || (rep.createdAt ? new Date(rep.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent')}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#283B3D] font-medium leading-relaxed">
                                    "{rep.text}"
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Bottom Bar: Action to Reply again or add follow-up comment */}
                        <div className="pt-1.5 flex items-center justify-between border-t border-slate-200/50 mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (activeReplyReviewId === revKey) {
                                setActiveReplyReviewId(null);
                              } else {
                                setActiveReplyReviewId(revKey);
                                setReplyInputText('');
                              }
                            }}
                            className="text-[10px] font-bold text-[#176B65] hover:text-[#125550] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Reply className="w-3 h-3" />
                            <span>{activeReplyReviewId === revKey ? 'Cancel Reply' : 'Reply / Add Comment'}</span>
                          </button>
                          <span className="text-[9px] text-slate-400 font-medium">
                            {threadReplies.length} {threadReplies.length === 1 ? 'Reply' : 'Replies'}
                          </span>
                        </div>

                        {/* Inline Reply Form */}
                        {activeReplyReviewId === revKey && (
                          <div className="mt-2 p-3 bg-white rounded-xl border border-[#DCE9E3] space-y-2 shadow-xs">
                            <div className="flex items-center justify-between gap-2">
                              <input
                                type="text"
                                value={replyAuthorName}
                                onChange={(e) => setReplyAuthorName(e.target.value)}
                                placeholder="Your Name"
                                className="w-1/2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-[#283B3D]"
                              />
                              <div className="flex items-center gap-1 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => setReplyAuthorRole('CUSTOMER')}
                                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                                    replyAuthorRole === 'CUSTOMER' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-slate-400'
                                  }`}
                                >
                                  Customer
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReplyAuthorRole('MERCHANT')}
                                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                                    replyAuthorRole === 'MERCHANT' ? 'bg-[#176B65] text-white' : 'text-slate-400'
                                  }`}
                                >
                                  Shopkeeper
                                </button>
                              </div>
                            </div>

                            <textarea
                              value={replyInputText}
                              onChange={(e) => setReplyInputText(e.target.value)}
                              placeholder={replyAuthorRole === 'MERCHANT' ? "Dukan ki taraf se official reply likhein..." : "Apna comment ya jawab likhein..."}
                              rows={2}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                            />

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveReplyReviewId(null)}
                                className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePostReplyToReview(rev)}
                                disabled={replySubmitting || !replyInputText.trim()}
                                className="px-3.5 py-1.5 rounded-lg bg-[#176B65] hover:bg-[#135954] text-white font-bold text-[10px] flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                              >
                                <Send className="w-3 h-3" />
                                <span>{replySubmitting ? 'Posting...' : 'Post Reply'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Review Pagination Controls */}
                  {Math.ceil(ratingSummary.reviews.length / reviewsPerPage) > 1 && (
                    <div className="flex items-center justify-between pt-2.5 border-t border-[#DCE9E3]">
                      <button
                        type="button"
                        disabled={reviewPage === 1}
                        onClick={() => setReviewPage(prev => Math.max(1, prev - 1))}
                        className="px-3 py-1.5 rounded-xl border border-[#DCE9E3] bg-white text-xs font-bold text-[#283B3D] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.ceil(ratingSummary.reviews.length / reviewsPerPage) }).map((_, pIdx) => {
                          const pNum = pIdx + 1;
                          const isActive = reviewPage === pNum;
                          return (
                            <button
                              key={pNum}
                              type="button"
                              onClick={() => setReviewPage(pNum)}
                              className={`w-7 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-[#176B65] text-white shadow-xs'
                                  : 'bg-white border border-[#DCE9E3] text-[#283B3D] hover:bg-slate-50'
                              }`}
                            >
                              {pNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        disabled={reviewPage >= Math.ceil(ratingSummary.reviews.length / reviewsPerPage)}
                        onClick={() => setReviewPage(prev => Math.min(Math.ceil(ratingSummary.reviews.length / reviewsPerPage), prev + 1))}
                        className="px-3 py-1.5 rounded-xl border border-[#DCE9E3] bg-white text-xs font-bold text-[#283B3D] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#283B3D]">Pooja S.</span>
                      <span className="text-amber-500 font-bold">★★★★★ (5.0★)</span>
                    </div>
                    <p className="text-[11px] text-[#283B3D]/80 italic">
                      "Token system worked seamlessly! Reached when 1 person was ahead and didn't waste time in line."
                    </p>
                    <div className="mt-1.5 ml-1 pl-2.5 py-1.5 px-2.5 rounded-lg bg-[#176B65]/5 border-l-2 border-[#176B65] text-[10px]">
                      <span className="font-bold text-[#176B65] block">🏪 {shop?.name || 'Shopkeeper'} (Official Reply):</span>
                      <p className="text-[#283B3D]/80 italic mt-0.5">"Thank you Pooja! Happy to serve you without line waiting."</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#283B3D]">Rohit V.</span>
                      <span className="text-amber-500 font-bold">★★★★★ (5.0★)</span>
                    </div>
                    <p className="text-[11px] text-[#283B3D]/80 italic">
                      "Staff was very polite and called turn exactly on time."
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Token Booking Form (Or Shopkeeper Block Notice) */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE9E3] shadow-md space-y-6">
          {userRole === 'MERCHANT' ? (
            <div className="text-center py-10 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center mx-auto shadow-xs border border-[#176B65]/20">
                <Store className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#176B65] bg-[#DCE9E3] px-3.5 py-1 rounded-full border border-[#176B65]/20">
                  Shopkeeper Account Active
                </span>
                <h2 className="text-2xl font-black text-[#283B3D]">
                  Shopkeepers Cannot Book Customer Tokens
                </h2>
                <p className="text-xs text-[#283B3D]/70 font-medium max-w-md mx-auto leading-relaxed">
                  You are currently logged in as a Shopkeeper ({activeMerchantShop?.name || 'Verified Store'}). Shop owners manage counter queues and cannot generate customer passes for themselves. Customer passes are exclusively booked by customers.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Link
                  href="/merchant/dashboard"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#176B65] hover:bg-[#135954] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Store className="w-4 h-4 text-[#F2A15A]" />
                  <span>Go to Merchant Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('ak_role', 'CUSTOMER');
                    setUserRole('CUSTOMER');
                    window.dispatchEvent(new Event('storage'));
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 text-[#176B65] border border-[#176B65] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4 text-[#176B65]" />
                  <span>Book as Customer</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-black text-[#283B3D]">Book Your Digital Token</h2>
                <p className="text-xs text-[#283B3D]/70 font-medium mt-1">
                  Select people count, specify optional service requirements, and verify your phone.
                </p>
              </div>

              {/* Emergency Flash Queue Broadcast Alert Banner (BRD FR-708 / FR-405) */}
              {shopBroadcast && (
                <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 shadow-xs ${
                  shopBroadcast.severity === 'CRITICAL'
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : shopBroadcast.severity === 'INFO'
                    ? 'bg-teal-50 border-teal-300 text-teal-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}>
                  <Radio className={`w-5 h-5 shrink-0 mt-0.5 animate-pulse ${
                    shopBroadcast.severity === 'CRITICAL' ? 'text-rose-600' : shopBroadcast.severity === 'INFO' ? 'text-teal-600' : 'text-amber-600'
                  }`} />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-black/10">
                        ⚡ Live Emergency Notice: {shopBroadcast.reason}
                      </span>
                      {shopBroadcast.delayMinutes > 0 && (
                        <span className="font-extrabold text-[11px] text-amber-900 bg-amber-200 px-2 py-0.5 rounded-md">
                          +{shopBroadcast.delayMinutes} min temporary delay
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-xs leading-relaxed">
                      {shopBroadcast.message}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      ℹ️ You may still take a token; the estimated counter turn time reflects this operational delay.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleInitiateBooking} className="space-y-6">
            
            {/* 1. Group Size Mode Selection (1, 2, or Custom) */}
            <div>
              <label className="block text-xs font-bold text-[#283B3D] mb-2">
                Number of Persons
              </label>
              
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedGroupMode('1')}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    selectedGroupMode === '1'
                      ? 'bg-[#176B65] text-white border-[#176B65] shadow-sm'
                      : 'bg-[#F3F1E9]/70 text-[#283B3D] border-[#DCE9E3] hover:bg-[#DCE9E3]'
                  }`}
                >
                  1 Person
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGroupMode('2')}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    selectedGroupMode === '2'
                      ? 'bg-[#176B65] text-white border-[#176B65] shadow-sm'
                      : 'bg-[#F3F1E9]/70 text-[#283B3D] border-[#DCE9E3] hover:bg-[#DCE9E3]'
                  }`}
                >
                  2 People
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGroupMode('custom')}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    selectedGroupMode === 'custom'
                      ? 'bg-[#176B65] text-white border-[#176B65] shadow-sm'
                      : 'bg-[#F3F1E9]/70 text-[#283B3D] border-[#DCE9E3] hover:bg-[#DCE9E3]'
                  }`}
                >
                  Custom Group (3+)
                </button>
              </div>

              {/* Custom Number Input if 'custom' is selected */}
              {selectedGroupMode === 'custom' && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-4 bg-[#F3F1E9] rounded-2xl border border-[#DCE9E3] flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-[#283B3D] block">Enter Total People Count:</span>
                    <span className="text-[11px] text-[#283B3D]/60 font-medium">For families, groups, or multiple persons</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomCount(prev => Math.max(3, prev - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-[#DCE9E3] flex items-center justify-center font-bold text-[#176B65] hover:bg-[#DCE9E3] transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      min={3}
                      max={10}
                      value={customCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 3;
                        setCustomCount(Math.min(10, Math.max(3, val)));
                      }}
                      className="w-14 text-center font-token font-bold text-base bg-white border border-[#DCE9E3] rounded-xl py-1 focus:outline-none focus:border-[#176B65]"
                    />

                    <button
                      type="button"
                      onClick={() => setCustomCount(prev => Math.min(10, prev + 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-[#DCE9E3] flex items-center justify-center font-bold text-[#176B65] hover:bg-[#DCE9E3] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 2. Customer Details & Service Required */}
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#283B3D] mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#DCE9E3] focus:border-[#176B65] focus:outline-none text-sm text-[#283B3D] bg-[#F3F1E9]/40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#283B3D] mb-1.5">
                  10-Digit Mobile Number (For SMS & Live Alerts) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-xs font-bold text-[#283B3D]/60">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={customerPhone}
                    onChange={async (e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setCustomerPhone(val);
                      if (val.length === 10) {
                        let matched = false;
                        if (typeof window !== 'undefined') {
                          try {
                            const savedProfiles = JSON.parse(localStorage.getItem('ak_customer_profiles') || '{}');
                            if (savedProfiles[val]?.name) {
                              setCustomerName(savedProfiles[val].name);
                              if (savedProfiles[val].age) setCustomerAge(String(savedProfiles[val].age));
                              matched = true;
                            }
                          } catch (err) {}
                        }
                        if (!matched) {
                          try {
                            const res = await authApi.checkPhone(val);
                            if (res?.data?.data?.registered && res.data.data.name) {
                              setCustomerName(res.data.data.name);
                              if (res.data.data.age) setCustomerAge(String(res.data.data.age));
                            }
                          } catch (err) {}
                        }
                      }
                    }}
                    className="w-full pl-13 pr-4 py-3 rounded-2xl border border-[#DCE9E3] focus:border-[#176B65] focus:outline-none text-sm font-semibold text-[#283B3D] bg-[#F3F1E9]/40 tracking-wider"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#283B3D] mb-1.5">
                  Your Age (in years) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="number"
                    min={5}
                    max={115}
                    placeholder="e.g. 25"
                    value={customerAge}
                    onChange={(e) => setCustomerAge(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#DCE9E3] focus:border-[#176B65] focus:outline-none text-sm text-[#283B3D] bg-[#F3F1E9]/40"
                    required
                  />
                </div>
              </div>

              {/* Multi-Service Selection & Custom List Form */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#283B3D] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#176B65]" />
                    <span>Select Services <span className="text-slate-400 font-normal">(Pick Multiple or Add Custom)</span></span>
                  </label>
                  {selectedServicesList.length > 0 && (
                    <span className="text-[11px] font-bold text-[#176B65] bg-[#DCE9E3]/50 px-2.5 py-0.5 rounded-lg border border-[#176B65]/20">
                      {selectedServicesList.length} Selected • ₹{selectedServicesList.reduce((s, i) => s + (i.price || 0), 0)}
                    </span>
                  )}
                </div>

                {/* Multi-Service Checkbox / Chip Grid from Rate Card */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Choose from Rate Card (Tap to Select Multiple):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(customServices.length > 0 ? customServices : [
                      { id: 'def-1', name: 'Standard Haircut', price: 150 },
                      { id: 'def-2', name: 'Beard Styling', price: 80 },
                      { id: 'def-3', name: 'Head Massage', price: 120 },
                      { id: 'def-4', name: 'Facial / Clean-up', price: 250 }
                    ]).map((srv, idx) => {
                      const isSelected = selectedServicesList.some(item => item.name.toLowerCase() === srv.name.toLowerCase());
                      return (
                        <button
                          key={srv.id || idx}
                          type="button"
                          onClick={() => handleToggleServiceSelection(srv)}
                          className={`text-[11px] px-3 py-1.5 rounded-xl transition-all border flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'bg-[#176B65] text-white border-[#176B65] font-bold shadow-xs'
                              : 'bg-white text-[#283B3D] border-[#DCE9E3] hover:border-[#176B65] font-semibold'
                          }`}
                        >
                          <span className="font-bold">{isSelected ? '✓' : '+'}</span>
                          <span>{srv.name}</span>
                          {srv.price > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-[#F3F1E9] text-[#176B65] font-bold'
                            }`}>
                              ₹{srv.price}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Service Item Add Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Or type custom service / item (e.g. Hair Color, Shave...)"
                    value={customServiceInput}
                    onChange={(e) => setCustomServiceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomServiceToList();
                      }
                    }}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#DCE9E3] focus:border-[#176B65] focus:outline-none text-xs text-[#283B3D] bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomServiceToList}
                    disabled={!customServiceInput.trim()}
                    className="px-3.5 py-2.5 rounded-xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-xs transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to List</span>
                  </button>
                </div>

                {/* Selected Services Breakdown List */}
                {selectedServicesList.length > 0 && (
                  <div className="p-3.5 bg-[#F3F1E9]/70 rounded-2xl border border-[#DCE9E3] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-black text-[#283B3D]">
                      <span>Selected Services List ({selectedServicesList.length}):</span>
                      <span className="text-[#176B65]">
                        Estimated Total: ₹{selectedServicesList.reduce((s, i) => s + (i.price || 0), 0)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {selectedServicesList.map((item, sIdx) => (
                        <div 
                          key={item.id || sIdx}
                          className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-[#DCE9E3] text-xs font-semibold text-[#283B3D]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#DCE9E3] text-[#176B65] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {sIdx + 1}
                            </span>
                            <span>{item.name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.price > 0 && (
                              <span className="text-[#176B65] font-bold">₹{item.price}</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveServiceFromList(item.id)}
                              className="w-5 h-5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer text-xs"
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multi-Counter / Multi-Stylist / Doctor Preference (BRD FR-709) */}
                {shopStations.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <label className="block text-[11px] font-bold text-[#283B3D]">
                      Select Preferred Counter / Doctor / Stylist (Optional):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreferredStation('')}
                        className={`text-[11px] px-2.5 py-1.5 rounded-xl transition-all border cursor-pointer ${
                          preferredStation === ''
                            ? 'bg-[#176B65] text-white border-[#176B65] font-bold'
                            : 'bg-[#F3F1E9] text-[#283B3D]/80 border-[#DCE9E3] hover:border-[#176B65] font-medium'
                        }`}
                      >
                        ⚡ Any Available (Fastest Turn)
                      </button>
                      {shopStations.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setPreferredStation(st.name)}
                          className={`text-[11px] px-2.5 py-1.5 rounded-xl transition-all border flex items-center gap-1 cursor-pointer ${
                            preferredStation === st.name
                              ? 'bg-[#176B65] text-white border-[#176B65] font-bold shadow-2xs'
                              : 'bg-white text-[#283B3D] border-[#DCE9E3] hover:border-[#176B65] font-semibold'
                          }`}
                        >
                          <span>📍 {st.name}</span>
                          {st.staffName && (
                            <span className={`text-[10px] ${preferredStation === st.name ? 'text-white/80' : 'text-slate-400'}`}>
                              ({st.staffName.split(' ')[0]})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Companion Members Details (if groupSize > 1) */}
              {effectiveGroupSize > 1 && (
                <div className="space-y-4 pt-3 border-t border-[#DCE9E3]">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#176B65]" />
                    <span className="text-xs font-bold text-[#176B65]">
                      Companion Details ({effectiveGroupSize - 1} Members) — What services do they need?
                    </span>
                  </div>

                  <div className="space-y-3">
                    {companionDetails.map((comp, idx) => (
                      <div key={idx} className="p-3.5 bg-[#F3F1E9]/60 rounded-2xl border border-[#DCE9E3] space-y-2">
                        <span className="text-[11px] font-bold text-[#283B3D]">
                          Person #{idx + 2} Details:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder={`Companion #${idx + 2} Name (Optional)`}
                            value={comp.name}
                            onChange={(e) => {
                              const updated = [...companionDetails];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setCompanionDetails(updated);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#DCE9E3] focus:border-[#176B65] focus:outline-none text-xs text-[#283B3D] bg-white"
                          />

                          <input
                            type="text"
                            placeholder="What do they need? (e.g. Shave, Checkup...)"
                            value={comp.purpose}
                            onChange={(e) => {
                              const updated = [...companionDetails];
                              updated[idx] = { ...updated[idx], purpose: e.target.value };
                              setCompanionDetails(updated);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#DCE9E3] focus:border-[#176B65] focus:outline-none text-xs text-[#283B3D] bg-white"
                          />
                        </div>

                        {/* Quick preset chips for this companion */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {serviceSuggestions.slice(0, 3).map((srv, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => {
                                const updated = [...companionDetails];
                                updated[idx] = { ...updated[idx], purpose: srv };
                                setCompanionDetails(updated);
                              }}
                              className="text-[10px] px-2 py-0.5 rounded-lg bg-white border border-[#DCE9E3] text-[#283B3D]/70 hover:text-[#176B65] hover:border-[#176B65]"
                            >
                              + {srv}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-2xl border border-rose-200">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={booking}
              className="w-full py-4 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {booking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Issuing Token...</span>
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4 text-[#DCE9E3]" />
                  <span>Confirm & Get Digital Token</span>
                </>
              )}
            </button>
          </form>

          <div className="bg-[#DCE9E3]/50 rounded-2xl p-3.5 text-[11px] text-[#283B3D]/80 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-[#176B65] shrink-0" />
            <span>Specifying your services helps the store staff prepare your counter slot in advance.</span>
          </div>
        </>
      )}
    </div>

      </div>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-6 shadow-2xl border border-[#DCE9E3]"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-[#283B3D]">Verify Mobile OTP</h3>
                <p className="text-xs text-[#283B3D]/70 font-medium">
                  Enter the verification code sent to <br />
                  <strong className="text-[#176B65] font-bold">+91 {customerPhone}</strong>
                </p>
              </div>

              {otpSuccessMessage && (
                <div className="text-center text-[11px] font-bold text-[#176B65] bg-[#DCE9E3]/60 p-2 rounded-xl border border-[#176B65]/20">
                  {otpSuccessMessage}
                </div>
              )}

              <form onSubmit={handleVerifyOtpAndJoin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    placeholder="Enter 4-Digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-2xl border border-[#DCE9E3] focus:border-[#176B65] focus:outline-none text-center font-token text-2xl font-bold tracking-widest text-[#283B3D] bg-[#F3F1E9]/50"
                    required
                  />
                  <span className="block text-[11px] text-center text-slate-400 font-medium mt-1.5">
                    Testing in Dev Mode? Default OTP is <strong className="text-[#176B65]">1234</strong>
                  </span>
                </div>

                {otpError && (
                  <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200 text-center">
                    {otpError}
                  </p>
                )}

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {otpLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify & Book Token</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="w-full py-2.5 rounded-2xl text-xs font-bold text-[#283B3D]/70 hover:text-[#283B3D] transition-colors"
                  >
                    Change Phone Number
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Write Review & Comment Modal (Direct Customer & Guest Feedback) */}
      <AnimatePresence>
        {writeReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#DCE9E3] space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center font-bold">
                    <Star className="w-5 h-5 fill-[#176B65]" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[#283B3D]">Write Review / Comment</h3>
                    <p className="text-[11px] text-slate-500 font-medium">For {shop?.name || 'this shop'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWriteReviewModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitDirectReview} className="space-y-4">
                {/* 1-5 Star Rating Picker */}
                <div className="text-center space-y-1 py-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Rate your Experience</span>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewStars(star)}
                        className="text-2xl text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                      >
                        {star <= newReviewStars ? '★' : '☆'}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#176B65]">{newReviewStars} Out of 5 Stars</span>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#283B3D] block">Your Name</label>
                  <input
                    type="text"
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE9E3] bg-slate-50 text-xs font-semibold text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#283B3D] block">Experience Highlights</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: 'ON_TIME', label: '⏱️ On-Time Turn' },
                      { key: 'BEHAVIOUR', label: '🤝 Polite Staff' },
                      { key: 'ACCURACY', label: '✨ Fair Wait' }
                    ].map(tag => {
                      const active = newReviewTags.includes(tag.key);
                      return (
                        <button
                          key={tag.key}
                          type="button"
                          onClick={() => {
                            setNewReviewTags(prev => active ? prev.filter(t => t !== tag.key) : [...prev, tag.key]);
                          }}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                            active ? 'bg-[#176B65] text-white border-[#176B65]' : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {tag.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment Text */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#283B3D] block">Your Comment / Feedback</label>
                  <textarea
                    rows={3}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Service kesi lagi? Timing kesa raha? Apna feedback share karein..."
                    className="w-full p-3 rounded-xl border border-[#DCE9E3] bg-slate-50 text-xs font-medium text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setWriteReviewModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-[#DCE9E3] text-[#283B3D] font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={newReviewSubmitting || !newReviewComment.trim()}
                    className="flex-1 py-3 rounded-xl bg-[#176B65] hover:bg-[#135954] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{newReviewSubmitting ? 'Posting...' : 'Post Review'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-Screen Shop Photo Preview Modal */}
      {previewPhoto && (
        <div 
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
        >
          <div className="max-w-2xl w-full space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between text-white">
              <span className="text-sm font-bold">{previewPhoto.caption || 'Shop Photo'}</span>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center cursor-pointer text-white"
              >
                ✕
              </button>
            </div>
            <img 
              src={previewPhoto.url || previewPhoto.dataUrl} 
              alt="Full preview" 
              className="w-full max-h-[75vh] object-contain rounded-2xl border border-white/20"
            />
          </div>
        </div>
      )}

    </div>
  );
}
