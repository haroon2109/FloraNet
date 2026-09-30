import React from "react";
import { Activity } from "lucide-react";

interface SoilHealthProps {
  assessment: string;
  degradationIndex: number;
}

export default function SoilHealthGauges({ assessment, degradationIndex }: SoilHealthProps) {
  // Convert 0.0 - 1.0 to percentage
  const degradationPercent = Math.round(degradationIndex * 100);
  
  // Determine color based on severity
  let color = "text-green-500";
  let bgColor = "bg-green-500";
  if (degradationPercent > 40) {
    color = "text-yellow-500";
    bgColor = "bg-yellow-500";
  }
  if (degradationPercent > 70) {
    color = "text-red-500";
    bgColor = "bg-red-500";
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mt-6">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Activity size={18} className="text-purple-600" />
        Soil Health & Degradation Index
      </h3>
      
      <div className="mb-4">
        <div className="flex justify-between items-end mb-1">
          <span className="text-sm font-semibold text-gray-700">Degradation Risk</span>
          <span className={`text-lg font-bold ${color}`}>{degradationPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className={`${bgColor} h-3 rounded-full transition-all duration-1000`} style={{ width: `${degradationPercent}%` }}></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Based on historical satellite telemetry</p>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700 italic">"{assessment}"</p>
      </div>
    </div>
  );
}
