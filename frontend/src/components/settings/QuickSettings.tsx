"use client";

import React, { useState } from 'react';
import { MapPin, CalendarDays, Droplets, IndianRupee, Languages, Clock } from 'lucide-react';
import { settingsPageData } from '@/data/settingsData';
import { QuickSettingItem } from '@/types/settings';
import SettingsModal from '@/components/settings/SettingsModal';

import { useFarm } from '@/context/farmContext';
import { languageDisplayName } from '@/lib/uiLanguage';

export default function QuickSettings() {
  const { quickSettings } = settingsPageData;
  const { userProfile } = useFarm();
  const [selectedSetting, setSelectedSetting] = useState<QuickSettingItem | null>(null);

  const renderIcon = (type: QuickSettingItem['iconType']) => {
    switch (type) {
      case 'location':
        return <MapPin size={18} strokeWidth={2.2} />;
      case 'calendar':
        return <CalendarDays size={18} strokeWidth={2.2} />;
      case 'irrigation':
        return <Droplets size={18} strokeWidth={2.2} fill="#1A73E8" fillOpacity={0.2} />;
      case 'currency':
        return <IndianRupee size={18} strokeWidth={2.2} />;
      case 'language':
        return <Languages size={18} strokeWidth={2.2} />;
      case 'timezone':
        return <Clock size={18} strokeWidth={2.2} />;
    }
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">
      
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-[16px] font-bold text-[#102A20]">Quick Settings</h3>
        <p className="text-[13px] text-[#52645D] mt-0.5">
          Common settings you might want to update
        </p>
      </div>

      {/* Rows List */}
      <div className="divide-y divide-[#F0F4F1]">
        {quickSettings.map((qs) => {
          const displayVal = qs.iconType === 'location' 
            ? `${userProfile.farmName}, ${userProfile.farmLocation || 'Maharashtra, India'}`
            : qs.iconType === 'language'
              // Live profile language — same value the landing page writes.
              ? languageDisplayName(userProfile.language)
              : qs.value;

          return (
            <div key={qs.id} className="py-3 flex items-center justify-between gap-4 group hover:bg-[#F8FAF8] px-2 rounded-xl transition-colors">
              
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-9 h-9 rounded-full ${qs.iconBg} ${qs.iconColor} flex items-center justify-center shrink-0 border border-black/5`}>
                  {renderIcon(qs.iconType)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-bold text-[#102A20] leading-tight">
                    {qs.title}
                  </h4>
                  <p className="text-[12px] text-[#52645D] mt-0.5 truncate font-medium">
                    {displayVal}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSetting(qs)}
                className="px-3.5 py-1.5 bg-white border border-[#E1E7E3] hover:border-[#C4E7D0] hover:bg-[#EAF5EC] text-[12px] font-bold text-[#168A45] rounded-xl transition-all shadow-xs shrink-0"
              >
                Edit
              </button>

            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {selectedSetting && (
        <SettingsModal 
          setting={selectedSetting} 
          onClose={() => setSelectedSetting(null)} 
        />
      )}

    </div>
  );
}
