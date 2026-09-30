import React from 'react';
import { CloudRain, CloudSun, Sun, CloudDrizzle, Droplets } from 'lucide-react';

const forecast: any = [];


const getWeatherIcon = (iconName: string) => {
  switch (iconName) {
    case 'sunny': return <Sun size={32} className="text-[#F5D547]" fill="currentColor" strokeWidth={1} />;
    case 'partlyCloudy': return <CloudSun size={32} className="text-[#F5D547]" strokeWidth={1.5} />;
    case 'cloudRain': return <CloudDrizzle size={32} className="text-[#647474]" strokeWidth={1.5} />;
    case 'rain': return <CloudRain size={32} className="text-[#4D9DE0]" strokeWidth={1.5} />;
    default: return <Sun size={32} className="text-[#F5D547]" fill="currentColor" />;
  }
};

export default function ForecastCard() {
  return (
    <div className="bg-white border border-[#E2E9E5] rounded-[20px] p-6 shadow-[0_4px_18px_rgba(20,60,40,0.04)] h-full flex flex-col xl:col-span-2">
      <h2 className="text-[15px] font-semibold text-[#102A2A] mb-5">7-Day Forecast</h2>
      
      <div className="flex-1 flex w-full">
        <div className="grid grid-cols-7 gap-2 w-full h-full">
          {forecast.map((day: any) => (
            <div 
              key={day.day} 
              className={`flex flex-col items-center justify-between py-4 rounded-xl transition-colors ${day.isToday ? 'bg-[#F2F9F4] border border-[#087A45]/10 shadow-sm' : 'hover:bg-[#F7FAF8]'}`}
            >
              <span className={`text-[14px] font-semibold ${day.isToday ? 'text-[#087A45]' : 'text-[#102A2A]'}`}>
                {day.day}
              </span>
              
              <div className="my-3 drop-shadow-sm">
                {getWeatherIcon(day.icon)}
              </div>
              
              <div className="flex items-center gap-1.5 font-bold mb-3">
                <span className="text-[16px] text-[#102A2A]">{day.maxTemp}°</span>
                <span className="text-[14px] text-[#647474]">{day.minTemp}°</span>
              </div>
              
              <div className="flex items-center gap-1 text-[11px] font-medium text-[#4D9DE0]">
                <Droplets size={12} />
                {day.rainChance}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
