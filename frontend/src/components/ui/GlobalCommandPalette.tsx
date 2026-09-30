"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
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
  Globe, 
  Satellite, 
  Layers, 
  CornerDownLeft, 
  X 
} from 'lucide-react';
import { useFarm } from '@/context/farmContext';

interface PaletteItem {
  id: string;
  category: 'Navigation' | 'Actions' | 'BRICS Nations';
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  shortcut?: string;
  onSelect: () => void;
}

export default function GlobalCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { updateUserProfile, userProfile } = useFarm();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Cmd+K / Ctrl+K Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items: PaletteItem[] = useMemo(() => [
    // Navigation
    { id: 'nav-home', category: 'Navigation', title: 'Home Dashboard', subtitle: 'Overview, farm health & recent telemetry', icon: House, onSelect: () => router.push('/home') },
    { id: 'nav-crops', category: 'Navigation', title: 'Crops & Pedology Explorer', subtitle: 'Soil strata, crop growth & BRICS taxonomy', icon: Sprout, onSelect: () => router.push('/crops') },
    { id: 'nav-field-monitor', category: 'Navigation', title: 'Field Monitor & Satellites', subtitle: 'Live Sentinel-2 NDVI & thermal vector', icon: ScanLine, onSelect: () => router.push('/field-monitor') },
    { id: 'nav-weather', category: 'Navigation', title: 'Agro-Meteorology & Radar', subtitle: 'Precipitation, GDD & evapotranspiration', icon: CloudSun, onSelect: () => router.push('/weather') },
    { id: 'nav-alerts', category: 'Navigation', title: 'Active Farm Alerts', subtitle: 'Root-zone moisture, heat stress & pest vector', icon: Bell, onSelect: () => router.push('/alerts') },
    { id: 'nav-market-prices', category: 'Navigation', title: 'Regional Commodity Prices', subtitle: 'Live Mandi, Bolsa & Exchange rates', icon: ChartNoAxesCombined, onSelect: () => router.push('/market-prices') },
    { id: 'nav-ai-assistant', category: 'Navigation', title: 'AI Agronomist Assistant', subtitle: 'Precision, Regenerative & Traditional personas', icon: Sparkles, onSelect: () => router.push('/ai-assistant') },
    { id: 'nav-reports', category: 'Navigation', title: 'Verifiable Reports & DPG', subtitle: 'Export PDF & Schema.org JSON-LD passport', icon: ChartNoAxesColumn, onSelect: () => router.push('/reports') },
    { id: 'nav-resources', category: 'Navigation', title: 'Agronomic Library', subtitle: 'Bio-stimulant formulations & guides', icon: FolderOpen, onSelect: () => router.push('/resources') },
    { id: 'nav-settings', category: 'Navigation', title: 'Account & Farm Settings', subtitle: 'Language, province & notifications', icon: Settings, onSelect: () => router.push('/settings') },

    // Fast Actions
    { id: 'act-scan', category: 'Actions', title: 'Trigger Sentinel-2 Satellite Scan', subtitle: 'Compute live NDVI index across all parcels', icon: Satellite, onSelect: () => router.push('/field-monitor?action=scan') },
    { id: 'act-jeevamrutha', category: 'Actions', title: 'Organic Bio-Stimulant Recipe', subtitle: 'Instant Jeevamrutha preparation manual', icon: Layers, onSelect: () => router.push('/resources#jeevamrutha') },
    { id: 'act-ai-chat', category: 'Actions', title: 'Ask AI: Yield Maximization Protocol', subtitle: 'Direct prompt to Precision Agronomist', icon: WandSparkles, onSelect: () => router.push('/ai-assistant?query=How%20do%20I%20maximize%20yield%20this%20season?') },

    // BRICS Region Switcher
    { id: 'brics-in', category: 'BRICS Nations', title: 'Switch Region: India 🇮🇳', subtitle: 'INR (₹/quintal) · Pune / Maharashtra', icon: Globe, onSelect: () => updateUserProfile({ country: 'India', state: 'Maharashtra' }) },
    { id: 'brics-br', category: 'BRICS Nations', title: 'Switch Region: Brazil 🇧🇷', subtitle: 'BRL (R$/saca) · Sorriso / Mato Grosso', icon: Globe, onSelect: () => updateUserProfile({ country: 'Brazil', state: 'Mato Grosso' }) },
    { id: 'brics-ru', category: 'BRICS Nations', title: 'Switch Region: Russia 🇷🇺', subtitle: 'RUB (₽/ton) · Voronezh / Chernozem Belt', icon: Globe, onSelect: () => updateUserProfile({ country: 'Russia', state: 'Voronezh Oblast' }) },
    { id: 'brics-cn', category: 'BRICS Nations', title: 'Switch Region: China 🇨🇳', subtitle: 'CNY (¥/ton) · Zhengzhou / Henan', icon: Globe, onSelect: () => updateUserProfile({ country: 'China', state: 'Henan' }) },
    { id: 'brics-za', category: 'BRICS Nations', title: 'Switch Region: South Africa 🇿🇦', subtitle: 'ZAR (R/tonne) · Bloemfontein / Free State', icon: Globe, onSelect: () => updateUserProfile({ country: 'South Africa', state: 'Free State' }) },
    { id: 'brics-eg', category: 'BRICS Nations', title: 'Switch Region: Egypt 🇪🇬', subtitle: 'EGP (E£/tonne) · Zagazig / Nile Delta', icon: Globe, onSelect: () => updateUserProfile({ country: 'Egypt', state: 'Sharqia' }) },
    { id: 'brics-et', category: 'BRICS Nations', title: 'Switch Region: Ethiopia 🇪🇹', subtitle: 'ETB (Br/quintal) · Adama / Oromia', icon: Globe, onSelect: () => updateUserProfile({ country: 'Ethiopia', state: 'Oromia' }) },
    { id: 'brics-ir', category: 'BRICS Nations', title: 'Switch Region: Iran 🇮🇷', subtitle: 'IRR (﷼/ton) · Mashhad / Razavi Khorasan', icon: Globe, onSelect: () => updateUserProfile({ country: 'Iran', state: 'Razavi Khorasan' }) },
    { id: 'brics-ae', category: 'BRICS Nations', title: 'Switch Region: UAE 🇦🇪', subtitle: 'AED (Dh/tonne) · Al Ain / Abu Dhabi', icon: Globe, onSelect: () => updateUserProfile({ country: 'UAE', state: 'Abu Dhabi' }) },
  ], [router, updateUserProfile]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  // Keyboard navigation within list
  const handleKeyInList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-3.5 py-2.5 bg-[#075C32] hover:bg-[#054324] text-white rounded-2xl shadow-xl border border-emerald-600/40 flex items-center gap-2.5 text-[12.5px] font-bold transition-all hover:scale-105 group cursor-pointer"
        aria-label="Open Command Palette"
      >
        <Sparkles size={16} className="text-emerald-300" />
        <span className="hidden sm:inline">Spotlight Command</span>
        <kbd className="px-1.5 py-0.5 bg-white/20 rounded-md text-[10px] font-mono tracking-wider">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Spotlight Window */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#D5E5D8] overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Search Bar Input */}
        <div className="p-4 sm:p-5 border-b border-[#EEF2EF] flex items-center gap-3 bg-[#FAFCFA]">
          <Search size={20} className="text-[#075C32] shrink-0" strokeWidth={2.2} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyInList}
            placeholder="Type a command, page, BRICS country, or crop action..."
            className="w-full bg-transparent text-[15px] font-medium text-[#102A20] placeholder-[#7F9489] focus:outline-none"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-[#7F9489] hover:text-[#102A20] hover:bg-[#EEF2EF] rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 sm:p-3 space-y-1 flex-1 divide-y divide-transparent">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-[#7F9489] text-[13.5px]">
              No commands or pages matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.onSelect();
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#EAF5EC] text-[#075C32] font-semibold shadow-2xs' 
                      : 'hover:bg-[#F5F9F6] text-[#33473D]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSelected 
                        ? 'bg-white border-[#C4E7D0] text-[#075C32]' 
                        : 'bg-[#F5F9F6] border-[#E1E8E2] text-[#55695F]'
                    }`}>
                      <Icon size={18} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-bold text-[#102A20] truncate">
                          {item.title}
                        </span>
                        <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#EEF2EF] text-[#55695F]">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#63776D] truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#075C32] shrink-0">
                      <span>Jump</span>
                      <CornerDownLeft size={12} strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div className="p-3 px-5 bg-[#F9FAF9] border-t border-[#EEF2EF] flex items-center justify-between text-[11px] text-[#7F9489]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[#D5E5D8] rounded text-[10px] font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-[#D5E5D8] rounded text-[10px] font-mono">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[#D5E5D8] rounded text-[10px] font-mono">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[#D5E5D8] rounded text-[10px] font-mono">esc</kbd>
              Close
            </span>
          </div>

          <span className="font-medium text-[#075C32]">
            {userProfile.countryFlag} {userProfile.country}
          </span>
        </div>

      </div>
    </div>
  );
}
