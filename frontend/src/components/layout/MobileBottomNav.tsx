"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Sprout, Bell, Sparkles, ChartNoAxesCombined } from 'lucide-react';
import { useFarm } from '@/context/farmContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { alerts } = useFarm();
  const activeAlertCount = alerts?.length || 2;

  const navItems = [
    { label: 'Home', href: '/home', icon: House },
    { label: 'Crops', href: '/crops', icon: Sprout },
    { label: 'Alerts', href: '/alerts', icon: Bell, badge: activeAlertCount },
    { label: 'AI Advisor', href: '/ai-assistant', icon: Sparkles, highlight: true },
    { label: 'Prices', href: '/market-prices', icon: ChartNoAxesCombined },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E1E8E2] px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href));

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-4 group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#075C32] text-white shadow-lg shadow-emerald-900/30 flex items-center justify-center border-2 border-white group-hover:scale-105 transition-transform">
                  <Sparkles size={20} className="text-emerald-300 animate-pulse" />
                </div>
                <span className={`text-[10.5px] font-bold mt-1 ${isActive ? 'text-[#075C32]' : 'text-[#53645D]'}`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
                isActive ? 'text-[#075C32]' : 'text-[#71847A] hover:text-[#102A20]'
              }`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] rounded-full bg-[#E84A3C] text-white text-[9px] font-bold flex items-center justify-center px-1 shadow-xs">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10.5px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#075C32] mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
