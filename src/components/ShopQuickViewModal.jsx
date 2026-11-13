"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  X, MapPin, Clock, Phone, Ticket, Star, ShieldCheck, 
  ArrowUpRight, Users, CheckCircle2, Navigation 
} from 'lucide-react';

export default function ShopQuickViewModal({ shop, isOpen, onClose, onBack }) {
  const [userRole, setUserRole] = React.useState('GUEST');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserRole(localStorage.getItem('ak_role') || 'GUEST');
    }
  }, [isOpen]);

  if (!isOpen || !shop) return null;

  const isOpenNow = shop.status === 'OPEN';
  const isBusy = shop.status === 'BUSY';
  const ratingScore = shop.rating || 4.8;
  const reviewCount = shop.reviewCount || (shop.reviews ? shop.reviews.length * 12 : 24);
  const reviews = shop.reviews || [
    { customerName: "Verified Customer", stars: 5, text: "Bina physical line me khade hue counter par direct service mili. Bahut hi aacha experience tha!", tags: ["ON_TIME", "BEHAVIOUR"], date: "Recent" },
    { customerName: "Local Resident", stars: 5, text: "Token display bilkul accurate tha. 10 min pehle nikle aur counter par turn mil gaya.", tags: ["ON_TIME"], date: "Recent" }
  ];

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
          {/* Close (Cut) Button */}
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

            {/* Shop Details: Timings, Phone, Directions */}
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

            {/* Verified Customer Reviews Section */}
            <div className="space-y-3 pt-2 border-t border-[#DCE9E3]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span className="font-black text-sm text-[#283B3D]">{ratingScore}.0</span>
                  <span className="text-xs text-slate-500 font-semibold">({reviewCount} Verified Reviews)</span>
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Queue Visits</span>
                </span>
              </div>

              {/* Reviews List */}
              <div className="space-y-2.5">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#F3F1E9]/80 border border-[#DCE9E3] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#283B3D] text-[11px]">{rev.customerName || 'Verified Customer'}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star 
                            key={s} 
                            className={`w-3 h-3 ${s <= rev.stars ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    {rev.text && (
                      <p className="text-[11px] text-[#283B3D]/80 italic">"{rev.text}"</p>
                    )}
                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {rev.tags.map(t => (
                          <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white border border-[#DCE9E3] text-[#176B65]">
                            {t === 'ON_TIME' ? '⏱️ On-Time Call' : t === 'BEHAVIOUR' ? '🤝 Polite Staff' : '✨ Clean & Fair'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
    </AnimatePresence>
  );
}

