"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function OfficialBrandLogo({ 
  height = 46, 
  variant = "full", // "full" or "icon" or "badge"
  className = "",
  animate = true
}) {
  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      {animate ? (
        <motion.div
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex items-center"
        >
          <img
            src="/images/official-logo-transparent.png"
            alt="AbhiiKhula - Take Token • Skip Queue • Save Time"
            style={{ height: `${height}px`, width: 'auto' }}
            className="object-contain drop-shadow-xs"
            loading="eager"
          />
        </motion.div>
      ) : (
        <img
          src="/images/official-logo-transparent.png"
          alt="AbhiiKhula - Take Token • Skip Queue • Save Time"
          style={{ height: `${height}px`, width: 'auto' }}
          className="object-contain drop-shadow-xs"
          loading="eager"
        />
      )}
    </div>
  );
}

