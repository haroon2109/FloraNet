import React from 'react';
import { Droplets, Leaf, Sun, CloudRain } from 'lucide-react';

const weatherInsights: any = [];


const getInsightIcon = (iconName: string) => {
  switch (iconName) {
    case 'Droplets': return <Droplets size={20} className="text-[#4D9DE0]" />;
    case 'Leaf': return <Leaf size={20} className="text-[#087A45]" />;
    case 'Sun': return <Sun size={20} className="text-[#F2A900]" />;
    case 'CloudRain': return <CloudRain size={20} className="text-[#4D9DE0]" />;
    default: return <Leaf size={20} className="text-[#647474]" />;
  }
};

export default function WeatherInsights() {
  return (
    <div className="bg-[#F2F9F4] border border-[#E2E9E5] rounded-[20px] p-6 shadow-[0_4px_18px_rgba(20,60,40,0.02)] h-full">
      <h2 className="text-[15px] font-semibold text-[#102A2A] mb-5">Weather Insights for Your Farm</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {weatherInsights.map((insight: any) => (
          <div key={insight.id} className="bg-white rounded-2xl p-4 border border-[#E2E9E5] shadow-[0_2px_10px_rgba(20,60,40,0.02)] flex items-start gap-4 hover:border-[#087A45]/30 transition-colors">
            <div className="shrink-0 mt-0.5">
              {getInsightIcon(insight.icon)}
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-[#102A2A] mb-1 leading-snug">{insight.title}</span>
              <span className="text-[12px] text-[#647474] leading-relaxed">{insight.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
