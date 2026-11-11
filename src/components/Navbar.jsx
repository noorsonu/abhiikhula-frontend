"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Ticket, Store, Sparkles, Menu, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Live Dukaanein', icon: Compass },
    { href: '/tokens', label: 'My Tokens', icon: Ticket },
    { href: '/merchant', label: 'Merchant Desk', icon: Store },
  ];

  return (
    <>
      {/* Top Header - Glassmorphic Sky Glow */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-sky-100/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Brand Logo with animated Sky gradient */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-400 to-cyan-400 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-sky-500/25 border border-white/40"
            >
              अ
            </motion.div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                Abhii<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-cyan-600">Khula</span>
              </span>
              <p className="hidden sm:block text-[10px] font-bold tracking-wider uppercase text-sky-600/80">
                Hyperlocal Live Availability & Queue
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    isActive ? 'text-sky-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/merchant"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Dukan Register Karein</span>
            </Link>
          </div>

        </div>
      </header>

      {/* Mobile Bottom Floating Dock Bar (iPhone & Android Viewport) */}
      <nav className="md:hidden fixed bottom-3 left-4 right-4 z-50 bg-white/95 backdrop-blur-2xl border border-sky-100/90 rounded-3xl py-2 px-3 shadow-[0_10px_30px_rgba(14,165,233,0.15)] flex justify-around items-center">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                isActive ? 'text-sky-600' : 'text-slate-500'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${isActive ? 'bg-sky-50 text-sky-600 ring-1 ring-sky-200' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

