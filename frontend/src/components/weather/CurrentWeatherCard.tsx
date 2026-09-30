import React from 'react';
import { MapPin, Droplets, Wind, Gauge, Eye } from 'lucide-react';

const currentWeather: any = { pressure: '', visibility: '', wind: '', humidity: '', feelsLike: '', temperature: '', location: '', condition: '' };


export default function CurrentWeatherCard() {
  return (
    <div className="bg-white border border-[#E2E9E5] rounded-[20px] p-6 shadow-[0_4px_18px_rgba(20,60,40,0.04)] col-span-1 xl:col-span-2 flex flex-col h-full">
      <h2 className="text-[15px] font-semibold text-[#102A2A] mb-1">Current Weather</h2>
      <div className="flex items-center gap-1.5 text-[12px] text-[#647474] mb-4">
        <MapPin size={14} />
        {currentWeather.location}
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start flex-1 w-full justify-between mt-2">
        
        {/* Left: Temp and Icon */}
        <div className="flex items-center gap-4">
          <div className="w-[80px] h-[80px] relative shrink-0">
             {/* Custom Partly Cloudy SVG Icon */}
             <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                <circle cx="45" cy="45" r="20" fill="#F5D547" />
                <path d="M 45 15 L 45 5 M 45 75 L 45 85 M 15 45 L 5 45 M 75 45 L 85 45 M 24 24 L 17 17 M 66 66 L 73 73 M 24 66 L 17 73 M 66 24 L 73 17" stroke="#F5D547" strokeWidth="4" strokeLinecap="round" />
                <path d="M 35 65 A 15 15 0 0 1 35 35 A 20 20 0 0 1 70 45 A 15 15 0 0 1 70 75 Z" fill="#DCEFF5" opacity="0.95" />
             </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-start">
              <span className="text-[48px] font-bold text-[#102A2A] leading-none tracking-tight">{currentWeather.temperature}</span>
              <span className="text-[20px] font-bold text-[#102A2A] mt-1">°C</span>
            </div>
            <span className="text-[16px] font-semibold text-[#102A2A] mt-1">{currentWeather.condition}</span>
            <span className="text-[13px] text-[#647474] mt-1">Feels like {currentWeather.feelsLike}°C</span>
          </div>
        </div>

        <div className="hidden sm:block w-[1px] h-[80px] bg-[#E2E9E5] self-center"></div>

        {/* Right: Metrics Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
           
           <div className="flex gap-3 items-center">
             <Droplets size={20} className="text-[#4D9DE0]" />
             <div className="flex flex-col">
               <span className="text-[11px] text-[#647474]">Humidity</span>
               <span className="text-[14px] font-semibold text-[#102A2A]">{currentWeather.humidity}%</span>
             </div>
           </div>

           <div className="flex gap-3 items-center">
             <Wind size={20} className="text-[#647474]" />
             <div className="flex flex-col">
               <span className="text-[11px] text-[#647474]">Wind</span>
               <span className="text-[14px] font-semibold text-[#102A2A]">{currentWeather.wind}</span>
             </div>
           </div>

           <div className="flex gap-3 items-center">
             <Gauge size={20} className="text-[#647474]" />
             <div className="flex flex-col">
               <span className="text-[11px] text-[#647474]">Pressure</span>
               <span className="text-[14px] font-semibold text-[#102A2A]">{currentWeather.pressure}</span>
             </div>
           </div>

           <div className="flex gap-3 items-center">
             <Eye size={20} className="text-[#647474]" />
             <div className="flex flex-col">
               <span className="text-[11px] text-[#647474]">Visibility</span>
               <span className="text-[14px] font-semibold text-[#102A2A]">{currentWeather.visibility}</span>
             </div>
           </div>

        </div>

      </div>
    </div>
  );
}
