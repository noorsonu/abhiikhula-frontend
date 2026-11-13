"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  X, Search, MapPin, Ticket, Star, ArrowUpRight, ArrowRight,
  Store, ShieldCheck, ChevronRight, Eye, Heart, Clock 
} from 'lucide-react';
import { getFavoriteShopSlugs, toggleFavoriteShopSlug } from '@/lib/favorites';

export default function CategoryShopDirectoryModal({ 
  isOpen, 
  onClose, 
  shops = [], 
  categories = [], 
  initialCategory = 'all',
  onSelectShopForDetails 
}) {
  const [selectedCat, setSelectedCat] = useState(initialCategory || 'all');
  const [search, setSearch] = useState('');
  const [favoriteSlugs, setFavoriteSlugs] = useState([]);
  const [userRole, setUserRole] = useState('GUEST');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserRole(localStorage.getItem('ak_role') || 'GUEST');
    }
  }, [isOpen]);

  // Sync favorites
  useEffect(() => {
    setFavoriteSlugs(getFavoriteShopSlugs());
    const onFavUpdate = () => setFavoriteSlugs(getFavoriteShopSlugs());
    window.addEventListener('ak_favorites_updated', onFavUpdate);
    return () => window.removeEventListener('ak_favorites_updated', onFavUpdate);
  }, []);

  const handleToggleFav = (slug, e) => {
    e.stopPropagation();
    toggleFavoriteShopSlug(slug);
    setFavoriteSlugs(getFavoriteShopSlugs());
  };

  // Sync category when parent opens with specific category
  useEffect(() => {
    if (initialCategory) {
      setSelectedCat(initialCategory);
    }
  }, [initialCategory, isOpen]);

  if (!isOpen) return null;

  const isAllPlaces = selectedCat === 'all';
  const isFavorites = selectedCat === 'favorites';
  const currentCatObj = categories.find(c => c.id === selectedCat);

  // Standard 6 categories
  const standardCategories = categories.filter(c => c.id !== 'all').slice(0, 6);

  // Helper to filter shops for a specific category id
  const getCategoryShops = (catId) => {
    const catKey = (catId || '').toLowerCase();
    return shops.filter(shop => {
      const shopCat = (shop.categoryName || '').toLowerCase();
      const shopName = (shop.name || '').toLowerCase();
      if (catKey === 'salon' || catKey.includes('salon') || catKey.includes('barber')) {
        return shopCat.includes('salon') || shopCat.includes('barber') || shopName.includes('barber');
      }
      if (catKey === 'pharmacy' || catKey.includes('pharmacy') || catKey.includes('medical')) {
        return shopCat.includes('pharmacy') || shopCat.includes('medical') || shopName.includes('medical');
      }
      if (catKey === 'clinic' || catKey.includes('clinic') || catKey.includes('doctor')) {
        return shopCat.includes('clinic') || shopCat.includes('doctor') || shopCat.includes('dental') || shopName.includes('dental');
      }
      if (catKey === 'food' || catKey.includes('food') || catKey.includes('chaat')) {
        return shopCat.includes('food') || shopCat.includes('chaat') || shopName.includes('food');
      }
      if (catKey === 'diagnostic' || catKey.includes('lab')) {
        return shopCat.includes('diagnostic') || shopCat.includes('lab') || shopName.includes('lab');
      }
      if (catKey === 'auto' || catKey.includes('repair') || catKey.includes('bike')) {
        return shopCat.includes('auto') || shopCat.includes('repair') || shopCat.includes('bike') || shopCat.includes('service') || shopName.includes('speedwheel');
      }
      return shopCat.includes(catKey) || shopName.includes(catKey);
    });
  };

  // Filter shops for the currently active view (when NOT in 'all' view)
  const filteredShops = shops.filter(shop => {
    const q = search.toLowerCase().trim();
    const nameMatch = !q || (shop.name || '').toLowerCase().includes(q) || (shop.address || '').toLowerCase().includes(q);
    if (!nameMatch) return false;

    if (isFavorites) {
      return favoriteSlugs.includes(shop.slug);
    }

    if (isAllPlaces) {
      return true;
    }

    const matching = getCategoryShops(selectedCat);
    return matching.some(s => s.id === shop.id || s.slug === shop.slug);
  });

  const headerTitle = isAllPlaces
    ? 'All Categories & Neighborhood Stores'
    : isFavorites 
      ? 'Saved Places (Your Favorites)' 
      : currentCatObj 
        ? `${currentCatObj.name} Stores` 
        : 'Neighborhood Stores';

  const headerSubtitle = isAllPlaces
    ? 'Select any category below to view verified local shops, customer reviews, and live queue passes.'
    : isFavorites
      ? 'Viewing only the shops you have saved. No other data is mixed here.'
      : currentCatObj 
        ? `Showing verified ${currentCatObj.name.toLowerCase()} places with live digital queues in Lucknow.` 
        : 'Browse verified stores across Lucknow, see reviews, and get instant queue passes.';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
        
        {/* Backdrop click to close */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#DCE9E3] overflow-hidden z-10 my-6 flex flex-col max-h-[88vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#DCE9E3] bg-[#F3F1E9]/60 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${
                isFavorites 
                  ? 'bg-rose-100 text-rose-600 border-rose-300' 
                  : 'bg-[#DCE9E3] text-[#176B65] border-[#176B65]/20'
              }`}>
                {isFavorites ? <Heart className="w-5 h-5 fill-rose-500" /> : <Store className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#283B3D]">{headerTitle}</h2>
                <p className="text-xs text-[#283B3D]/70 font-medium">{headerSubtitle}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-500 border border-[#DCE9E3] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="p-4 sm:p-5 border-b border-[#DCE9E3] space-y-3 shrink-0 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text"
                placeholder={isAllPlaces ? "Search category (Salon, Medical, Clinic)..." : "Search store name or address..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F3F1E9]/70 border border-[#DCE9E3] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#176B65]"
              />
            </div>

            {/* Category Switcher Pills: All Places is FIRST, then Saved Places, then Categories */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
              
              {/* 1. All Categories (First tab) */}
              <button
                type="button"
                onClick={() => setSelectedCat('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isAllPlaces
                    ? 'bg-[#176B65] text-white shadow-xs'
                    : 'bg-white text-[#283B3D] border border-[#DCE9E3] hover:bg-[#DCE9E3]/40'
                }`}
              >
                <Store className={`w-3.5 h-3.5 ${isAllPlaces ? 'text-[#F2A15A]' : 'text-[#176B65]'}`} />
                <span>All Categories</span>
              </button>

              {/* 2. Saved Places Tab */}
              <button
                type="button"
                onClick={() => setSelectedCat('favorites')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isFavorites
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-[#283B3D] border border-rose-200 hover:bg-rose-50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorites ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'}`} />
                <span>Saved Places</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isFavorites ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                }`}>
                  {favoriteSlugs.length}
                </span>
              </button>

              {/* 3. The 6 Category Tabs */}
              {standardCategories.map((c) => {
                const isSelected = selectedCat === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCat(c.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#176B65] text-white shadow-xs' 
                        : 'bg-[#F3F1E9] text-[#283B3D] border border-[#DCE9E3] hover:bg-[#DCE9E3]/50'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">

            {/* ======================================================== */}
            {/* VIEW 1: "ALL PLACES" -> SHOW CATEGORIES (NOT SHOP NAMES) */}
            {/* ======================================================== */}
            {isAllPlaces && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#283B3D]/70 font-semibold px-1">
                  <span>Categories Directory (Click any category to see its shops)</span>
                  <span className="text-[#176B65] font-bold">6 Verified Categories</span>
                </div>

                <div className="space-y-3 divide-y divide-[#DCE9E3]/60">
                  {standardCategories
                    .filter(cat => !search || cat.name.toLowerCase().includes(search.toLowerCase()) || cat.description.toLowerCase().includes(search.toLowerCase()))
                    .map((cat) => {
                      const matchingShops = getCategoryShops(cat.id);
                      const catPhoto = cat.id === 'salon' ? '/images/barber.jpg' :
                                       cat.id === 'pharmacy' ? '/images/pharmacy.jpg' :
                                       cat.id === 'clinic' ? '/images/clinic.jpg' :
                                       cat.id === 'food' ? '/images/food.jpg' :
                                       cat.id === 'diagnostic' ? '/images/diagnostic.jpg' :
                                       cat.id === 'auto' ? '/images/auto.jpg' :
                                       cat.imageUrl || '/images/clinic.jpg';

                      return (
                        <div
                          key={cat.id}
                          onClick={() => setSelectedCat(cat.id)}
                          className="pt-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-2xl hover:bg-[#F3F1E9]/70 border border-transparent hover:border-[#DCE9E3] transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
                        >
                          {/* Category Thumbnail & Details */}
                          <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-[#DCE9E3]">
                              <img 
                                src={catPhoto} 
                                alt={cat.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/20"></div>
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-black text-base sm:text-lg text-[#283B3D] group-hover:text-[#176B65] transition-colors">
                                  {cat.name}
                                </h3>
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#DCE9E3] text-[#176B65]">
                                  {matchingShops.length || cat.count || 2} Shops Connected
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                  ● Live Queue Active
                                </span>
                              </div>

                              <p className="text-xs text-[#283B3D]/70 font-medium line-clamp-1">
                                {cat.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-[#283B3D]/70">
                                <div className="flex items-center gap-1 text-[#176B65] font-bold text-[11px]">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Avg Wait: {cat.avgWait || '~10-15 min'}</span>
                                </div>
                                <span className="text-[#283B3D]/30">•</span>
                                <span className="text-emerald-700 font-semibold text-[11px]">Zero Physical Waiting</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Arrow / Action Button */}
                          <div className="shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              className="px-4 py-2.5 rounded-xl bg-[#176B65] group-hover:bg-[#125550] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                            >
                              <span>View Shops</span>
                              <ArrowRight className="w-4 h-4 text-[#F2A15A] group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 2: CATEGORY SELECTED -> SHOW SHOPS & DETAILS        */}
            {/* ======================================================== */}
            {!isAllPlaces && (
              <div className="space-y-3.5 divide-y divide-[#DCE9E3]/60">
                {filteredShops.map((shop) => {
                  const isOpen = shop.status === 'OPEN';
                  const isBusy = shop.status === 'BUSY';
                  const rating = shop.rating || 4.8;
                  const count = shop.reviewCount || 24;
                  const isFav = favoriteSlugs.includes(shop.slug);

                  return (
                    <div 
                      key={shop.id}
                      className="pt-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl hover:bg-[#F3F1E9]/60 transition-colors"
                    >
                      {/* Shop Info with Photo Thumbnail */}
                      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                        <div 
                          onClick={() => onSelectShopForDetails && onSelectShopForDetails(shop)}
                          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-[#DCE9E3] cursor-pointer group"
                        >
                          <img 
                            src={shop.imageUrl || '/images/clinic.jpg'} 
                            alt={shop.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 
                              onClick={() => onSelectShopForDetails && onSelectShopForDetails(shop)}
                              className="font-black text-sm sm:text-base text-[#283B3D] truncate hover:text-[#176B65] cursor-pointer"
                            >
                              {shop.name}
                            </h3>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#DCE9E3] text-[#176B65]">
                              {shop.categoryName}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isOpen ? 'bg-emerald-100 text-emerald-800' : isBusy ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isOpen ? '● Open' : isBusy ? '● Busy' : '● Closed'}
                            </span>
                          </div>

                          <p className="text-xs text-[#283B3D]/70 flex items-center gap-1 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{shop.address}</span>
                          </p>

                          {/* Ratings & Queue Metrics */}
                          <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs">
                            <div className="flex items-center gap-1 text-amber-600 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              <span>{rating}.0</span>
                              <span className="text-slate-400 text-[11px] font-medium">({count} reviews)</span>
                            </div>

                            <span className="text-[#283B3D]/30">•</span>

                            <span className="text-[#176B65] font-bold text-[11px]">
                              {shop.waitingCount ?? 0} in queue • ~{shop.estimatedWaitMin ?? 10} min wait
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: 1) Favorite Heart, 2) Reviews & Photo, 3) Get Token */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={(e) => handleToggleFav(shop.slug, e)}
                          title={isFav ? "Remove from saved places" : "Save this place"}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                            isFav 
                              ? 'bg-rose-50 border-rose-300 text-rose-600' 
                              : 'bg-white border-[#DCE9E3] text-slate-400 hover:text-rose-500 hover:border-rose-300'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectShopForDetails && onSelectShopForDetails(shop)}
                          className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#DCE9E3]/50 border border-[#DCE9E3] text-xs font-bold text-[#283B3D] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#176B65]" />
                          <span>Reviews & Photo</span>
                        </button>

                        {userRole === 'MERCHANT' ? (
                          <Link
                            href="/merchant/dashboard"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl bg-[#283B3D] hover:bg-[#1f2e30] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                          >
                            <Store className="w-3.5 h-3.5 text-[#F2A15A]" />
                            <span>Console</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/book/${shop.slug}`}
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl bg-[#176B65] hover:bg-[#125550] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                          >
                            <Ticket className="w-3.5 h-3.5 text-[#DCE9E3]" />
                            <span>Get Token</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredShops.length === 0 && (
                  <div className="py-14 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#DCE9E3] text-[#176B65] flex items-center justify-center mx-auto">
                      {isFavorites ? <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> : <Store className="w-6 h-6 text-[#176B65]" />}
                    </div>
                    <h4 className="font-bold text-[#283B3D] text-base">
                      {isFavorites 
                        ? "Aapne abhi tak koi shop save nahi ki hai" 
                        : "No shops found in this category"}
                    </h4>
                    <p className="text-xs text-[#283B3D]/70 max-w-sm mx-auto font-medium">
                      {isFavorites 
                        ? "Kisi bhi dukaan ke samne bane ❤️ (dil) icon par click karke usko yahan save karein." 
                        : "Try selecting another category or clear search keywords."}
                    </p>
                    {isFavorites && (
                      <button
                        type="button"
                        onClick={() => setSelectedCat('all')}
                        className="mt-2 px-5 py-2.5 rounded-xl bg-[#176B65] text-white font-bold text-xs hover:bg-[#125550] cursor-pointer shadow-xs"
                      >
                        Browse All Categories
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer note */}
          <div className="p-3 bg-slate-50 border-t border-[#DCE9E3] text-center text-[11px] text-[#283B3D]/70 shrink-0 font-medium">
            Pilot Directory in Lucknow • All shops feature live digital queuing with zero waiting in heat.
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
