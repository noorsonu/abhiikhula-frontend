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
      {/* Top Navbar with Clean Slate-Sky Aesthetics */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo with Rich Ocean Sky Blue Accent */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <motion.div 
              whileHover={{ rotate: 6, scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] flex items-center justify-center text-white font-black text-2xl shadow-md shadow-sky-600/20 border border-sky-400"
            >
              अ
            </motion.div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Abhii<span className="text-[#0284c7]">Khula</span>
                </span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <p className="hidden sm:block text-[10px] font-black tracking-widest uppercase text-slate-500">
                Hyperlocal Live Availability & Virtual Queue
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navGlow"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0284c7]' : 'text-slate-500'}`} />
                    <span>{link.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTA */}
          <div className="hidden md:flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/merchant"
                className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0f2744] hover:bg-[#16385f] text-white font-black text-xs shadow-md shadow-slate-900/10 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-sky-400 fill-sky-400" />
                <span>Merchant Desk</span>
              </Link>
            </motion.div>
          </div>

        </div>
      </motion.header>

      {/* Mobile Floating Bottom Bar */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl py-2.5 px-3 shadow-[0_10px_30px_rgba(15,23,42,0.12)] flex justify-around items-center">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all relative ${
                isActive ? 'text-[#0284c7] font-extrabold' : 'text-slate-500 font-medium'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavGlow"
                  className="absolute inset-0 bg-sky-50 rounded-2xl border border-sky-200"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10 text-[#0284c7]" />
              <span className="text-[10px] tracking-tight relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
