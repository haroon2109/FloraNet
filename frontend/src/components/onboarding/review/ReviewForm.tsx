"use client";

import React, { useState } from 'react';
import { UserRound, Home, SlidersHorizontal, Pencil, ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { languageDisplayName } from '@/lib/uiLanguage';

export default function ReviewForm() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(true);
  const [userData, setUserData] = useState<any>({});
  const [farmData, setFarmData] = useState<any>({});
  const [prefData, setPrefData] = useState<any>({});

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setUserData(JSON.parse(localStorage.getItem('floranet_user') || '{}'));
        setFarmData(JSON.parse(localStorage.getItem('floranet_farm') || '{}'));
        setPrefData(JSON.parse(localStorage.getItem('floranet_preferences') || '{}'));
      } catch (e) {}
    }
  }, []);

  const handleComplete = () => {
    if (confirmed) {
      router.push('/home');
    }
  };

  const ReviewRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex w-full py-[2px]">
      <div className="w-[48%] text-[13px] text-[#102A20]">{label}</div>
      <div className="w-[52%] text-[13px] text-[#2F5441]">{value || '—'}</div>
    </div>
  );

  const fullName = userData.fullName || userData.name || 'Farmer';
  const email = userData.email || '—';
  const phone = (userData.phoneCountryCode ? `${userData.phoneCountryCode} ` : '') + (userData.phoneNumber || userData.phone || '—');
  const country = userData.country || 'India';
  const state = userData.state || '—';
  // Stored as a canonical code — show the human label ("हिन्दी (Hindi)")
  // instead of naive capitalisation (which rendered "Hi"/"En-IN").
  const language = languageDisplayName(userData.language);
  const communicationLanguage = prefData.language
    ? languageDisplayName(prefData.language)
    : language;
  const role = userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'Farmer';

  const farmName = farmData.farmName || (fullName !== 'Farmer' ? `${fullName.split(' ')[0]}'s Farm` : 'My Farm');
  const farmLocation = farmData.farmLocation || (state !== '—' ? `${state}, ${country}` : country);
  const totalLandSize = farmData.totalLandSize ? `${farmData.totalLandSize} ${farmData.landUnit || 'acres'}` : '—';
  const landOwnership = farmData.landOwnership ? farmData.landOwnership.charAt(0).toUpperCase() + farmData.landOwnership.slice(1) : '—';
  const primaryCrop = farmData.primaryCrop ? farmData.primaryCrop.charAt(0).toUpperCase() + farmData.primaryCrop.slice(1) : '—';
  const farmingExperience = farmData.farmingExperience || '—';
  const farmType = farmData.farmType ? farmData.farmType.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Open Field';
  const irrigationSource = farmData.irrigationSource ? farmData.irrigationSource.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : '—';
  const soilType = farmData.soilType ? farmData.soilType.charAt(0).toUpperCase() + farmData.soilType.slice(1) : '—';
  const usesFarmManagementTools = farmData.usesFarmManagementTools ? 'Yes' : 'No';
  const organicFarming = farmData.organicFarming ? farmData.organicFarming.charAt(0).toUpperCase() + farmData.organicFarming.slice(1) : 'No';

  const insights = prefData.insights?.length > 0 
    ? prefData.insights.map((i: string) => i.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())).join(', ') 
    : 'Crop Health, Weather Alerts, Soil Health';
  const notifications = prefData.notifications?.length > 0
    ? prefData.notifications.map((n: string) => n.toUpperCase()).join(', ')
    : 'Email, SMS';
  const frequency = prefData.frequency ? prefData.frequency.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Daily summary';
  const areaUnit = prefData.area ? prefData.area.charAt(0).toUpperCase() + prefData.area.slice(1) : 'Acres';
  const tempUnit = prefData.temperature === 'fahrenheit' ? '°F (Fahrenheit)' : '°C (Celsius)';
  const aiPreference = prefData.aiPreference === 'manual' ? 'Manual review only' : 'Yes, personalize my experience';

  return (
    <div className="w-full space-y-[16px] max-w-[480px]">
      
      {/* Card 1: Your Details */}
      <div className="bg-white border border-[#E1EAE2] rounded-[14px] overflow-hidden shadow-sm">
        <div className="h-[46px] bg-[#F5F9F5] border-b border-[#E1EAE2] px-[16px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[28px] h-[28px] rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#075C32]">
              <UserRound size={16} strokeWidth={2} />
            </div>
            <h3 className="text-[14px] font-semibold text-[#102A20]">Your Details</h3>
          </div>
          <button 
            onClick={() => router.push('/onboarding')}
            className="flex items-center gap-1 text-[#075C32] text-[13px] font-medium hover:text-[#064e2a] transition-colors"
          >
            <Pencil size={14} strokeWidth={2} />
            Edit
          </button>
        </div>
        <div className="p-[16px] space-y-[4px]">
          <ReviewRow label="Full Name" value={fullName} />
          <ReviewRow label="Email Address" value={email} />
          <ReviewRow label="Phone Number" value={phone} />
          <ReviewRow label="Country" value={country} />
          <ReviewRow label="State / Province" value={state} />
          <ReviewRow label="Preferred Language" value={language} />
          <ReviewRow label="Role" value={role} />
        </div>
      </div>

      {/* Card 2: Farm Details */}
      <div className="bg-white border border-[#E1EAE2] rounded-[14px] overflow-hidden shadow-sm">
        <div className="h-[46px] bg-[#F5F9F5] border-b border-[#E1EAE2] px-[16px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[28px] h-[28px] rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#075C32]">
              <Home size={16} strokeWidth={2} />
            </div>
            <h3 className="text-[14px] font-semibold text-[#102A20]">Farm Details</h3>
          </div>
          <button 
            onClick={() => router.push('/onboarding/farm')}
            className="flex items-center gap-1 text-[#075C32] text-[13px] font-medium hover:text-[#064e2a] transition-colors"
          >
            <Pencil size={14} strokeWidth={2} />
            Edit
          </button>
        </div>
        <div className="p-[16px] space-y-[4px]">
          <ReviewRow label="Farm Name" value={farmName} />
          <ReviewRow label="Farm Location" value={farmLocation} />
          <ReviewRow label="Total Land Size" value={totalLandSize} />
          <ReviewRow label="Land Ownership" value={landOwnership} />
          <ReviewRow label="Primary Crop" value={primaryCrop} />
          <ReviewRow label="Farming Experience" value={farmingExperience} />
          <ReviewRow label="Farm Type" value={farmType} />
          <ReviewRow label="Irrigation Source" value={irrigationSource} />
          <ReviewRow label="Soil Type" value={soilType} />
          <ReviewRow label="Uses Farm Management Tools" value={usesFarmManagementTools} />
          <ReviewRow label="Organic/Natural Farming" value={organicFarming} />
        </div>
      </div>

      {/* Card 3: Preferences */}
      <div className="bg-white border border-[#E1EAE2] rounded-[14px] overflow-hidden shadow-sm">
        <div className="h-[46px] bg-[#F5F9F5] border-b border-[#E1EAE2] px-[16px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[28px] h-[28px] rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#075C32]">
              <SlidersHorizontal size={16} strokeWidth={2} />
            </div>
            <h3 className="text-[14px] font-semibold text-[#102A20]">Preferences</h3>
          </div>
          <button 
            onClick={() => router.push('/onboarding/preferences')}
            className="flex items-center gap-1 text-[#075C32] text-[13px] font-medium hover:text-[#064e2a] transition-colors"
          >
            <Pencil size={14} strokeWidth={2} />
            Edit
          </button>
        </div>
        <div className="p-[16px] space-y-[4px]">
          <ReviewRow label="Important Insights" value={insights} />
          <ReviewRow label="Notification Channels" value={notifications} />
          <ReviewRow label="Update Frequency" value={frequency} />
          <ReviewRow label="Communication Language" value={communicationLanguage} />
          <ReviewRow label="Area Unit" value={areaUnit} />
          <ReviewRow label="Temperature Unit" value={tempUnit} />
          <ReviewRow label="AI Recommendations" value={aiPreference} />
        </div>
      </div>

      {/* Confirmation Card */}
      <div className="mt-[24px] bg-[#F5F9F5] border border-[#E1EAE2] rounded-[14px] p-5">
        <div className="flex gap-3 mb-4">
          <div className="text-[#075C32] mt-[2px]">
            <ShieldCheck size={20} strokeWidth={2} />
          </div>
          <div>
            <h4 className="text-[15px] font-semibold text-[#102A20]">Everything looks good!</h4>
            <p className="text-[13px] text-[#5B6A63] mt-1">Please confirm that all information is accurate.</p>
          </div>
        </div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            role="checkbox"
            aria-checked={confirmed}
            tabIndex={0}
            className={`w-4 h-4 mt-0.5 rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
              confirmed
                ? 'bg-[#075C32] border-[#075C32]'
                : 'bg-white border-[#DDE6DF] group-hover:border-[#075C32]'
            }`}
            onClick={() => setConfirmed(!confirmed)}
            onKeyDown={(e) => e.key === ' ' && setConfirmed(!confirmed)}
          >
            {confirmed && (
              <Check size={12} strokeWidth={3.5} className="text-white" />
            )}
          </div>
          <span className="text-[13px] text-[#102A20] font-medium leading-snug">
            I confirm that all the information provided is accurate to the best of my knowledge.
          </span>
        </label>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-[16px] pt-4">
        <button
          onClick={() => router.push('/onboarding/preferences')}
          className="h-[50px] px-6 border border-[#DDE6DF] text-[#102A20] rounded-[8px] text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={2} />
          Back
        </button>
        <button
          onClick={handleComplete}
          disabled={!confirmed}
          className="h-[50px] flex-1 bg-[#075C32] hover:bg-[#064e2a] text-white rounded-[8px] text-[15px] font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          Complete Setup
          <Check size={18} strokeWidth={2} />
        </button>
      </div>

      <div className="text-center pt-2">
        <p className="text-[12px] text-[#8C9B94]">
          You can always update your information later in settings.
        </p>
      </div>

    </div>
  );
}
