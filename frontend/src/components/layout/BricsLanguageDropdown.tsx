"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useFarm } from '@/context/farmContext';
import { useToast } from '@/context/toastContext';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { bricsCountryConfigs } from '@/data/bricsLocalization';

export default function BricsLanguageDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { userProfile, updateUserProfile } = useFarm();
  const { showToast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const countriesList = Object.values(bricsCountryConfigs);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCountry = (countryName: string, stateName: string) => {
    updateUserProfile({ country: countryName, state: stateName });
    setIsOpen(false);
    showToast(`Region switched to ${countryName}`, 'info');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Flag & Currency Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-[#F5F9F6] border border-[#D5E5D8] rounded-xl text-[12.5px] font-bold text-[#102A20] shadow-2xs transition-all cursor-pointer"
        aria-label="Select Region & Currency"
      >
        <span className="text-base leading-none">{userProfile.countryFlag}</span>
        <span className="hidden sm:inline font-semibold">{userProfile.country}</span>
        <span className="px-1.5 py-0.5 bg-[#EAF5EC] text-[#075C32] rounded-md text-[10.5px] font-mono font-bold">
          {userProfile.currencyCode} ({userProfile.currencySymbol})
        </span>
        <ChevronDown size={14} className={`text-[#607469] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#D5E5D8] p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-[#EEF2EF] mb-1 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F9489] flex items-center gap-1.5">
              <Globe size={12} />
              BRICS Agro-Region
            </span>
          </div>

          <div className="space-y-1">
            {countriesList.map((c) => {
              const isSelected = userProfile.country.toLowerCase() === c.country.toLowerCase();

              return (
                <button
                  key={c.country}
                  type="button"
                  onClick={() => handleSelectCountry(c.country, c.defaultLocation.split(',')[1]?.trim() || '')}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#EAF5EC] text-[#075C32] font-bold'
                      : 'hover:bg-[#F5F9F6] text-[#253930]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">{c.flag}</span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold truncate leading-tight">
                        {c.country}
                      </div>
                      <div className="text-[11px] text-[#6E8076] truncate mt-0.5 font-normal">
                        {c.currencyCode} ({c.currencySymbol}) · {c.marketWeightUnit}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={16} className="text-[#075C32] shrink-0" strokeWidth={2.5} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
