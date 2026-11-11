"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Ticket, Store, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Live Stores', icon: Compass },
    { href: '/tokens', label: 'My Tokens', icon: Ticket },
    { href: '/merchant', label: 'Merchant Desk', icon: Store },
  ];

  return (
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo with Real Uploaded Graphic */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
            >
              <img 
                src="/abhiikhula-logo.jpg" 
                alt="AbhiiKhula Logo" 
                className="h-12 w-auto object-contain"
              />
            </motion.div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-[#0d2238]">
                  Abhii<span className="text-[#ff7300]">Khula</span>
                </span>
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#ff7300] animate-ping"></span>
              </div>
              <p className="hidden sm:block text-[10px] font-black tracking-wider uppercase text-slate-500">
                Take Token • Skip Queue • Save Time
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    isActive ? 'text-[#0d2238]' : 'text-slate-600 hover:text-[#0d2238]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navAkGlow"
                      className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#ff7300]' : 'text-slate-500'}`} />
                    <span>{link.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTA in High-Impact Orange */}
          <div className="hidden md:flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/merchant"
                className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#ff7300] hover:bg-[#e06500] text-white font-black text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Merchant Counter</span>
              </Link>
            </motion.div>
          </div>

        </div>
      </motion.header>

      {/* Mobile Floating Bottom Bar */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl py-2.5 px-3 shadow-[0_12px_40px_rgba(13,34,56,0.12)] flex justify-around items-center">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all relative ${
                isActive ? 'text-[#ff7300] font-extrabold' : 'text-slate-500 font-medium'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavAkGlow"
                  className="absolute inset-0 bg-orange-50 rounded-2xl border border-orange-200"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10 text-[#ff7300]" />
              <span className="text-[10px] tracking-tight relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
