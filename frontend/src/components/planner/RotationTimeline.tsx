import React from "react";

export interface CropPhase {
  phase_number: number;
  season: string;
  recommended_crop: string;
  justification: string;
  estimated_duration_days: number;
}

interface RotationTimelineProps {
  phases: any[]; // Using any to be flexible with backend response
}

export default function RotationTimeline({ phases }: RotationTimelineProps) {
  if (!phases || phases.length === 0) return null;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mt-6">
      <h3 className="font-bold text-gray-800 mb-4">3-Year Regenerative Rotation</h3>
      
      <div className="relative border-l-2 border-green-200 ml-3 space-y-6">
        {phases.map((item: any, index: any) => {
          // Alternate colors based on index
          const colors = [
            "bg-green-100 border-green-300 text-green-800",
            "bg-yellow-100 border-yellow-300 text-yellow-800",
            "bg-blue-100 border-blue-300 text-blue-800",
            "bg-orange-100 border-orange-300 text-orange-800"
          ];
          const color = colors[index % colors.length];

          return (
            <div key={index} className="relative pl-6">
              {/* Timeline dot */}
              <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></span>
              
              <div className={`p-3 rounded-lg border ${color}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">Phase {item.phase_number} • {item.season}</span>
                  <span className="text-xs font-semibold opacity-70">{item.estimated_duration_days} days</span>
                </div>
                <h4 className="font-bold text-base mb-1">{item.recommended_crop}</h4>
                <p className="text-xs opacity-90">{item.justification}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
