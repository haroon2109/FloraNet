import React from 'react';

interface LogoProps {
  className?: string;
  withText?: boolean;
  textColor?: string;
}

export default function Logo({ className = "w-8 h-8", withText = true, textColor = "text-[#1a2f24]" }: LogoProps) {
  return (
    <div className="flex items-center gap-1.5 select-none">
      <svg 
        viewBox="0 0 24 24" 
        className={className} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Right Leaf & Stem */}
        <path 
          d="M 10 22 C 10 20 10.5 15.5 12 12.5 C 14 8.5 19 4 22 4 C 22.5 9.5 20 15 16 18 C 14 19.5 12 20 11.5 22 Z" 
          fill="#5a9c42"
        />
        {/* Left Leaf */}
        <path 
          d="M 11 15.5 C 8.5 17 5 16 2.5 14 C 1 11 2 6.5 4.5 5 C 7 3.5 11.5 5.5 13 8.5 C 14 10.5 13 14 11 15.5 Z" 
          fill="#78c257"
        />
        {/* Inner highlights/veins (optional for extra clarity) */}
        <path d="M 12 12.5 C 14 10 17 7 19 6" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        <path d="M 11.5 15.5 C 9 13.5 6 11 4.5 10" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      </svg>
      {withText && (
        <span className={`font-bold tracking-tight ml-0.5 ${textColor}`} style={{ fontSize: `calc(max(1rem, ${className.includes('w-12') ? '32px' : '22px'}))` }}>
          FloraNet
        </span>
      )}
    </div>
  );
}
