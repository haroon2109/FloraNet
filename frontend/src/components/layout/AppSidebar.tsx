"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import {
  House, 
  PanelTop, 
  Sprout, 
  ScanLine, 
  CloudSun,
  Bell, 
  WandSparkles, 
  ChartNoAxesCombined, 
  FolderOpen,
  ChartNoAxesColumn, 
  Settings, 
  Sparkles, 
  Headphones, 
  ChevronDown, 
  AlignLeft
} from 'lucide-react';
import { useFarm } from '@/context/farmContext';

export const NAV_ITEMS = [
  { label: 'Home',            href: '/home',            icon: House },
  { label: 'Dashboard',       href: '/dashboard',       icon: PanelTop },
  { label: 'Crops',           href: '/crops',           icon: Sprout },
  { label: 'Field Monitor',   href: '/field-monitor',   icon: ScanLine },
  { label: 'Weather',         href: '/weather',         icon: CloudSun },
  { label: 'Alerts',          href: '/alerts',          icon: Bell },
  { label: 'Recommendations', href: '/recommendations', icon: WandSparkles },
  { label: 'Market Prices',   href: '/market-prices',   icon: ChartNoAxesCombined },
  { label: 'Resources',       href: '/resources',       icon: FolderOpen },
  { label: 'Reports',         href: '/reports',         icon: ChartNoAxesColumn },
  { label: 'AI Assistant',    href: '/ai-assistant',    icon: Sparkles },
  { label: 'Settings',        href: '/settings',        icon: Settings },
];

interface AppSidebarProps {
  onItemClick?: () => void;
  collapsed?: boolean;
  onToggleSidebar?: () => void;
}

export default function AppSidebar({ onItemClick, collapsed = false, onToggleSidebar }: AppSidebarProps) {
  const pathname = usePathname();
  const { userProfile } = useFarm();

  return (
    <aside className={`h-screen bg-white border-r border-[#E5EAE6] flex flex-col shrink-0 transition-[width] duration-200 ${collapsed ? 'w-[76px]' : 'w-[280px]'}`}>
      <div className={`flex flex-col h-full ${collapsed ? 'p-3' : 'p-5'}`}>

        {/* Top Brand Logo */}
        <div className={`flex items-center mb-6 px-1 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <Link href="/home" className="flex items-center gap-2 group" onClick={onItemClick} aria-label="FloraNet home">
            <Logo className="w-7 h-7" withText={!collapsed} textColor="text-[#075C32]" />
          </Link>
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="text-[#53645D] hover:text-[#102A20] transition-colors p-1 rounded-md hover:bg-[#F5F9F5]"
            >
              <AlignLeft size={20} strokeWidth={1.8} />
            </button>
          )}
        </div>

        {/* Dynamic User Profile Card */}
        <Link 
          href="/settings" 
          onClick={onItemClick}
          title={collapsed ? `${userProfile.fullName} - ${userProfile.farmName}` : undefined}
          className={`flex items-center mb-6 p-2 rounded-xl border border-[#EEF2EF] bg-[#FAFCFA] hover:bg-[#F4F8F5] transition-colors cursor-pointer group ${collapsed ? 'justify-center' : 'justify-between'}`}
        >
          <div className={`flex items-center min-w-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative w-10 h-10 rounded-full bg-[#EEF7F0] overflow-hidden border border-[#D5E5D8] flex items-center justify-center shrink-0">
              <Image 
                src={userProfile.avatarUrl} 
                alt={userProfile.fullName} 
                fill 
                className="object-cover"
                sizes="40px"
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                }}
              />
              <span className="text-[13px] font-bold text-[#075C32]">{userProfile.initials}</span>
            </div>
            {!collapsed && <div className="min-w-0 flex-1">
              <h3 className="text-[14px] font-bold text-[#102A20] leading-tight truncate">{userProfile.fullName}</h3>
              <p className="text-[12px] text-[#53645D] truncate mt-0.5">{userProfile.farmName}</p>
            </div>}
          </div>
          {!collapsed && <ChevronDown size={16} className="text-[#53645D] group-hover:text-[#102A20] transition-colors shrink-0 ml-1" />}
        </Link>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto hide-scrollbar space-y-1 pr-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
                className={`flex items-center rounded-xl text-[13.5px] font-medium transition-all ${collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3.5 py-2.5'} ${
                  active
                    ? 'bg-[#EAF5EC] text-[#075C32] font-bold shadow-2xs'
                    : 'text-[#485951] hover:bg-[#F4F8F5] hover:text-[#102A20]'
                }`}
              >
                <Icon size={19} strokeWidth={active ? 2.2 : 1.8} className={active ? 'text-[#075C32]' : 'text-[#53645D]'} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Support */}
        <div className={`mt-auto flex items-center px-2 pt-4 border-t border-[#EEF2EF] ${collapsed ? 'justify-center' : 'gap-3'}`} title={collapsed ? 'Contact Support' : undefined}>
          <div className="w-8 h-8 rounded-full bg-[#EEF7F0] flex items-center justify-center text-[#075C32] shrink-0">
            <Headphones size={18} strokeWidth={1.8} />
          </div>
          {!collapsed && <div className="min-w-0">
            <h4 className="text-[13px] font-bold text-[#102A20] leading-tight">Need help?</h4>
            <Link 
              href="/resources" 
              onClick={onItemClick}
              className="text-[12px] font-medium text-[#075C32] hover:text-[#054324] transition-colors inline-flex items-center gap-1 mt-0.5"
            >
              Contact Support <span className="text-[13px]">→</span>
            </Link>
          </div>}
        </div>

      </div>
    </aside>
  );
}
