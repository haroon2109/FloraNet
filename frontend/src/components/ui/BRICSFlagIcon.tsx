"use client";

import React from 'react';

export function BrazilFlag({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={`${className} rounded-full shadow-xs shrink-0 overflow-hidden`}>
      {/* Green Field */}
      <rect width="36" height="36" fill="#009739" />
      {/* Yellow Rhombus (Federal Standard Geometry) */}
      <polygon points="18,4.5 32.5,18 18,31.5 3.5,18" fill="#FEDF00" />
      {/* Blue Celestial Globe */}
      <circle cx="18" cy="18" r="7.5" fill="#002776" />
      {/* White Curved Equatorial Band */}
      <path
        d="M 10.8,18.8 C 13.5,16 22.5,16 25.2,19.2"
        stroke="#FFFFFF"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Star Constellation Accents */}
      <circle cx="18" cy="14.5" r="0.45" fill="#FFFFFF" />
      <circle cx="16.5" cy="20.5" r="0.4" fill="#FFFFFF" />
      <circle cx="18" cy="21.5" r="0.4" fill="#FFFFFF" />
      <circle cx="19.5" cy="20.5" r="0.4" fill="#FFFFFF" />
      <circle cx="18" cy="23" r="0.35" fill="#FFFFFF" />
      <circle cx="21" cy="22" r="0.35" fill="#FFFFFF" />
    </svg>
  );
}

export function RussiaFlag({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={`${className} rounded-full shadow-xs shrink-0 overflow-hidden`}>
      {/* Top Stripe: White */}
      <rect x="0" y="0" width="36" height="12" fill="#FFFFFF" />
      {/* Middle Stripe: Blue */}
      <rect x="0" y="12" width="36" height="12" fill="#0039A6" />
      {/* Bottom Stripe: Red */}
      <rect x="0" y="24" width="36" height="12" fill="#D52B1E" />
      {/* Subtle border to define white top stripe against light backgrounds */}
      <circle cx="18" cy="18" r="17.5" fill="none" stroke="#DDE6DF" strokeWidth="1" />
    </svg>
  );
}

export function IndiaFlag({ className = "w-7 h-7" }: { className?: string }) {
  // Generate authentic 24 radial spokes for the Ashoka Chakra
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 15 * Math.PI) / 180;
    const x2 = 18 + 4.1 * Math.cos(angle);
    const y2 = 18 + 4.1 * Math.sin(angle);
    return <line key={i} x1="18" y1="18" x2={x2} y2={y2} stroke="#000080" strokeWidth="0.5" strokeLinecap="round" />;
  });

  return (
    <svg viewBox="0 0 36 36" className={`${className} rounded-full shadow-xs shrink-0 overflow-hidden`}>
      {/* Saffron Top Stripe */}
      <rect x="0" y="0" width="36" height="12" fill="#FF9933" />
      {/* White Middle Stripe */}
      <rect x="0" y="12" width="36" height="12" fill="#FFFFFF" />
      {/* India Green Bottom Stripe */}
      <rect x="0" y="24" width="36" height="12" fill="#138808" />
      
      {/* Ashoka Chakra Wheel */}
      <circle cx="18" cy="18" r="4.6" stroke="#000080" strokeWidth="0.8" fill="none" />
      {spokes}
      <circle cx="18" cy="18" r="1.1" fill="#000080" />
      <circle cx="18" cy="18" r="17.5" fill="none" stroke="#DDE6DF" strokeWidth="1" />
    </svg>
  );
}

export function ChinaFlag({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={`${className} rounded-full shadow-xs shrink-0 overflow-hidden`}>
      {/* Red Field */}
      <rect width="36" height="36" fill="#EE1C25" />
      
      {/* Large Star */}
      <polygon 
        points="9.5,4.5 10.7,8.2 14.6,8.2 11.5,10.5 12.7,14.2 9.5,11.9 6.3,14.2 7.5,10.5 4.4,8.2 8.3,8.2" 
        fill="#FFDE00" 
      />
      
      {/* 4 Small Stars in Proper Celestial Arc */}
      {/* Star 1 */}
      <polygon points="17,5 17.5,6.5 19,6.5 17.8,7.4 18.2,8.9 17,8 15.8,8.9 16.2,7.4 15,6.5 16.5,6.5" fill="#FFDE00" transform="rotate(25 17 7)" />
      {/* Star 2 */}
      <polygon points="19.5,8.5 20,10 21.5,10 20.3,10.9 20.7,12.4 19.5,11.5 18.3,12.4 18.7,10.9 17.5,10 19,10" fill="#FFDE00" transform="rotate(45 19.5 10.5)" />
      {/* Star 3 */}
      <polygon points="19.5,13.5 20,15 21.5,15 20.3,15.9 20.7,17.4 19.5,16.5 18.3,17.4 18.7,15.9 17.5,15 19,15" fill="#FFDE00" transform="rotate(70 19.5 15.5)" />
      {/* Star 4 */}
      <polygon points="17,17 17.5,18.5 19,18.5 17.8,19.4 18.2,20.9 17,20 15.8,20.9 16.2,19.4 15,18.5 16.5,18.5" fill="#FFDE00" transform="rotate(95 17 19)" />
    </svg>
  );
}

