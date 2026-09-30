"use client";

import React, { useState } from 'react';
import { House, MapPin, LocateFixed, ChevronDown, Leaf, User, Droplets, Layers3, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FarmTypeSelector from './FarmTypeSelector';

type FarmDetails = {
  farmName: string;
  farmLocation: string;
  latitude?: number;
  longitude?: number;
  totalLandSize: number | '';
  landUnit: "acres";
  landOwnership: string;
  primaryCrop: string;
  farmingExperience: string;
  farmType: "open-field" | "greenhouse" | "orchard";
  irrigationSource: string;
  soilType: string;
  usesFarmManagementTools: boolean;
  organicFarming: "yes" | "transition" | "no";
  confirmationAccepted: boolean;
};

export default function FarmDetailsForm() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<FarmDetails>({
    farmName: '',
    farmLocation: '',
    totalLandSize: '',
    landUnit: 'acres',
    landOwnership: '',
    primaryCrop: '',
    farmingExperience: '',
    farmType: 'open-field',
    irrigationSource: '',
    soilType: '',
    usesFarmManagementTools: false,
    organicFarming: 'no',
    confirmationAccepted: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const handleGPS = () => {
    setIsLocating(true);
    setLocationMessage("");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            farmLocation: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          });
          setIsLocating(false);
        },
        (error) => {
          setIsLocating(false);
          setLocationMessage("Location access was not granted.");
        }
      );
    } else {
      setIsLocating(false);
      setLocationMessage("GPS not supported.");
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.farmName.trim()) newErrors.farmName = 'Required';
    if (!formData.farmLocation.trim()) newErrors.farmLocation = 'Required';
    if (!formData.totalLandSize) newErrors.totalLandSize = 'Required';
    if (!formData.landOwnership) newErrors.landOwnership = 'Required';
    if (!formData.primaryCrop) newErrors.primaryCrop = 'Required';
    if (!formData.farmingExperience) newErrors.farmingExperience = 'Required';
    if (!formData.irrigationSource) newErrors.irrigationSource = 'Required';
    if (!formData.soilType) newErrors.soilType = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('floranet_farm') || '{}');
        const user = JSON.parse(localStorage.getItem('floranet_user') || '{}');
        if (stored.farmName || stored.farmLocation) {
          setFormData(prev => ({ ...prev, ...stored }));
        } else if (user.fullName || user.name) {
          const userName = (user.fullName || user.name).split(' ')[0];
          setFormData(prev => ({ ...prev, farmName: `${userName}'s Farm` }));
        }
      } catch (e) {}
    }
  }, []);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && formData.confirmationAccepted) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('floranet_farm', JSON.stringify(formData));
      }
      router.push('/onboarding/preferences');
    }
  };

  return (
    <form onSubmit={handleContinue} className="w-full space-y-[20px] max-w-[480px]">
      
      {/* Farm Name */}
      <div className="space-y-[8px]">
        <label className="block text-[14px] font-medium text-[#102A20]">Farm Name</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6A63]">
            <House size={18} strokeWidth={1.8} />
          </div>
          <input 
            type="text"
            placeholder="Enter your farm name"
            className={`w-full h-[48px] pl-[40px] pr-4 bg-white border ${errors.farmName ? 'border-red-500 focus:ring-red-500' : 'border-[#DDE6DF] focus:border-[#075C32] focus:ring-[#075C32]'} rounded-[8px] text-[15px] text-[#102A20] placeholder:text-[#8C9B94] focus:outline-none focus:ring-1 transition-all`}
            value={formData.farmName}
            onChange={e => setFormData({...formData, farmName: e.target.value})}
          />
        </div>
      </div>

      {/* Farm Location */}
      <div className="space-y-[8px]">
        <label className="block text-[14px] font-medium text-[#102A20]">Farm Location</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6A63]">
              <MapPin size={18} strokeWidth={1.8} />
            </div>
            <input 
              type="text"
              placeholder="Enter your farm location"
              className={`w-full h-[48px] pl-[40px] pr-4 bg-white border ${errors.farmLocation ? 'border-red-500 focus:ring-red-500' : 'border-[#DDE6DF] focus:border-[#075C32] focus:ring-[#075C32]'} rounded-[8px] text-[15px] text-[#102A20] placeholder:text-[#8C9B94] focus:outline-none focus:ring-1 transition-all`}
              value={formData.farmLocation}
              onChange={e => setFormData({...formData, farmLocation: e.target.value})}
            />
          </div>
          <button 
            type="button"
            onClick={handleGPS}
            className="h-[48px] px-4 flex items-center justify-center gap-2 bg-white border border-[#075C32] text-[#075C32] rounded-[8px] text-[14px] font-medium hover:bg-[#F5F9F5] transition-colors whitespace-nowrap"
          >
            {isLocating ? (
              <div className="w-4 h-4 border-2 border-[#075C32]/30 border-t-[#075C32] rounded-full animate-spin" />
            ) : (
              <LocateFixed size={16} strokeWidth={2} />
            )}
            Use GPS
          </button>
        </div>
        {locationMessage && <p className="text-[12px] text-[#5B6A63]">{locationMessage}</p>}
      </div>

      {/* Land Size & Ownership */}
      <div className="grid grid-cols-2 gap-[16px]">
        <div className="space-y-[8px]">
          <label className="block text-[14px] font-medium text-[#102A20]">Total Land Size</label>
          <div className="flex h-[48px] bg-white border border-[#DDE6DF] rounded-[8px] focus-within:border-[#075C32] focus-within:ring-1 focus-within:ring-[#075C32] transition-all overflow-hidden">
            <input 
              type="number"
              placeholder="0.0"
              step="0.1"
              className="w-[60%] px-4 text-[15px] text-[#102A20] focus:outline-none"
              value={formData.totalLandSize}
              onChange={e => setFormData({...formData, totalLandSize: parseFloat(e.target.value) || ''})}
            />
            <div className="w-[40%] border-l border-[#DDE6DF] relative bg-slate-50">
              <select className="w-full h-full pl-3 pr-8 appearance-none bg-transparent text-[14px] text-[#102A20] focus:outline-none">
                <option value="acres">acres</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5B6A63] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-[8px]">
          <label className="block text-[14px] font-medium text-[#102A20]">Land Ownership</label>
          <div className="relative">
            <select 
              className={`w-full h-[48px] pl-4 pr-10 bg-white border ${errors.landOwnership ? 'border-red-500' : 'border-[#DDE6DF] focus:border-[#075C32] focus:ring-[#075C32]'} rounded-[8px] text-[15px] text-[#102A20] appearance-none focus:outline-none focus:ring-1 transition-all`}
              value={formData.landOwnership}
              onChange={e => setFormData({...formData, landOwnership: e.target.value})}
            >
              <option value="" disabled className="text-[#8C9B94]">Select ownership type</option>
              <option value="owned">Owned</option>
              <option value="leased">Leased</option>
              <option value="shared">Shared</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B6A63] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Primary Crop & Experience */}
      <div className="grid grid-cols-2 gap-[16px]">
        <div className="space-y-[8px]">
          <label className="block text-[14px] font-medium text-[#102A20]">Primary Crop</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6A63]">
              <Leaf size={18} strokeWidth={1.8} />
            </div>
            <select 
              className={`w-full h-[48px] pl-[36px] pr-8 bg-white border ${errors.primaryCrop ? 'border-red-500' : 'border-[#DDE6DF] focus:border-[#075C32] focus:ring-[#075C32]'} rounded-[8px] text-[14px] text-[#102A20] appearance-none focus:outline-none focus:ring-1 transition-all`}
              value={formData.primaryCrop}
              onChange={e => setFormData({...formData, primaryCrop: e.target.value})}
            >
              <option value="" disabled className="text-[#8C9B94]">Select your primary crop</option>
              <option value="rice">Rice</option>
              <option value="wheat">Wheat</option>
              <option value="maize">Maize</option>
              <option value="cotton">Cotton</option>
              <option value="sugarcane">Sugarcane</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="pulses">Pulses</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5B6A63] pointer-events-none" />
          </div>
        </div>

        <div className="space-y-[8px]">
          <label className="block text-[14px] font-medium text-[#102A20]">Farming Experience</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6A63]">
              <User size={18} strokeWidth={1.8} />
            </div>
            <select 
              className={`w-full h-[48px] pl-[36px] pr-8 bg-white border ${errors.farmingExperience ? 'border-red-500' : 'border-[#DDE6DF] focus:border-[#075C32] focus:ring-[#075C32]'} rounded-[8px] text-[14px] text-[#102A20] appearance-none focus:outline-none focus:ring-1 transition-all`}
              value={formData.farmingExperience}
              onChange={e => setFormData({...formData, farmingExperience: e.target.value})}
            >
              <option value="" disabled className="text-[#8C9B94]">Select experience</option>
              <option value="less-than-1">Less than 1 year</option>
              <option value="1-5">1–5 years</option>
              <option value="6-10">6–10 years</option>
              <option value="11-20">11–20 years</option>
              <option value="20-plus">20+ years</option>
            </select>
            <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5B6A63] pointer-events-none" />
          </div>
        </div>
      </div>

      <FarmTypeSelector 
        value={formData.farmType}
        onChange={(val: any) => setFormData({...formData, farmType: val})}
      />

      {/* Irrigation Source & Soil Type */}
      <div className="grid grid-cols-2 gap-[16px]">
        <div className="space-y-[8px]">
          <label className="block text-[14px] font-medium text-[#102A20]">Irrigation Source</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6A63]">
              <Droplets size={18} strokeWidth={1.8} />
            </div>
            <select 
              className={`w-full h-[48px] pl-[36px] pr-8 bg-white border ${errors.irrigationSource ? 'border-red-500' : 'border-[#DDE6DF] focus:border-[#075C32] focus:ring-[#075C32]'} rounded-[8px] text-[14px] text-[#102A20] appearance-none focus:outline-none focus:ring-1 transition-all`}
              value={formData.irrigationSource}
              onChange={e => setFormData({...formData, irrigationSource: e.target.value})}
            >
              <option value="" disabled className="text-[#8C9B94]">Select irrigation source</option>
              <option value="rainfed">Rainfed</option>
              <option value="canal">Canal</option>
              <option value="borewell">Borewell</option>
              <option value="river">River</option>
              <option value="drip">Drip</option>
              <option value="sprinkler">Sprinkler</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5B6A63] pointer-events-none" />
          </div>
        </div>

        <div className="space-y-[8px]">
          <label className="block text-[14px] font-medium text-[#102A20]">Soil Type</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6A63]">
              <Layers3 size={18} strokeWidth={1.8} />
            </div>
            <select 
              className={`w-full h-[48px] pl-[36px] pr-8 bg-white border ${errors.soilType ? 'border-red-500' : 'border-[#DDE6DF] focus:border-[#075C32] focus:ring-[#075C32]'} rounded-[8px] text-[14px] text-[#102A20] appearance-none focus:outline-none focus:ring-1 transition-all`}
              value={formData.soilType}
              onChange={e => setFormData({...formData, soilType: e.target.value})}
            >
              <option value="" disabled className="text-[#8C9B94]">Select soil type</option>
              <option value="loamy">Loamy</option>
              <option value="clay">Clay</option>
              <option value="sandy">Sandy</option>
              <option value="silty">Silty</option>
              <option value="black">Black Soil</option>
              <option value="red">Red Soil</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5B6A63] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Radio Questions */}
      <div className="space-y-[20px] pt-2">
        <div className="space-y-[12px]">
          <label className="block text-[14px] font-semibold text-[#102A20]">Are you using any farm management tools?</label>
          <div className="flex items-center gap-[24px]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="tools" 
                checked={formData.usesFarmManagementTools === true}
                onChange={() => setFormData({...formData, usesFarmManagementTools: true})}
                className="w-4 h-4 text-[#075C32] border-[#DDE6DF] focus:ring-[#075C32]"
              />
              <span className="text-[14px] text-[#102A20]">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="tools" 
                checked={formData.usesFarmManagementTools === false}
                onChange={() => setFormData({...formData, usesFarmManagementTools: false})}
                className="w-4 h-4 text-[#075C32] border-[#DDE6DF] focus:ring-[#075C32]"
              />
              <span className="text-[14px] text-[#102A20]">No</span>
            </label>
          </div>
        </div>

        <div className="space-y-[12px]">
          <label className="block text-[14px] font-semibold text-[#102A20]">Do you practice organic or natural farming?</label>
          <div className="flex items-center gap-[24px]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="organic" 
                checked={formData.organicFarming === 'yes'}
                onChange={() => setFormData({...formData, organicFarming: 'yes'})}
                className="w-4 h-4 text-[#075C32] border-[#DDE6DF] focus:ring-[#075C32]"
              />
              <span className="text-[14px] text-[#102A20]">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="organic" 
                checked={formData.organicFarming === 'transition'}
                onChange={() => setFormData({...formData, organicFarming: 'transition'})}
                className="w-4 h-4 text-[#075C32] border-[#DDE6DF] focus:ring-[#075C32]"
              />
              <span className="text-[14px] text-[#102A20]">In Transition</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="organic" 
                checked={formData.organicFarming === 'no'}
                onChange={() => setFormData({...formData, organicFarming: 'no'})}
                className="w-4 h-4 text-[#075C32] border-[#DDE6DF] focus:ring-[#075C32]"
              />
              <span className="text-[14px] text-[#102A20]">No</span>
            </label>
          </div>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="pt-[8px] pb-[12px]">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            role="checkbox"
            aria-checked={formData.confirmationAccepted}
            tabIndex={0}
            className={`w-4 h-4 mt-0.5 rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
              formData.confirmationAccepted
                ? 'bg-[#075C32] border-[#075C32]'
                : 'bg-white border-[#DDE6DF] group-hover:border-[#075C32]'
            }`}
            onClick={() => setFormData({ ...formData, confirmationAccepted: !formData.confirmationAccepted })}
            onKeyDown={(e) => e.key === ' ' && setFormData({ ...formData, confirmationAccepted: !formData.confirmationAccepted })}
          >
            {formData.confirmationAccepted && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-[13px] text-[#5B6A63] leading-snug">
            I confirm that the information provided is accurate to the best of my knowledge.
          </span>
        </label>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-[16px]">
        <button
          type="button"
          onClick={() => router.push('/onboarding')}
          className="h-[50px] px-6 border border-[#DDE6DF] text-[#102A20] rounded-[8px] text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={2} />
          Back
        </button>
        <button
          type="submit"
          disabled={!formData.confirmationAccepted}
          className="h-[50px] flex-1 bg-[#075C32] hover:bg-[#064e2a] text-white rounded-[8px] text-[15px] font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight size={18} strokeWidth={2} />
        </button>
      </div>

    </form>
  );
}
