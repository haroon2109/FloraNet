"use client";

import React, { useState, useEffect } from "react";
import Logo from "@/components/ui/Logo";
import { Globe, Wifi, WifiOff } from "lucide-react";
import { useFarm } from "@/context/farmContext";
import { bricsLanguageGroups } from "@/data/bricsLanguages";
import { normalizeLanguageCode } from "@/lib/uiLanguage";

export default function TopBar() {
  const [isOnline, setIsOnline] = useState(true);
  const { userProfile, updateUserProfile } = useFarm();
  // Shared profile-backed language (canonical code) — same source of truth as
  // the landing dropdown, so a change here is felt on every screen.
  const language = normalizeLanguageCode(userProfile?.language);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <header className="bg-green-700 text-white p-3 flex justify-between items-center shadow-md sticky top-0 z-50">
      {/* Brand & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <Logo className="w-6 h-6 md:w-8 md:h-8" />
        <h1 className="font-bold text-lg tracking-tight hidden">FloraNet Edge</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <div className="flex items-center gap-1 bg-green-800 rounded px-2 py-1">
          <Globe size={16} />
          <select 
            className="bg-transparent text-sm outline-none text-white appearance-none cursor-pointer pr-1"
            aria-label="Select Language"
            value={language}
            onChange={(e) => updateUserProfile({ language: normalizeLanguageCode(e.target.value) })}
          >
            {bricsLanguageGroups.map((group) => (
              <optgroup
                key={group.nation}
                label={`${group.flag} ${group.nation}`}
                className="text-black"
              >
                {group.languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-black">
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Network Status */}
        <div className="flex items-center gap-1 text-xs font-semibold">
          {isOnline ? (
            <span className="flex items-center gap-1 text-green-200">
              <Wifi size={16} /> Online
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-300">
              <WifiOff size={16} /> Offline
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
