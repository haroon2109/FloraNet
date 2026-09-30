"use client";

import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  X, 
  Check, 
  Sparkles, 
  Info,
  ChevronRight
} from 'lucide-react';
import { bricsLanguageGroups, BRICSLanguage, allBRICSLanguages } from '@/data/bricsLanguages';

/** Nation filter tabs, in BRICS membership order (founding five, then 2024 joiners). */
const NATION_TABS = ['All', 'Brazil', 'Russia', 'India', 'China', 'South Africa', 'Egypt', 'Ethiopia', 'Iran', 'UAE'] as const;

/** Flag emoji for each nation tab. */
const NATION_FLAG: Record<string, string> = {
  Brazil: '🇧🇷', Russia: '🇷🇺', India: '🇮🇳', China: '🇨🇳', 'South Africa': '🇿🇦',
  Egypt: '🇪🇬', Ethiopia: '🇪🇹', Iran: '🇮🇷', UAE: '🇦🇪',
};

interface BRICSLanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCode?: string;
  onSelectLanguage: (language: BRICSLanguage) => void;
}

export default function BRICSLanguageSelectorModal({
  isOpen,
  onClose,
  selectedCode = 'en-IN',
  onSelectLanguage
}: BRICSLanguageSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNation, setSelectedNation] = useState<string>('All');

  if (!isOpen) return null;

  const filteredGroups = bricsLanguageGroups.map(group => {
    if (selectedNation !== 'All' && group.nation !== selectedNation) {
      return null;
    }
    const matchingLangs = group.languages.filter(l => 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (matchingLangs.length === 0) return null;
    return {
      ...group,
      languages: matchingLangs
    };
  }).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E1E8E4] overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-[#F4FAF6] via-white to-[#F7FAF8] border-b border-[#E3ECE6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#075C32] text-white flex items-center justify-center shadow-xs shrink-0">
              <Globe size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-bold text-[#102A20]">
                  BRICS Multilingual Gateway
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E8F5EB] text-[#075C32] px-2 py-0.5 rounded-full border border-[#CDE5D5]">
                  Official Languages
                </span>
              </div>
              <p className="text-[12px] text-[#55695F] mt-0.5">
                Select your preferred official language across Brazil, Russia, India, China & South Africa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#61756B] hover:text-[#102A20] hover:bg-[#EEF5F0] rounded-xl transition-colors"
            aria-label="Close language selector"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-[#E8EFEA] bg-[#FAFCFA] space-y-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A8E83]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language in English or native script (e.g. Hindi, Zulu, Portuguese, Русский, 中文)..."
              className="w-full bg-white border border-[#E0E8E3] rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-[#102A20] placeholder-[#8A9B92] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#168A45]/30 focus:border-[#168A45]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Nation Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {NATION_TABS.map((nation) => (
              <button
                key={nation}
                onClick={() => setSelectedNation(nation)}
                className={`px-3 py-1 text-[11.5px] font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                  selectedNation === nation
                    ? 'bg-[#075C32] text-white shadow-xs'
                    : 'bg-white text-[#52645D] hover:bg-[#EEF5F0] border border-[#E2EBE5]'
                }`}
              >
                {nation === 'India' && '🇮🇳 India (22)'}
                {nation === 'South Africa' && '🇿🇦 South Africa (12)'}
                {nation !== 'India' && nation !== 'South Africa' && (
                  <>{nation === 'All' ? '🌐 All BRICS Nations' : `${NATION_FLAG[nation] || ''} ${nation}`}</>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Language List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 divide-y divide-[#EDF3EF]">
          {filteredGroups.length === 0 ? (
            <div className="py-12 text-center text-[#61756B]">
              <p className="text-[14px] font-semibold">No matching BRICS languages found</p>
              <p className="text-[12px] text-[#889B91] mt-1">Try typing the country name or language in native script</p>
            </div>
          ) : (
            filteredGroups.map((group: any) => (
              <div key={group.nation} className="pt-4 first:pt-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{group.flag}</span>
                    <h4 className="text-[14px] font-bold text-[#102A20]">
                      {group.nation}
                    </h4>
                    <span className="text-[11px] text-[#55695F] font-medium">
                      ({group.languages.length} {group.languages.length === 1 ? 'language' : 'languages'})
                    </span>
                  </div>
                </div>

                <p className="text-[11.5px] text-[#61756B] mb-3 leading-tight">
                  {group.officialDescription}
                </p>

                {/* Grid of Languages */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.languages.map((lang: BRICSLanguage) => {
                    const isSelected = selectedCode.toLowerCase() === lang.code.toLowerCase() ||
                                       selectedCode.toLowerCase() === lang.name.toLowerCase();

                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          onSelectLanguage(lang);
                          onClose();
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all group ${
                          isSelected
                            ? 'bg-[#EAF6EE] border-[#168A45] text-[#075C32] shadow-xs'
                            : 'bg-white hover:bg-[#F8FAF9] border-[#E3ECE6] hover:border-[#CADBD0] text-[#102A20]'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold truncate">
                              {lang.name}
                            </span>
                            {lang.isOfficialFederal && (
                              <span className="text-[9px] font-bold uppercase bg-[#E8F3EA] text-[#075C32] px-1.5 py-0.2 rounded border border-[#CCE2D2]">
                                Official
                              </span>
                            )}
                          </div>
                          <span className="text-[11.5px] text-[#55695F] font-medium block truncate mt-0.5">
                            {lang.nativeName}
                          </span>
                        </div>

                        <div className="shrink-0 flex items-center">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-[#168A45] text-white flex items-center justify-center">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          ) : (
                            <ChevronRight size={14} className="text-[#9DB0A6] group-hover:text-[#102A20] transition-colors" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info strip */}
        <div className="p-3.5 bg-[#F7F9F7] border-t border-[#E3ECE6] flex items-center justify-between text-[11.5px] text-[#55695F]">
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#168A45]" />
            <span>FloraNet AI automatically formats agronomic recommendations in your chosen language.</span>
          </div>
          <span className="font-semibold text-[#075C32]">{allBRICSLanguages.length} Official Languages</span>
        </div>

      </div>

    </div>
  );
}
