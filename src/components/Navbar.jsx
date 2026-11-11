"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Ticket, Store, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import FreshUrbanLogo from './FreshUrbanLogo';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Explore Shops', icon: Compass },
    { href: '/tokens', label: 'My Tokens', icon: Ticket },
    { href: '/merchant', label: 'Merchant Desk', icon: Store },
  ];

  return (
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-[#F3F1E9]/90 backdrop-blur-md border-b border-[#DCE9E3] shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo with Fresh Urban Styling */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <motion.div 
              whileHover={{ scale: 1.06, rotate: [-1, 2, 0] }}
              transition={{ duration: 0.3 }}
            >
              <FreshUrbanLogo size={48} />
            </motion.div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-[#283B3D]">
                  Abhii<span className="text-[#176B65]">Khula</span>
                </span>
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#F2A15A] animate-ping"></span>
              </div>
              <p className="hidden sm:block text-[10px] font-black tracking-widest uppercase text-[#283B3D]/70">
                Skip the Wait • Own Your Time
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#DCE9E3]/70 p-1.5 rounded-2xl border border-[#DCE9E3]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive ? 'text-[#176B65]' : 'text-[#283B3D]/80 hover:text-[#176B65]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navUrbanGlow"
                      className="absolute inset-0 bg-white rounded-xl shadow-xs border border-[#DCE9E3]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#176B65]' : 'text-[#283B3D]/60'}`} />
                    <span>{link.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTA in Deep Teal with Peach Accent */}
          <div className="hidden md:flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/merchant"
                className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#176B65] hover:bg-[#125550] text-white font-bold text-xs shadow-md shadow-[#176B65]/20 transition-all cursor-pointer border border-[#DCE9E3]"
              >
                <Store className="w-4 h-4 text-[#F2A15A]" />
                <span>Shop Owner Portal</span>
              </Link>
            </motion.div>
          </div>

        </div>
      </motion.header>

      {/* Mobile Floating Bottom Bar */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-[#F3F1E9]/95 backdrop-blur-2xl border border-[#DCE9E3] rounded-3xl py-2.5 px-3 shadow-[0_12px_40px_rgba(40,59,61,0.15)] flex justify-around items-center">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all relative ${
                isActive ? 'text-[#176B65] font-extrabold' : 'text-[#283B3D]/70 font-medium'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavUrbanGlow"
                  className="absolute inset-0 bg-[#DCE9E3] rounded-2xl border border-[#176B65]/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10 text-[#176B65]" />
              <span className="text-[10px] tracking-tight relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
