"use client";

import React, { useState } from 'react';
import AppSidebar from './AppSidebar';
import MobileBottomNav from './MobileBottomNav';
import BricsLanguageDropdown from './BricsLanguageDropdown';
import NetworkStatusIndicator from '@/components/ui/NetworkStatusIndicator';
import { Menu, X, Bell, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeRouteName?: string;
}

export default function DashboardLayout({ children, activeRouteName }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  return (
    <div className="flex w-full min-h-screen bg-[#F7F9F7] font-sans text-[#102A20] selection:bg-[#EAF5EC] selection:text-[#168A45]">
      
      {/* Desktop Sticky Left Sidebar (280px) */}
      <div className={`hidden lg:block shrink-0 h-screen sticky top-0 z-40 transition-[width] duration-200 ${desktopSidebarCollapsed ? 'w-[76px]' : 'w-[280px]'}`}>
        <AppSidebar
          collapsed={desktopSidebarCollapsed}
          onToggleSidebar={() => setDesktopSidebarCollapsed((collapsed) => !collapsed)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[280px] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#52645D] hover:text-[#102A20] hover:bg-[#F5F9F6] rounded-lg transition-colors cursor-pointer"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
            <AppSidebar onItemClick={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Global Desktop & Mobile Top Header Bar */}
        <header className="h-14 lg:h-16 px-4 sm:px-6 md:px-8 bg-white/85 backdrop-blur-md border-b border-[#E1E7E3] flex items-center justify-between sticky top-0 z-30">
          {/* Left: Mobile Toggle & Brand or Active Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#102A20] hover:bg-[#F5F9F6] rounded-lg transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <Link href="/home" className="flex items-center gap-1.5 lg:hidden">
              <Logo className="w-6 h-6" withText={true} textColor="text-[#075C32]" />
            </Link>

            <div className="hidden lg:flex items-center gap-2 text-[12px] font-bold text-[#6D8075] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#168A45] animate-pulse" />
              <span>FloraNet Autonomous Farm System</span>
            </div>
          </div>

          {/* Right: Network Status, BRICS Dropdown & Notifications */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <NetworkStatusIndicator />
            <BricsLanguageDropdown />

            <Link
              href="/alerts"
              className="p-2 text-[#52645D] hover:text-[#075C32] hover:bg-[#F5F9F6] rounded-xl transition-colors relative border border-transparent hover:border-[#D5E5D8]"
              aria-label="View alerts"
            >
              <Bell size={19} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E84A3C]" />
            </Link>
          </div>
        </header>

        {/* Page Content Viewport with smooth entrance animation */}
        <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] w-full mx-auto flex-1 flex flex-col pb-24 lg:pb-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-150">
          {children}
        </div>

      </div>

      {/* Persistent Frosted Glass Mobile Bottom Navigation */}
      <MobileBottomNav />

    </div>
  );
}
