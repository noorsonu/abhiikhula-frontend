"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Ticket, Store, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import AbhiiKhulaLogo from './AbhiiKhulaLogo';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Live Stores', icon: Compass },
    { href: '/tokens', label: 'My Tokens', icon: Ticket },
    { href: '/merchant', label: 'Merchant Desk', icon: Store },
  ];

  return (
    <>
      {/* Top Navbar with Clean Logo Brand Styling */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo with Gentle Floating Animation */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <motion.div 
              whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <AbhiiKhulaLogo size={52} />
            </motion.div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-[#0c1e38]">
                  Abhii<span className="text-[#16a34a]">Khula</span>
                </span>
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#16a34a] animate-ping"></span>
              </div>
              <p className="hidden sm:block text-[10px] font-black tracking-widest uppercase text-slate-500">
                Hyperlocal Live Availability & Queue
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    isActive ? 'text-[#0c1e38]' : 'text-slate-600 hover:text-[#0c1e38]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navBrandGlow"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#16a34a]' : 'text-slate-500'}`} />
                    <span>{link.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTA */}
          <div className="hidden md:flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Link
                href="/merchant"
                className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0c1e38] hover:bg-[#142f56] text-white font-black text-xs shadow-md transition-all cursor-pointer border border-[#16a34a]/30"
              >
                <Zap className="w-4 h-4 text-[#22c55e] fill-[#22c55e]" />
                <span>Merchant Desk</span>
              </Link>
            </motion.div>
          </div>

        </div>
      </motion.header>

      {/* Mobile Floating Bottom Bar */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl py-2.5 px-3 shadow-[0_10px_30px_rgba(12,30,56,0.12)] flex justify-around items-center">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all relative ${
                isActive ? 'text-[#16a34a] font-extrabold' : 'text-slate-500 font-medium'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavBrandGlow"
                  className="absolute inset-0 bg-emerald-50 rounded-2xl border border-emerald-200"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10 text-[#16a34a]" />
              <span className="text-[10px] tracking-tight relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
