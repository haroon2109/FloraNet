"use client";

import React, { useState } from "react";
import { Leaf, Droplet, Sprout } from "lucide-react";

interface FarmProfileInputProps {
  onGenerate?: (soilType: string, crop: string, irrigation: string) => void;
}

export default function FarmProfileInput({ onGenerate }: FarmProfileInputProps) {
  const [soilType, setSoilType] = useState("Loamy");
  const [crop, setCrop] = useState("");
  const [irrigation, setIrrigation] = useState("Rainfed");

  const handleGenerateClick = () => {
    if (onGenerate) {
      onGenerate(soilType, crop, irrigation);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Leaf size={18} className="text-green-600" />
        Farm Profile Setup
      </h3>
      
      <div className="space-y-4">
        {/* Soil Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Soil Texture</label>
          <select 
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-700 outline-none focus:border-green-500"
          >
            <option>Black</option>
            <option>Red</option>
            <option>Loamy</option>
            <option>Alluvial</option>
          </select>
        </div>

        {/* Primary Cash Crop */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Primary Cash Crop</label>
          <div className="relative">
            <Sprout size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="e.g., Cotton, Wheat, Sugarcane"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-green-500"
            />
          </div>
        </div>

        {/* Irrigation Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Irrigation Type</label>
          <div className="grid grid-cols-2 gap-2">
            {["Rainfed", "Drip", "Sprinkler", "Flood"].map((type: any) => (
              <button 
                key={type}
                onClick={() => setIrrigation(type)}
                className={`py-2 text-sm font-medium rounded-lg border flex items-center justify-center gap-1 transition-colors
                  ${irrigation === type 
                    ? "bg-blue-50 border-blue-200 text-blue-700" 
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                {type === "Rainfed" || type === "Flood" ? <Droplet size={14} /> : null}
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleGenerateClick}
        className="w-full mt-5 bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-lg transition-colors"
      >
        Generate 3-Year Plan
      </button>
    </div>
  );
}
