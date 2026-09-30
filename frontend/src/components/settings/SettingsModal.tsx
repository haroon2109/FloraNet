"use client";

import React, { useEffect, useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { QuickSettingItem } from '@/types/settings';

import { useFarm } from '@/context/farmContext';
import { bricsAdministrativeDivisions, getDivisionsForCountry } from '@/data/bricsDivisions';
import { bricsLanguageGroups } from '@/data/bricsLanguages';
import { normalizeLanguageCode } from '@/lib/uiLanguage';

interface SettingsModalProps {
  setting: QuickSettingItem;
  onClose: () => void;
}

export default function SettingsModal({ setting, onClose }: SettingsModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const { userProfile, updateUserProfile } = useFarm();
  // The language row starts from the SHARED profile value (canonical code),
  // not the static label in settingsData.
  const [value, setValue] = useState(
    setting.iconType === 'language'
      ? normalizeLanguageCode(userProfile?.language)
      : setting.value
  );
  const [selectedCountry, setSelectedCountry] = useState<string>('India');

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const renderInput = () => {
    if (setting.iconType === 'location') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-[#52645D] mb-1 uppercase tracking-wider">Farm Name</label>
            <input 
              type="text" 
              defaultValue={userProfile.farmName}
              onChange={(e) => updateUserProfile({ farmName: e.target.value })}
              className="w-full bg-white border border-[#E1E7E3] rounded-lg px-3 py-2 text-[13px] font-semibold text-[#102A20] focus:outline-none focus:ring-2 focus:ring-[#168A45]/30" 
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#52645D] mb-1 uppercase tracking-wider">BRICS Member Nation</label>
            <select 
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                const divs = getDivisionsForCountry(e.target.value);
                if (divs.length > 0) {
                  updateUserProfile({ farmLocation: `${divs[0].name}, ${e.target.value}` });
                }
              }}
              className="w-full bg-white border border-[#E1E7E3] rounded-lg px-3 py-2 text-[13px] font-semibold text-[#102A20] focus:outline-none focus:ring-2 focus:ring-[#168A45]/30"
            >
              <option value="India">🇮🇳 India (28 States, 8 UTs)</option>
              <option value="Brazil">🇧🇷 Brazil (26 States, DF)</option>
              <option value="Russia">🇷🇺 Russia (46 Oblasts, 2 Federal Cities)</option>
              <option value="China">🇨🇳 China (22 Provinces, 5 ARs, 4 Municipalities)</option>
              <option value="South Africa">🇿🇦 South Africa (9 Provinces)</option>
              <option value="Egypt">🇪🇬 Egypt (27 Governorates)</option>
              <option value="Ethiopia">🇪🇹 Ethiopia (12 Regional States, 2 Chartered Cities)</option>
              <option value="Iran">🇮🇷 Iran (31 Provinces)</option>
              <option value="UAE">🇦🇪 UAE (7 Emirates)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#52645D] mb-1 uppercase tracking-wider">State / Province / Division</label>
            <select 
              onChange={(e) => updateUserProfile({ farmLocation: `${e.target.value}, ${selectedCountry}` })}
              className="w-full bg-white border border-[#E1E7E3] rounded-lg px-3 py-2 text-[13px] font-semibold text-[#102A20] focus:outline-none focus:ring-2 focus:ring-[#168A45]/30"
            >
              {getDivisionsForCountry(selectedCountry).map((div) => (
                <option key={div.name} value={div.name}>
                  {div.name} ({div.type})
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    if (setting.iconType === 'language') {
      return (
        <div className="space-y-3">
          <label className="block text-[11px] font-bold text-[#52645D] mb-1 uppercase tracking-wider">Select Language</label>
          <select
            value={normalizeLanguageCode(value)}
            onChange={(e) => {
              const code = normalizeLanguageCode(e.target.value);
              setValue(code);
              // Written straight to the shared profile: landing, headers,
              // RTL, dates and AI prompts all follow this one value.
              updateUserProfile({ language: code });
            }}
            className="w-full bg-white border border-[#E1E7E3] rounded-lg px-3 py-2 text-[13px] font-semibold text-[#102A20] focus:outline-none focus:ring-2 focus:ring-[#168A45]/30"
          >
            {bricsLanguageGroups.map((group) => (
              <optgroup key={group.nation} label={`${group.flag} ${group.nation}`}>
                {group.languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className="text-[11px] text-[#52645D] font-medium leading-relaxed">
            Applies everywhere you use FloraNet — pages, dates, voice input and AI replies.
          </p>
        </div>
      );
    }

    if (setting.iconType === 'currency' || setting.iconType === 'irrigation') {
       return (
         <div className="space-y-3">
            <label className="block text-[11px] font-bold text-[#52645D] mb-1 uppercase tracking-wider">Select Value</label>
            <select 
              value={value} 
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-white border border-[#E1E7E3] rounded-lg px-3 py-2 text-[13px] font-semibold text-[#102A20] focus:outline-none focus:ring-2 focus:ring-[#168A45]/30"
            >
              <option value={setting.value}>{setting.value}</option>
              <option value="Alternative A">Option 1</option>
              <option value="Alternative B">Option 2</option>
            </select>
         </div>
       );
    }

    return (
      <div>
        <label className="block text-[11px] font-bold text-[#52645D] mb-1 uppercase tracking-wider">{setting.title}</label>
        <input 
          type="text" 
          value={value} 
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-white border border-[#E1E7E3] rounded-lg px-3 py-2 text-[13px] font-semibold text-[#102A20] focus:outline-none focus:ring-2 focus:ring-[#168A45]/30" 
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102A20]/40 backdrop-blur-xs transition-opacity">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden border border-[#E1E7E3]" 
        role="dialog" 
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E1E7E3] bg-[#F9FBF9]">
          <h3 className="text-[15px] font-bold text-[#102A20]">Edit {setting.title}</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#52645D] hover:bg-[#EEF2EF] transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-5">
          {renderInput()}
          
          {isSuccess && (
            <div className="mt-4 flex items-center gap-2 text-[12px] font-semibold text-[#168A45] bg-[#EAF5EC] p-2.5 rounded-xl border border-[#C4E7D0]">
              <CheckCircle2 size={16} strokeWidth={2.2} />
              Farm settings updated successfully.
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="p-4 bg-[#F7F9F7] border-t border-[#E1E7E3] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-semibold text-[#52645D] hover:text-[#102A20] transition-colors"
            disabled={isSuccess}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSuccess}
            className="px-5 py-2 bg-[#168A45] text-white rounded-xl text-[13px] font-bold hover:bg-[#075C32] transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-[#168A45]/40 disabled:opacity-50"
          >
            {isSuccess ? 'Saved' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
