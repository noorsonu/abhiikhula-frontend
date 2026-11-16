"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  X, MapPin, Clock, Phone, Ticket, Star, ShieldCheck, 
  ArrowUpRight, Users, CheckCircle2, Navigation,
  MessageSquare, Store, User, Reply, Send, Edit3,
  ChevronLeft, ChevronRight, Image as ImageIcon,
  Tag, Sparkles, Check, ChevronDown, ChevronUp, Search
} from 'lucide-react';
import { reviewApi } from '@/lib/api';

export default function ShopQuickViewModal({ shop, isOpen, onClose, onBack }) {
  const [userRole, setUserRole] = useState('GUEST');
  const [customerName, setCustomerName] = useState('');
  
  // Real reviews & Pagination state
  const [reviewsList, setReviewsList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 2;

  // Rate card & Services state (prices set by shopkeeper)
  const [shopServices, setShopServices] = useState([]);
  const [rateCardExpanded, setRateCardExpanded] = useState(false);
  const [rateCardSearchQuery, setRateCardSearchQuery] = useState('');

  // Shopkeeper uploaded photos
  const [shopPhotos, setShopPhotos] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  // In-modal reply state
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyName, setReplyName] = useState('');
  const [replyRole, setReplyRole] = useState('CUSTOMER');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // In-modal write review state
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewAuthorName, setReviewAuthorName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTags, setReviewTags] = useState(['ON_TIME', 'BEHAVIOUR']);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Load user data, real reviews, rate card, and photos
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen && shop) {
      const role = localStorage.getItem('ak_role') || 'GUEST';
      const cName = localStorage.getItem('ak_customer_name') || '';
      setUserRole(role);
      setCustomerName(cName);
      setReviewAuthorName(cName || 'Verified Customer');
      setReplyName(role === 'MERCHANT' ? (shop.name || 'Shopkeeper') : (cName || 'Customer'));
      setReplyRole(role === 'MERCHANT' ? 'MERCHANT' : 'CUSTOMER');

      const slug = (shop.slug || 'shop').toLowerCase();

      // 1. Load Services & Rate Card (Prices configured by shopkeeper)
      try {
        const servKey = `ak_shop_services_${slug}`;
        const savedServs = localStorage.getItem(servKey);
        if (savedServs) {
          const parsed = JSON.parse(savedServs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setShopServices(parsed.filter(s => s.active !== false));
          }
        } else {
          // Default fallbacks based on category
          const defaultItems = [
            { id: 's1', name: 'Standard Service / Haircut', price: 150, durationMin: 15 },
            { id: 's2', name: 'Quick Trim / Grooming', price: 80, durationMin: 10 },
            { id: 's3', name: 'Premium Care & Consultation', price: 250, durationMin: 25 }
          ];
          setShopServices(defaultItems);
        }
      } catch (e) {}

      // 2. Load Photos uploaded by shopkeeper
      try {
        const photoKey = `ak_shop_photos_${slug}`;
        const savedPhotos = localStorage.getItem(photoKey);
        const initialPhotos = [
          { id: 'def-1', url: shop.imageUrl || '/images/clinic.jpg', caption: 'Shop Front & Entrance' },
          { id: 'def-2', url: '/images/barber-real.jpg', caption: 'Interior & Counter Work Station' }
        ];
        if (savedPhotos) {
          const parsed = JSON.parse(savedPhotos);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setShopPhotos([...parsed, ...initialPhotos]);
          } else {
            setShopPhotos(initialPhotos);
          }
        } else {
          setShopPhotos(initialPhotos);
        }
      } catch (e) {}

      // 3. Load Real Reviews & Comments
      const loadAllReviews = async () => {
        let cloudReviews = [];
        if (shop.id && String(shop.id).includes('-')) {
          try {
            const res = await reviewApi.getShopReviews(shop.id);
            if (res?.data?.data?.reviews) {
              cloudReviews = res.data.data.reviews;
            }
          } catch (e) {}
        }

        let localReviews = [];
        try {
          const mKey = `ak_merchant_reviews_${slug}`;
          const savedM = localStorage.getItem(mKey);
          if (savedM) {
            const parsed = JSON.parse(savedM);
            if (Array.isArray(parsed)) localReviews.push(...parsed);
          }

          const histStr = localStorage.getItem('ak_customer_history');
          if (histStr) {
            const hist = JSON.parse(histStr);
            if (Array.isArray(hist)) {
              hist.forEach(h => {
                if (h.rating && (h.shopSlug === slug || h.shopName === shop.name)) {
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

        const map = new Map();
        cloudReviews.forEach(r => map.set(r.id || `${r.customerName}_${r.stars}_${r.text}`, { ...r }));
        localReviews.forEach(r => {
          const k = r.id || `${r.customerName}_${r.stars}_${r.text}`;
          if (map.has(k)) {
            const prev = map.get(k);
            map.set(k, {
              ...prev,
              ...r,
              reply: r.reply || prev.reply || r.merchantReply || prev.merchantReply,
              merchantReply: r.merchantReply || prev.merchantReply || r.reply || prev.reply
            });
          } else {
            map.set(k, { ...r });
          }
        });

        // Add default sample reviews if empty
        if (map.size === 0) {
          map.set('mock-1', {
            id: 'mock-1',
            customerName: "Verified Customer",
            stars: 5,
            text: "Bina physical line me khade hue counter par direct service mili. Bahut hi aacha experience tha!",
            tags: ["⏱️ On-Time Call", "🤝 Polite Staff"],
            date: "Recent",
            reply: "Dhanyawad ji! Khushi hui ki aapko line me wait nahi karna pada.",
            merchantReply: "Dhanyawad ji! Khushi hui ki aapko line me wait nahi karna pada."
          });
          map.set('mock-2', {
            id: 'mock-2',
            customerName: "Local Resident",
            stars: 5,
            text: "Token display bilkul accurate tha. 10 min pehle nikle aur counter par turn mil gaya.",
            tags: ["⏱️ On-Time Call"],
            date: "Recent"
          });
          map.set('mock-3', {
            id: 'mock-3',
            customerName: "Amit Verma",
            stars: 5,
            text: "Staff was polite and pricing is completely transparent. Highly recommend!",
            tags: ["✨ Clean & Fair", "🤝 Polite Staff"],
            date: "Yesterday"
          });
        }

        setReviewsList(Array.from(map.values()));
      };

      loadAllReviews();
      setCurrentPage(1);
    }
  }, [isOpen, shop]);

  if (!isOpen || !shop) return null;

  const isOpenNow = shop.status === 'OPEN';
  const isBusy = shop.status === 'BUSY';
  const ratingScore = shop.rating || 4.8;
  const reviewCount = reviewsList.length > 0 ? reviewsList.length : 24;

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(reviewsList.length / reviewsPerPage));
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const paginatedReviews = reviewsList.slice(startIndex, startIndex + reviewsPerPage);

  // Submit reply inside modal
  const handlePostReply = async (rev) => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    const slug = (shop.slug || 'shop').toLowerCase();
    const isMerch = replyRole === 'MERCHANT';
    const author = replyName.trim() || (isMerch ? (shop.name || 'Shopkeeper') : 'Customer');
    const nowIso = new Date().toISOString();
    const replyDate = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newReplyItem = {
      id: 'rep-' + Date.now(),
      authorName: author,
      role: isMerch ? 'MERCHANT' : 'CUSTOMER',
      text: replyText.trim(),
      createdAt: nowIso,
      date: replyDate
    };

    setReviewsList(prev => {
      const updated = prev.map(r => {
        if (r.id === rev.id || (rev.tokenId && r.tokenId === rev.tokenId)) {
          const oldReplies = Array.isArray(r.replies) ? r.replies : (r.reply || r.merchantReply ? [{
            id: 'rep-old',
            authorName: shop.name || 'Shopkeeper',
            role: 'MERCHANT',
            text: r.reply || r.merchantReply,
            createdAt: r.replyAt || nowIso,
            date: r.merchantReplyDate || 'Recent'
          }] : []);

          return {
            ...r,
            replies: [...oldReplies, newReplyItem],
            reply: isMerch ? replyText.trim() : (r.reply || r.merchantReply || replyText.trim()),
            merchantReply: isMerch ? replyText.trim() : (r.merchantReply || r.reply || replyText.trim()),
            replyAt: isMerch ? nowIso : r.replyAt,
            merchantReplyDate: isMerch ? replyDate : r.merchantReplyDate
          };
        }
        return r;
      });

      try {
        localStorage.setItem(`ak_merchant_reviews_${slug}`, JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}

      return updated;
    });

    if (isMerch && shop.id && rev.id && String(rev.id).length > 20) {
      try {
        await reviewApi.replyToReview(shop.id, rev.id, replyText.trim()).catch(() => {});
      } catch (e) {}
    }

    setReplyText('');
    setActiveReplyId(null);
    setReplySubmitting(false);
  };

  // Submit new review from modal
  const handlePostReview = (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setReviewSubmitting(true);
    const slug = (shop.slug || 'shop').toLowerCase();
    const newRev = {
      id: 'rev-' + Date.now(),
      customerName: reviewAuthorName.trim() || 'Verified Customer',
      stars: reviewStars,
      text: reviewComment.trim(),
      comment: reviewComment.trim(),
      tags: reviewTags.map(t => t === 'ON_TIME' ? '⏱️ On-Time Call' : t === 'BEHAVIOUR' ? '🤝 Polite Staff' : '✨ Clean & Fair'),
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      verifiedVisit: true,
      replies: []
    };

    setReviewsList(prev => {
      const updated = [newRev, ...prev];
      try {
        localStorage.setItem(`ak_merchant_reviews_${slug}`, JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
      return updated;
    });

    setReviewComment('');
    setWriteReviewOpen(false);
    setReviewSubmitting(false);
    setCurrentPage(1);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        
        {/* Backdrop click to close */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#DCE9E3] overflow-hidden z-10 my-6"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Shop Photo Header with Badges */}
          <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-900">
            <img 
              src={shop.imageUrl || '/images/clinic.jpg'} 
              alt={shop.name} 
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="bg-[#176B65] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                {shop.categoryName}
              </span>
              <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-sm ${
                isOpenNow ? 'bg-emerald-600 text-white' : isBusy ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
              }`}>
                {isOpenNow ? '● Open' : isBusy ? '● Heavy Crowd' : '● Closed'}
              </span>
            </div>

            {/* Bottom Title on Photo */}
            <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black drop-shadow-md">{shop.name}</h2>
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>
              <p className="text-xs text-slate-200 flex items-center gap-1.5 drop-shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-[#F2A15A] shrink-0" />
                <span className="line-clamp-1">{shop.address}</span>
              </p>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            
            {/* Live Queue Highlights Bar */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F3F1E9] border border-[#DCE9E3] text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 block tracking-wider">In Queue</span>
                <span className="font-token font-bold text-xl text-[#283B3D] mt-0.5 block">{shop.waitingCount ?? 0}</span>
              </div>
              <div className="border-x border-[#DCE9E3]">
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 block tracking-wider">Est. Wait</span>
                <span className="font-token font-bold text-xl text-[#176B65] mt-0.5 block">~{shop.estimatedWaitMin ?? 10}m</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#283B3D]/60 block tracking-wider">Serving</span>
                <span className="font-token font-bold text-xl text-[#F2A15A] mt-0.5 block">{shop.currentServing || '#1'}</span>
              </div>
            </div>

            {/* Shop Details: Timings & Directions */}
            <div className="space-y-3 text-xs text-[#283B3D]/80">
              {shop.description && (
                <p className="text-xs text-[#283B3D]/70 leading-relaxed font-normal bg-white p-3 rounded-xl border border-[#DCE9E3]">
                  {shop.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <Clock className="w-4 h-4 text-[#176B65] shrink-0" />
                  <div>
                    <span className="font-bold text-[#283B3D] block text-[11px]">Working Hours</span>
                    <span className="text-[10px] text-slate-500">{shop.openingHours || '09:00 AM – 09:00 PM'}</span>
                  </div>
                </div>

                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((shop.address || '') + ' ' + (shop.name || ''))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#DCE9E3]/50 hover:bg-[#DCE9E3] border border-[#176B65]/30 text-[#176B65] transition-all cursor-pointer font-bold"
                >
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#176B65]" />
                    <span className="text-[11px]">Navigate on Maps</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 1. SHOPKEEPER WORK & SHOWCASE PHOTOS GALLERY                   */}
            {/* ============================================================== */}
            <div className="space-y-2.5 pt-2 border-t border-[#DCE9E3]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-black text-xs text-[#283B3D]">
                  <ImageIcon className="w-4 h-4 text-[#176B65]" />
                  <span>Shop Showcase & Work Photos ({shopPhotos.length})</span>
                </div>
                <span className="text-[10px] font-bold text-[#176B65] bg-[#DCE9E3]/40 px-2 py-0.5 rounded-md border border-[#176B65]/20">
                  By Shopkeeper
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {shopPhotos.map((photo, pIdx) => (
                  <div
                    key={photo.id || pIdx}
                    onClick={() => setPreviewImage(photo)}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-[#DCE9E3] bg-slate-100 cursor-pointer shadow-2xs hover:shadow-md transition-all active:scale-95"
                  >
                    <img 
                      src={photo.url || photo.dataUrl} 
                      alt={photo.caption || 'Shop photo'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
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
            <div className="space-y-2.5 pt-2 border-t border-[#DCE9E3]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-black text-xs text-[#283B3D]">
                  <Tag className="w-4 h-4 text-[#176B65]" />
                  <span>Verified Rate Card & Price Menu ({shopServices.length})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Fixed Counter Prices
                  </span>
                  {shopServices.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setRateCardExpanded(!rateCardExpanded)}
                      className="text-[10px] font-black text-[#176B65] hover:text-[#125550] flex items-center gap-0.5 bg-[#DCE9E3]/50 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                    >
                      <span>{rateCardExpanded ? 'Collapse ▲' : `View All (${shopServices.length}) ▼`}</span>
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
                        {shopServices.map((srv, idx) => (
                          <option key={srv.id || idx} value={srv.name}>
                            {srv.name} — ₹{srv.price || 0}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Rendered Services: Top 3 if collapsed, filtered scrollable list if expanded */}
              {(() => {
                const listToDisplay = rateCardExpanded
                  ? shopServices.filter(s => 
                      !rateCardSearchQuery.trim() || 
                      (s.name || '').toLowerCase().includes(rateCardSearchQuery.toLowerCase())
                    )
                  : shopServices.slice(0, 3);

                if (rateCardExpanded && listToDisplay.length === 0) {
                  return (
                    <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
                      Koi service match nahi hui "{rateCardSearchQuery}" se.
                    </div>
                  );
                }

                return (
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${rateCardExpanded ? 'max-h-60 overflow-y-auto pr-1' : ''}`}>
                    {listToDisplay.map((srv, sIdx) => (
                      <div 
                        key={srv.id || sIdx}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="pr-2">
                          <span className="font-bold text-[#283B3D] block text-[11px]">{srv.name}</span>
                          {srv.durationMin && (
                            <span className="text-[10px] text-slate-400 font-medium">~{srv.durationMin} mins duration</span>
                          )}
                        </div>
                        <span className="font-token font-bold text-sm text-[#176B65] bg-white px-2 py-0.5 rounded-lg border border-[#DCE9E3] shrink-0">
                          ₹{srv.price || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Expand / Collapse Button if > 3 services */}
              {shopServices.length > 3 && (
                <button
                  type="button"
                  onClick={() => {
                    const nextState = !rateCardExpanded;
                    setRateCardExpanded(nextState);
                    if (!nextState) setRateCardSearchQuery('');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#F3F1E9] hover:bg-[#DCE9E3]/70 text-[#176B65] text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98"
                >
                  {rateCardExpanded ? (
                    <>
                      <span>Show Less ▲</span>
                    </>
                  ) : (
                    <>
                      <span>View Full Rate Card & Menu ({shopServices.length} Services) ▼</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* ============================================================== */}
            {/* 3. VERIFIED CUSTOMER REVIEWS & COMMENTS (WITH PAGINATION)       */}
            {/* ============================================================== */}
            <div className="space-y-3 pt-2 border-t border-[#DCE9E3]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span className="font-black text-sm text-[#283B3D]">{ratingScore}.0</span>
                  <span className="text-xs text-slate-500 font-semibold">({reviewCount} Verified Reviews)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWriteReviewOpen(true)}
                    className="px-2.5 py-1 rounded-xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-[10px] transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Edit3 className="w-3 h-3 text-[#F2A15A]" />
                    <span>+ Write Review</span>
                  </button>
                  <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>
              </div>

              {/* Paginated Reviews List */}
              <div className="space-y-3">
                {paginatedReviews.map((rev, idx) => {
                  const revKey = rev.id || `quick-rev-${idx}`;
                  const threadReplies = Array.isArray(rev.replies) && rev.replies.length > 0
                    ? rev.replies
                    : (rev.reply || rev.merchantReply ? [{
                        id: 'rep-init',
                        authorName: shop.name || 'Shopkeeper',
                        role: 'MERCHANT',
                        text: rev.reply || rev.merchantReply,
                        date: rev.merchantReplyDate || 'Recent'
                      }] : []);

                  return (
                    <div key={revKey} className="p-3.5 rounded-2xl bg-[#F3F1E9]/80 border border-[#DCE9E3] space-y-2 text-xs shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#283B3D] text-[11px]">{rev.customerName || 'Verified Customer'}</span>
                          <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-semibold border border-emerald-200">
                            Visit Verified
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star 
                              key={s} 
                              className={`w-3 h-3 ${s <= (Number(rev.stars) || 5) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} 
                            />
                          ))}
                        </div>
                      </div>

                      {rev.tags && rev.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {rev.tags.map((t, tIdx) => (
                            <span key={tIdx} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#DCE9E3] text-[#176B65]">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {(rev.text || rev.comment) && (
                        <p className="text-[11px] text-[#283B3D]/85 leading-relaxed bg-white/70 p-2 rounded-xl border border-slate-100">
                          "{rev.text || rev.comment}"
                        </p>
                      )}

                      {/* Official Replies Thread */}
                      {threadReplies.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {threadReplies.map((rep, rIdx) => {
                            const isMerch = rep.role === 'MERCHANT';
                            return (
                              <div
                                key={rep.id || rIdx}
                                className={`pl-2.5 py-1.5 px-2.5 rounded-xl text-xs space-y-0.5 ${
                                  isMerch 
                                    ? 'bg-[#176B65]/10 border-l-3 border-[#176B65]' 
                                    : 'bg-amber-50 border-l-3 border-amber-400'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className={`font-bold flex items-center gap-1 ${isMerch ? 'text-[#176B65]' : 'text-amber-900'}`}>
                                    {isMerch ? <Store className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                    <span>{rep.authorName || (isMerch ? 'Shopkeeper' : 'Customer')} {isMerch ? '(Official Reply)' : '(Follow-up)'}</span>
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-medium">
                                    {rep.date || 'Recent'}
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

                      {/* Reply Toggle Button */}
                      <div className="pt-1 flex items-center justify-between border-t border-slate-200/50 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (activeReplyId === revKey) {
                              setActiveReplyId(null);
                            } else {
                              setActiveReplyId(revKey);
                              setReplyText('');
                            }
                          }}
                          className="text-[10px] font-bold text-[#176B65] hover:text-[#125550] flex items-center gap-1 cursor-pointer"
                        >
                          <Reply className="w-3 h-3" />
                          <span>{activeReplyId === revKey ? 'Cancel' : 'Reply / Add Comment'}</span>
                        </button>
                        <span className="text-[9px] text-slate-400">
                          {threadReplies.length} {threadReplies.length === 1 ? 'Reply' : 'Replies'}
                        </span>
                      </div>

                      {/* Inline Reply Box */}
                      {activeReplyId === revKey && (
                        <div className="mt-2 p-2.5 bg-white rounded-xl border border-[#DCE9E3] space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={replyName}
                              onChange={(e) => setReplyName(e.target.value)}
                              placeholder="Your Name"
                              className="w-1/2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-[#283B3D]"
                            />
                            <div className="flex items-center gap-1 text-[10px]">
                              <button
                                type="button"
                                onClick={() => setReplyRole('CUSTOMER')}
                                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                                  replyRole === 'CUSTOMER' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-slate-400'
                                }`}
                              >
                                Customer
                              </button>
                              <button
                                type="button"
                                onClick={() => setReplyRole('MERCHANT')}
                                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                                  replyRole === 'MERCHANT' ? 'bg-[#176B65] text-white' : 'text-slate-400'
                                }`}
                              >
                                Shopkeeper
                              </button>
                            </div>
                          </div>

                          <textarea
                            rows={2}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Apna reply ya comment likhein..."
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                          />

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveReplyId(null)}
                              className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePostReply(rev)}
                              disabled={replySubmitting || !replyText.trim()}
                              className="px-3.5 py-1.5 rounded-lg bg-[#176B65] hover:bg-[#135954] text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
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
              </div>

              {/* ========================================================== */}
              {/* PAGINATION CONTROLS                                       */}
              {/* ========================================================== */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t border-[#DCE9E3]">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-xl border border-[#DCE9E3] bg-white text-xs font-bold text-[#283B3D] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, pIdx) => {
                      const pageNum = pIdx + 1;
                      const isActive = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#176B65] text-white shadow-xs'
                              : 'bg-white border border-[#DCE9E3] text-[#283B3D] hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1.5 rounded-xl border border-[#DCE9E3] bg-white text-xs font-bold text-[#283B3D] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>

          </div>

          {/* Modal Footer CTA */}
          <div className="p-4 sm:p-5 border-t border-[#DCE9E3] bg-slate-50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack || onClose}
              className="px-5 py-3 rounded-2xl bg-white border border-[#DCE9E3] text-xs font-bold text-[#283B3D] hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
            >
              ← Back to List
            </button>

            {userRole === 'MERCHANT' ? (
              <Link
                href="/merchant/dashboard"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl bg-[#283B3D] hover:bg-[#1f2e30] text-white font-bold text-xs sm:text-sm shadow-md transition-all text-center flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Merchant Mode Active • Open Dashboard</span>
              </Link>
            ) : (
              <Link
                href={`/book/${shop.slug}`}
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs sm:text-sm shadow-md transition-all text-center flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Ticket className="w-4 h-4 text-[#DCE9E3]" />
                <span>Get Digital Token Now</span>
              </Link>
            )}
          </div>

        </motion.div>
      </div>

      {/* Full-Screen Image Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
        >
          <div className="max-w-2xl w-full space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between text-white">
              <span className="text-sm font-bold">{previewImage.caption || 'Shop Photo'}</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>
            <img 
              src={previewImage.url || previewImage.dataUrl} 
              alt="Full preview" 
              className="w-full max-h-[75vh] object-contain rounded-2xl border border-white/20"
            />
          </div>
        </div>
      )}

      {/* In-Modal Direct Review Writer */}
      {writeReviewOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#DCE9E3] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-[#283B3D] flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Write Review for {shop.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setWriteReviewOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostReview} className="space-y-3.5">
              <div className="text-center py-1">
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewStars(s)}
                      className="text-2xl text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                    >
                      {s <= reviewStars ? '★' : '☆'}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-[#176B65]">{reviewStars} Stars Rating</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#283B3D] block mb-1">Your Name</label>
                <input
                  type="text"
                  value={reviewAuthorName}
                  onChange={(e) => setReviewAuthorName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full p-2.5 rounded-xl border border-[#DCE9E3] bg-slate-50 text-xs font-bold text-[#283B3D]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#283B3D] block mb-1">Your Review / Comment</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Service aur timing kaisa raha?..."
                  className="w-full p-2.5 rounded-xl border border-[#DCE9E3] bg-slate-50 text-xs font-medium text-[#283B3D] focus:outline-none focus:border-[#176B65]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setWriteReviewOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DCE9E3] text-xs font-bold text-[#283B3D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting || !reviewComment.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#176B65] hover:bg-[#125550] text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{reviewSubmitting ? 'Posting...' : 'Submit Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AnimatePresence>
  );
}
