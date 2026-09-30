"use client";

import React from 'react';
import Link from 'next/link';
import { MoreVertical, Sprout, Leaf, Wheat } from 'lucide-react';
import { fieldMonitorData } from '@/data/fieldMonitorData';
import { FieldMonitorItem } from '@/types/fieldMonitor';

// Custom Crop SVG Icons
const MaizeIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-[#FEF9E7] border border-[#FCE8B2] flex items-center justify-center shrink-0">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8 6 6 12 8 18C10 22 14 22 16 18C18 12 16 6 12 2Z" fill="#F5A900" />
      <path d="M12 2C14 6 15 12 13 18" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 14C4 16 3 20 6 22C9 20 8 16 6 14Z" fill="#168A45" />
      <path d="M18 14C20 16 21 20 18 22C15 20 16 16 18 14Z" fill="#168A45" />
    </svg>
  </div>
);

const WheatIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-[#FEF7E0] border border-[#FCE8B2] flex items-center justify-center shrink-0">
    <Wheat size={18} className="text-[#D97706]" strokeWidth={2} />
  </div>
);

const VegIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-[#EEF7F0] border border-[#D5E6D8] flex items-center justify-center shrink-0">
    <Leaf size={18} className="text-[#168A45]" strokeWidth={2} />
  </div>
);

const PulseIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-[#FDF2F2] border border-[#FAD2CF] flex items-center justify-center shrink-0">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="9" r="4" fill="#E84A3C" opacity="0.8" />
      <circle cx="15" cy="13" r="4" fill="#D97706" opacity="0.8" />
      <path d="M12 17C12 21 10 22 8 22" stroke="#168A45" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

const CottonIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-[#F8FAF8] border border-[#E1E8E2] flex items-center justify-center shrink-0">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="11" r="5" fill="#F0F4F1" stroke="#52645D" strokeWidth="1.5" />
      <path d="M12 16L12 21" stroke="#168A45" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

const PeanutIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-[#F5F9F6] border border-[#E1E7E3] flex items-center justify-center shrink-0">
    <Sprout size={18} className="text-[#52645D]" strokeWidth={2} />
  </div>
);

export default function FieldStatusTable() {
  const { fields } = fieldMonitorData;

  const renderCropIllustration = (type: FieldMonitorItem['cropType']) => {
    switch (type) {
      case 'maize': return <MaizeIcon />;
      case 'wheat': return <WheatIcon />;
      case 'vegetables': return <VegIcon />;
      case 'pulses': return <PulseIcon />;
      case 'cotton': return <CottonIcon />;
      case 'groundnut': return <PeanutIcon />;
    }
  };

  const getStatusBadgeStyle = (status: FieldMonitorItem['status']) => {
    switch (status) {
      case 'Healthy':
        return 'bg-[#EAF5EC] text-[#168A45] border-[#C4E7D0]';
      case 'Watch':
        return 'bg-[#FEF7E0] text-[#B45309] border-[#FCE8B2]';
      case 'Poor':
        return 'bg-[#FCE8E6] text-[#E84A3C] border-[#FAD2CF]';
      case 'No Data':
        return 'bg-[#F5F9F6] text-[#52645D] border-[#E1E7E3]';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E1E8E2] shadow-[0_2px_12px_rgba(20,60,40,0.04)] overflow-hidden">
      
      {/* Card Header */}
      <div className="p-5 border-b border-[#E1E8E2] flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-[#102A20]">Field Status</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          
          {/* Table Header */}
          <thead>
            <tr className="border-b border-[#E1E8E2] bg-[#F9FBF9] text-[12px] font-bold text-[#52645D] uppercase tracking-wider">
              <th className="py-3.5 px-5">Field</th>
              <th className="py-3.5 px-4">Crop</th>
              <th className="py-3.5 px-4">Health (NDVI)</th>
              <th className="py-3.5 px-4">Soil Moisture</th>
              <th className="py-3.5 px-4">Temperature</th>
              <th className="py-3.5 px-4">Last Updated</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#F0F4F1] text-[13px]">
            {fields.map((f) => (
              <tr 
                key={f.id}
                className="hover:bg-[#F8FAF8] transition-colors cursor-pointer group"
              >
                {/* Field Name & Dot */}
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: f.overlayColor }} />
                    <div>
                      <h4 className="text-[14px] font-bold text-[#102A20] group-hover:text-[#168A45] transition-colors leading-tight">
                        {f.name}
                      </h4>
                      <p className="text-[11px] text-[#52645D] mt-0.5">{f.area}</p>
                    </div>
                  </div>
                </td>

                {/* Crop */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2.5">
                    {renderCropIllustration(f.cropType)}
                    <span className="font-bold text-[#102A20]">{f.crop}</span>
                  </div>
                </td>

                {/* Health (NDVI) */}
                <td className="py-4 px-4">
                  {f.ndvi !== null ? (
                    <div>
                      <div className="font-bold text-[#102A20]">{f.ndvi}</div>
                      <div className={`text-[11px] font-semibold ${f.healthText === 'Good' ? 'text-[#168A45]' : f.healthText === 'Moderate' ? 'text-[#B45309]' : 'text-[#E84A3C]'}`}>
                        {f.healthText}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[#52645D] font-medium">— <span className="text-[11px] font-normal">No Data</span></span>
                  )}
                </td>

                {/* Soil Moisture */}
                <td className="py-4 px-4">
                  {f.soilMoisture !== 'No Data' ? (
                    <div>
                      <div className={`font-bold ${f.soilStatus === 'Very Low' ? 'text-[#E84A3C]' : 'text-[#102A20]'}`}>{f.soilMoisture}</div>
                      <div className={`text-[11px] font-semibold ${f.soilStatus === 'Optimal' ? 'text-[#168A45]' : f.soilStatus === 'Low' ? 'text-[#B45309]' : 'text-[#E84A3C]'}`}>
                        {f.soilStatus}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[#52645D] font-medium">No Data</span>
                  )}
                </td>

                {/* Temperature */}
                <td className="py-4 px-4">
                  <span className="font-bold text-[#102A20]">{f.temperature}</span>
                </td>

                {/* Last Updated */}
                <td className="py-4 px-4">
                  <span className="text-[12px] font-medium text-[#52645D]">{f.lastUpdated}</span>
                </td>

                {/* Status Badge */}
                <td className="py-4 px-4">
                  <span className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold border tracking-wide ${getStatusBadgeStyle(f.status)}`}>
                    {f.status}
                  </span>
                </td>

                {/* Action */}
                <td className="py-4 px-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href="/field-details"
                      className="px-3 py-1 bg-white border border-[#E1E7E3] hover:bg-[#F5F9F6] text-[12px] font-semibold text-[#102A20] rounded-lg transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      type="button"
                      aria-label="More actions"
                      className="p-1 text-[#52645D] hover:text-[#102A20] rounded-md transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Footer */}
      <div className="p-4 bg-[#F9FBF9] border-t border-[#E1E8E2] text-[12px] font-medium text-[#52645D]">
        Showing 1 to 6 of 6 fields
      </div>

    </div>
  );
}
