"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function AbhiiKhulaLogo({ size = 48, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 240 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Glow behind shop opening */}
        <ellipse cx="120" cy="140" rx="60" ry="35" fill="#fef08a" opacity="0.65" />

        {/* Outer Dark Navy Storeframe */}
        <rect x="52" y="55" width="136" height="110" rx="10" fill="#0c1e38" />
        
        {/* Platform base */}
        <rect x="36" y="156" width="168" height="14" rx="7" fill="#0c1e38" />

        {/* Warm Golden Interior Store Front */}
        <rect x="68" y="80" width="104" height="76" rx="4" fill="url(#warmInteriorGlow)" />

        {/* Store Shutter (Slightly rolled up) */}
        <rect x="66" y="70" width="108" height="24" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
        <line x1="68" y1="77" x2="172" y2="77" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="68" y1="84" x2="172" y2="84" stroke="#94a3b8" strokeWidth="1.5" />

        {/* AK Letters inside Store Front */}
        {/* Letter 'A' in Dark Navy with gentle curve */}
        <path
          d="M84 140 L97 96 L111 140 H99.5 L96.5 128 H89.5 L87 140 H84Z M91.2 120 H95.2 L93.2 107 Z"
          fill="#0c1e38"
        />
        {/* Letter 'K' in Rich Vibrant Green */}
        <path
          d="M120 96 H128 V113 L142 96 H153 L136 116 L154 140 H142 L128 120 V140 H120 V96 Z"
          fill="#16a34a"
        />
        {/* Green organic leaf swoosh bridging A and K */}
        <path
          d="M93 125 C 105 110, 122 112, 134 118 C 120 126, 106 128, 93 125 Z"
          fill="#22c55e"
        />

        {/* Awning (Striped Canopy: Forest Green & White) */}
        <path
          d="M32 55 L42 28 C44 24 48 22 53 22 H187 C192 22 196 24 198 28 L208 55 Z"
          fill="#15803d"
        />
        {/* White and Green stripes on Awning */}
        <path d="M42 28 L32 55 H54 L60 22 H53 C48 22 44 24 42 28 Z" fill="#15803d" />
        <path d="M60 22 L54 55 H76 L80 22 Z" fill="#ffffff" />
        <path d="M80 22 L76 55 H98 L100 22 Z" fill="#15803d" />
        <path d="M100 22 L98 55 H120 L120 22 Z" fill="#ffffff" />
        <path d="M120 22 L120 55 H142 L140 22 Z" fill="#15803d" />
        <path d="M140 22 L142 55 H164 L160 22 Z" fill="#ffffff" />
        <path d="M160 22 L164 55 H186 L180 22 Z" fill="#15803d" />
        <path d="M180 22 L186 55 H208 L198 28 C196 24 192 22 187 22 Z" fill="#ffffff" />

        {/* Scalloped canopy fringe bottom edge */}
        <path
          d="M32 55 Q 43 68 54 55 Q 65 68 76 55 Q 87 68 98 55 Q 109 68 120 55 Q 131 68 142 55 Q 153 68 164 55 Q 175 68 186 55 Q 197 68 208 55"
          fill="none"
          stroke="#166534"
          strokeWidth="3"
        />

        {/* Side motion energetic sparks (Green accent) */}
        <line x1="28" y1="92" x2="38" y2="97" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="24" y1="108" x2="35" y2="108" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="28" y1="124" x2="38" y2="119" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" />

        {/* Bottom swoosh underline */}
        <path
          d="M40 186 Q 120 170 200 186"
          fill="none"
          stroke="#16a34a"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <defs>
          <linearGradient id="warmInteriorGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="60%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