export function SouthAfricaFlag({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={`${className} rounded-full shadow-xs shrink-0 overflow-hidden`}>
      {/* Top Chilli Red Stripe */}
      <rect x="0" y="0" width="36" height="18" fill="#E03C31" />
      {/* Bottom Blue Stripe */}
      <rect x="0" y="18" width="36" height="18" fill="#001489" />
      
      {/* White Y-Pall Border */}
      <polygon points="0,0 18,18 0,36" fill="#FFFFFF" />
      <rect x="14" y="13" width="22" height="10" fill="#FFFFFF" />

      {/* Inner Green Y-Pall */}
      <polygon points="0,2.5 15.5,18 0,33.5" fill="#007749" />
      <rect x="14" y="15.2" width="22" height="5.6" fill="#007749" />

      {/* Gold / Yellow Chevron */}
      <polygon points="0,6 12,18 0,30" fill="#FFB81C" />

      {/* Black Hoist Triangle */}
      <polygon points="0,8.8 9.2,18 0,27.2" fill="#000000" />
    </svg>
  );
}

export function EgyptFlag({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={`${className} rounded-full shadow-xs shrink-0 overflow-hidden`}>
      {/* Top Red Stripe */}
      <rect x="0" y="0" width="36" height="12" fill="#CE1126" />
      {/* Middle White Stripe */}
      <rect x="0" y="12" width="36" height="12" fill="#FFFFFF" />
      {/* Bottom Black Stripe */}
      <rect x="0" y="24" width="36" height="12" fill="#000000" />
      {/* Eagle of Saladin (simplified gold emblem) */}
      <circle cx="18" cy="18" r="3.1" fill="#C09300" />
      <circle cx="18" cy="18" r="17.5" fill="none" stroke="#DDE6DF" strokeWidth="1" />
    </svg>
  );
}

export function EthiopiaFlag({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={`${className} rounded-full shadow-xs shrink-0 overflow-hidden`}>
      {/* Top Green Stripe */}
      <rect x="0" y="0" width="36" height="12" fill="#078930" />
      {/* Middle Yellow Stripe */}
      <rect x="0" y="12" width="36" height="12" fill="#FCDD09" />
      {/* Bottom Red Stripe */}
      <rect x="0" y="24" width="36" height="12" fill="#DA121A" />
      {/* Blue Disc */}
      <circle cx="18" cy="18" r="6.2" fill="#0F47AF" />
      {/* Golden Pentagram (simplified star) */}
      <polygon
        points="18,13.6 19.1,16.5 22.2,16.5 19.7,18.4 20.6,21.3 18,19.5 15.4,21.3 16.3,18.4 13.8,16.5 16.9,16.5"
        fill="#FCDD09"
      />
    </svg>
  );
}

export function IranFlag({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={`${className} rounded-full shadow-xs shrink-0 overflow-hidden`}>
      {/* Top Green Stripe */}
      <rect x="0" y="0" width="36" height="12" fill="#239F40" />
      {/* Middle White Stripe */}
      <rect x="0" y="12" width="36" height="12" fill="#FFFFFF" />
      {/* Bottom Red Stripe */}
      <rect x="0" y="24" width="36" height="12" fill="#DA0000" />
      {/* Emblem (stylized red tulip mark) */}
      <circle cx="18" cy="18" r="2.6" fill="#DA0000" />
      <circle cx="18" cy="18" r="17.5" fill="none" stroke="#DDE6DF" strokeWidth="1" />
    </svg>
  );
}

export function UAEFlag({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={`${className} rounded-full shadow-xs shrink-0 overflow-hidden`}>
      {/* Vertical Red Hoist Band */}
      <rect x="0" y="0" width="10" height="36" fill="#CE1126" />
      {/* Horizontal Green (top) */}
      <rect x="10" y="0" width="26" height="12" fill="#00732F" />
      {/* Horizontal White (middle) */}
      <rect x="10" y="12" width="26" height="12" fill="#FFFFFF" />
      {/* Horizontal Black (bottom) */}
      <rect x="10" y="24" width="26" height="12" fill="#000000" />
    </svg>
  );
}

export default function BRICSFlag({ 
  country, 
  className = "w-7 h-7" 
}: { 
  country: string; 
  className?: string; 
}) {
  const norm = country.toLowerCase().trim();
  if (norm.includes('brazil') || norm === 'br') return <BrazilFlag className={className} />;
  if (norm.includes('russia') || norm === 'ru') return <RussiaFlag className={className} />;
  if (norm.includes('india') || norm === 'in') return <IndiaFlag className={className} />;
  if (norm.includes('china') || norm === 'cn') return <ChinaFlag className={className} />;
  if (norm.includes('south africa') || norm.includes('africa') || norm === 'za') return <SouthAfricaFlag className={className} />;
  if (norm === 'egypt' || norm === 'eg') return <EgyptFlag className={className} />;
  if (norm === 'ethiopia' || norm === 'et') return <EthiopiaFlag className={className} />;
  if (norm === 'iran' || norm === 'ir') return <IranFlag className={className} />;
  if (norm === 'uae' || norm === 'united arab emirates' || norm === 'ae') return <UAEFlag className={className} />;
  return <IndiaFlag className={className} />;
}
