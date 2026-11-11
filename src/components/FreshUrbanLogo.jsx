"use client";

import React from 'react';

export default function FreshUrbanLogo({ size = 48, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 240 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Warm Cream Glow */}
        <ellipse cx="120" cy="140" rx="60" ry="35" fill="#F3F1E9" opacity="0.9" />

        {/* Outer Charcoal Store Frame (#283B3D) */}
        <rect x="52" y="55" width="136" height="110" rx="10" fill="#283B3D" />
        
        {/* Base Platform */}
        <rect x="36" y="156" width="168" height="14" rx="7" fill="#283B3D" />

        {/* Store Interior Light */}
        <rect x="68" y="80" width="104" height="76" rx="4" fill="#ffffff" />

        {/* Store Shutter in Soft Sage (#DCE9E3) */}
        <rect x="66" y="70" width="108" height="24" rx="3" fill="#DCE9E3" stroke="#b7cdc3" strokeWidth="2" />
        <line x1="68" y1="77" x2="172" y2="77" stroke="#b7cdc3" strokeWidth="1.5" />
        <line x1="68" y1="84" x2="172" y2="84" stroke="#b7cdc3" strokeWidth="1.5" />

        {/* Letter 'A' in Deep Charcoal (#283B3D) */}
        <path
          d="M84 140 L97 96 L111 140 H99.5 L96.5 128 H89.5 L87 140 H84Z M91.2 120 H95.2 L93.2 107 Z"
          fill="#283B3D"
        />
        {/* Letter 'K' in Deep Teal (#176B65) */}
        <path
          d="M120 96 H128 V113 L142 96 H153 L136 116 L154 140 H142 L128 120 V140 H120 V96 Z"
          fill="#176B65"
        />
        {/* Organic Leaf Accent in Deep Teal (#176B65) */}
        <path
          d="M93 125 C 105 110, 122 112, 134 118 C 120 126, 106 128, 93 125 Z"
          fill="#176B65"
        />

        {/* Awning Canopy: Teal (#176B65) and Warm Ivory (#F3F1E9) Stripes */}
        <path
          d="M32 55 L42 28 C44 24 48 22 53 22 H187 C192 22 196 24 198 28 L208 55 Z"
          fill="#176B65"
        />
        <path d="M42 28 L32 55 H54 L60 22 H53 C48 22 44 24 42 28 Z" fill="#176B65" />
        <path d="M60 22 L54 55 H76 L80 22 Z" fill="#F3F1E9" />
        <path d="M80 22 L76 55 H98 L100 22 Z" fill="#176B65" />
        <path d="M100 22 L98 55 H120 L120 22 Z" fill="#F3F1E9" />
        <path d="M120 22 L120 55 H142 L140 22 Z" fill="#176B65" />
        <path d="M140 22 L142 55 H164 L160 22 Z" fill="#F3F1E9" />
        <path d="M160 22 L164 55 H186 L180 22 Z" fill="#176B65" />
        <path d="M180 22 L186 55 H208 L198 28 C196 24 192 22 187 22 Z" fill="#F3F1E9" />

        {/* Scalloped canopy fringe */}
        <path
          d="M32 55 Q 43 68 54 55 Q 65 68 76 55 Q 87 68 98 55 Q 109 68 120 55 Q 131 68 142 55 Q 153 68 164 55 Q 175 68 186 55 Q 197 68 208 55"
          fill="none"
          stroke="#125550"
          strokeWidth="3"
        />

        {/* Side Energy Rays in Deep Teal (#176B65) */}
        <line x1="28" y1="92" x2="38" y2="97" stroke="#176B65" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="24" y1="108" x2="35" y2="108" stroke="#176B65" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="28" y1="124" x2="38" y2="119" stroke="#176B65" strokeWidth="4.5" strokeLinecap="round" />

        {/* Bottom Swoosh Underline in Deep Teal (#176B65) */}
        <path
          d="M40 186 Q 120 170 200 186"
          fill="none"
          stroke="#176B65"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

