"use client";

import React, { useState } from 'react';
import { Leaf, CloudRain, Bug, ClipboardList, Droplets, BadgeDollarSign, Mail, MessageSquare, Bell, Globe2, ChevronDown, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFarm } from '@/context/farmContext';
import { bricsLanguageGroups } from '@/data/bricsLanguages';
import { normalizeLanguageCode } from '@/lib/uiLanguage';

type InsightType = "crop-health" | "weather-alerts" | "pest-disease" | "soil-health" | "irrigation" | "market-prices";
type NotificationType = "email" | "sms" | "push";

export default function PreferencesForm() {
  const router = useRouter();
  // The shared profile is the single source of truth for language — this
  // select writes the SAME canonical code the landing dropdown writes.
  const { updateUserProfile } = useFarm();

  const [insights, setInsights] = useState<InsightType[]>(["crop-health", "weather-alerts", "soil-health"]);
  const [notifications, setNotifications] = useState<NotificationType[]>(["email", "sms"]);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "important-only">("daily");
  const [language, setLanguage] = useState("en-IN");
  const [area, setArea] = useState("acres");
  const [temperature, setTemperature] = useState("celsius");
  const [aiPreference, setAiPreference] = useState<"personalized" | "manual">("personalized");

  const toggleInsight = (id: InsightType) => {
    setInsights(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  };

  const toggleNotification = (id: NotificationType) => {
    setNotifications(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });
  };

  const insightOptions: { id: InsightType; label: string; icon: React.ComponentType<any> }[] = [
    { id: "crop-health", label: "Crop Health", icon: Leaf },
    { id: "weather-alerts", label: "Weather Alerts", icon: CloudRain },
    { id: "pest-disease", label: "Pest & Disease", icon: Bug },
    { id: "soil-health", label: "Soil Health", icon: ClipboardList },
    { id: "irrigation", label: "Irrigation", icon: Droplets },
    { id: "market-prices", label: "Market Prices", icon: BadgeDollarSign },
  ];

  const notificationOptions: { id: NotificationType; label: string; icon: React.ComponentType<any> }[] = [
    { id: "email", label: "Email", icon: Mail },
    { id: "sms", label: "SMS", icon: MessageSquare },
    { id: "push", label: "Push Notifications", icon: Bell },
  ];

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('floranet_preferences') || '{}');
        if (stored.insights) setInsights(stored.insights);
        if (stored.notifications) setNotifications(stored.notifications);
        if (stored.frequency) setFrequency(stored.frequency);
        if (stored.language) setLanguage(normalizeLanguageCode(stored.language));
        if (stored.area) setArea(stored.area);
        if (stored.temperature) setTemperature(stored.temperature);
        if (stored.aiPreference) setAiPreference(stored.aiPreference);
      } catch (e) {}
    }
  }, []);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (insights.length > 0 && notifications.length > 0) {
      if (typeof window !== 'undefined') {
        const code = normalizeLanguageCode(language);
        localStorage.setItem('floranet_preferences', JSON.stringify({
          insights,
          notifications,
          frequency,
          language: code,
          area,
          temperature,
          aiPreference,
        }));
        // Mirror into the shared profile so landing, headers, dates, RTL,
        // voice and AI all follow this pick from the next screen on.
        updateUserProfile({ language: code });
      }
      router.push('/onboarding/review');
    }
  };

  return (
    <form onSubmit={handleContinue} className="w-full space-y-[28px] max-w-[480px]">
      
      {/* Insights */}
      <div className="space-y-[12px]">
        <div className="flex items-baseline gap-2">
          <label className="block text-[14px] font-semibold text-[#102A20]">What insights are most important to you?</label>
          <span className="text-[12px] text-[#5B6A63]">(Select up to 3)</span>
        </div>
        <div className="grid grid-cols-3 gap-[12px]">
          {insightOptions.map(option => {
            const Icon = option.icon;
            const isSelected = insights.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleInsight(option.id)}
                className={`relative h-[86px] flex flex-col items-center justify-center text-center px-2 py-3 rounded-[10px] border transition-all ${
                  isSelected 
                    ? 'border-[#075C32] bg-[#F5F9F5]' 
                    : 'border-[#DDE6DF] bg-white hover:border-[#b4c9bc]'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-[14px] h-[14px] bg-[#075C32] rounded-full flex items-center justify-center">
                    <Check size={10} strokeWidth={3} className="text-white" />
                  </div>
                )}
                <Icon size={24} strokeWidth={1.8} className={`mb-2 ${isSelected ? 'text-[#075C32]' : 'text-[#5B6A63]'}`} />
                <span className={`text-[13px] font-medium leading-tight ${isSelected ? 'text-[#075C32]' : 'text-[#5B6A63]'}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-[12px]">
        <label className="block text-[14px] font-semibold text-[#102A20]">How would you like to receive notifications?</label>
        <div className="grid grid-cols-3 gap-[12px]">
          {notificationOptions.map(option => {
            const Icon = option.icon;
            const isSelected = notifications.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleNotification(option.id)}
                className={`relative h-[86px] flex flex-col items-center justify-center text-center px-2 py-3 rounded-[10px] border transition-all ${
                  isSelected 
                    ? 'border-[#075C32] bg-[#F5F9F5]' 
                    : 'border-[#DDE6DF] bg-white hover:border-[#b4c9bc]'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-[14px] h-[14px] bg-[#075C32] rounded-full flex items-center justify-center">
                    <Check size={10} strokeWidth={3} className="text-white" />
                  </div>
                )}
                <Icon size={24} strokeWidth={1.8} className={`mb-2 ${isSelected ? 'text-[#075C32]' : 'text-[#5B6A63]'}`} />
                <span className={`text-[13px] font-medium leading-tight ${isSelected ? 'text-[#075C32]' : 'text-[#5B6A63]'}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Frequency */}
      <div className="space-y-[12px]">
        <label className="block text-[14px] font-semibold text-[#102A20]">How often would you like to receive updates?</label>
        <div className="flex flex-col gap-[12px]">
          {[
            { id: 'daily', label: 'Daily summary' },
            { id: 'weekly', label: 'Weekly summary' },
            { id: 'important-only', label: 'Only when important' }
          ].map(opt => (
            <label key={opt.id} className="flex items-center gap-[12px] cursor-pointer w-fit">
              <input 
                type="radio" 
                name="frequency"
                checked={frequency === opt.id}
                onChange={() => setFrequency(opt.id as any)}
                className="w-4 h-4 text-[#075C32] border-[#DDE6DF] focus:ring-[#075C32]"
              />
              <span className="text-[14px] text-[#5B6A63]">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="space-y-[8px]">
        <label className="block text-[14px] font-semibold text-[#102A20]">Which languages would you prefer for communications?</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6A63]">
            <Globe2 size={18} strokeWidth={1.8} />
          </div>
          <select 
            className="w-full h-[48px] pl-[40px] pr-8 bg-white border border-[#DDE6DF] focus:border-[#075C32] focus:ring-[#075C32] rounded-[8px] text-[15px] text-[#102A20] appearance-none focus:outline-none focus:ring-1 transition-all"
            value={language}
            onChange={e => setLanguage(e.target.value)}
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
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B6A63] pointer-events-none" />
        </div>
      </div>

      {/* Measurements */}
      <div className="space-y-[8px]">
        <label className="block text-[14px] font-semibold text-[#102A20]">What is your preferred measurement unit?</label>
        <div className="grid grid-cols-2 gap-[16px]">
          <div className="space-y-[6px]">
            <label className="block text-[12px] text-[#5B6A63]">Area</label>
            <div className="relative">
              <select 
                className="w-full h-[48px] pl-4 pr-8 bg-white border border-[#DDE6DF] focus:border-[#075C32] focus:ring-[#075C32] rounded-[8px] text-[14px] text-[#102A20] appearance-none focus:outline-none focus:ring-1 transition-all"
                value={area}
                onChange={e => setArea(e.target.value)}
              >
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B6A63] pointer-events-none" />
            </div>
          </div>
          <div className="space-y-[6px]">
            <label className="block text-[12px] text-[#5B6A63]">Temperature</label>
            <div className="relative">
              <select 
                className="w-full h-[48px] pl-4 pr-8 bg-white border border-[#DDE6DF] focus:border-[#075C32] focus:ring-[#075C32] rounded-[8px] text-[14px] text-[#102A20] appearance-none focus:outline-none focus:ring-1 transition-all"
                value={temperature}
                onChange={e => setTemperature(e.target.value)}
              >
                <option value="celsius">°C (Celsius)</option>
                <option value="fahrenheit">°F (Fahrenheit)</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B6A63] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="space-y-[12px]">
        <label className="block text-[14px] font-semibold text-[#102A20]">Do you want AI-powered recommendations?</label>
        <div className="flex flex-col gap-[12px]">
          <label className="flex items-center gap-[12px] cursor-pointer w-fit">
            <input 
              type="radio" 
              name="ai"
              checked={aiPreference === "personalized"}
              onChange={() => setAiPreference("personalized")}
              className="w-4 h-4 text-[#075C32] border-[#DDE6DF] focus:ring-[#075C32]"
            />
            <span className="text-[14px] text-[#5B6A63]">Yes, personalize my experience</span>
          </label>
          <label className="flex items-center gap-[12px] cursor-pointer w-fit">
            <input 
              type="radio" 
              name="ai"
              checked={aiPreference === "manual"}
              onChange={() => setAiPreference("manual")}
              className="w-4 h-4 text-[#075C32] border-[#DDE6DF] focus:ring-[#075C32]"
            />
            <span className="text-[14px] text-[#5B6A63]">No, I'll explore manually</span>
          </label>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-[16px] pt-2">
        <button
          type="button"
          onClick={() => router.push('/onboarding/farm')}
          className="h-[50px] px-6 border border-[#DDE6DF] text-[#102A20] rounded-[8px] text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={2} />
          Back
        </button>
        <button
          type="submit"
          disabled={insights.length === 0 || notifications.length === 0}
          className="h-[50px] flex-1 bg-[#075C32] hover:bg-[#064e2a] text-white rounded-[8px] text-[15px] font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          Continue
          <ArrowRight size={18} strokeWidth={2} />
        </button>
      </div>

    </form>
  );
}
