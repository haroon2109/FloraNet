"use client";

import React from "react";
import { Leaf, Satellite, Sprout } from "lucide-react";

const features = [
  {
    Icon: Leaf,
    title: "AI-Powered Insights",
    description: "Get intelligent recommendations\ntailored to your farm.",
  },
  {
    Icon: Satellite,
    title: "Satellite Intelligence",
    description: "Monitor your fields with real-time\nsatellite and weather data.",
  },
  {
    Icon: Sprout,
    title: "Regenerative Future",
    description: "Build healthier soil, increase yields,\nand protect our planet.",
  },
];

export default function FeatureHighlights() {
  return (
    <div
      className="w-full max-w-[440px] bg-white/96 backdrop-blur-md rounded-[20px] px-7 py-6 shadow-[0_10px_30px_rgba(20,50,35,0.10)] border border-white/80"
    >
      {features.map((feature: any, idx: any) => (
        <React.Fragment key={idx}>
          <div className="flex items-start gap-4">
            <div className="min-w-[44px] h-[44px] bg-[#EFF7F1] rounded-full flex items-center justify-center flex-shrink-0">
              <feature.Icon className="w-5 h-5 text-[#2F8F4E]" strokeWidth={1.7} />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-[#12251D] leading-snug">{feature.title}</h4>
              <p className="text-[13px] text-[#5A6961] leading-snug mt-0.5 whitespace-pre-line">
                {feature.description}
              </p>
            </div>
          </div>
          {idx < features.length - 1 && (
            <div className="w-full h-px bg-[#EEF3EF] my-4" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
