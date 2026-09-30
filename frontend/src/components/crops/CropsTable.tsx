"use client";

import React from 'react';
import { TriangleAlert, Sprout, Leaf, Wheat } from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { Field3DData } from '@/types/farm3d';

// Custom Crop SVG Illustrations (kept identical — visual assets unchanged)
const MaizeIcon = () => (
  <div className="w-10 h-10 rounded-xl bg-[#FEF9E7] border border-[#FCE8B2] flex items-center justify-center shrink-0">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8 6 6 12 8 18C10 22 14 22 16 18C18 12 16 6 12 2Z" fill="#F5A900" />
      <path d="M12 2C14 6 15 12 13 18" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 14C4 16 3 20 6 22C9 20 8 16 6 14Z" fill="#168A45" />
      <path d="M18 14C20 16 21 20 18 22C15 20 16 16 18 14Z" fill="#168A45" />
    </svg>
  </div>
);

const WheatIcon = () => (
  <div className="w-10 h-10 rounded-xl bg-[#FEF7E0] border border-[#FCE8B2] flex items-center justify-center shrink-0">
    <Wheat size={22} className="text-[#D97706]" strokeWidth={2} />
  </div>
);

const VegIcon = () => (
  <div className="w-10 h-10 rounded-xl bg-[#EEF7F0] border border-[#D5E6D8] flex items-center justify-center shrink-0">
    <Leaf size={22} className="text-[#168A45]" strokeWidth={2} />
  </div>
);

const GenericCropIcon = () => (
  <div className="w-10 h-10 rounded-xl bg-[#EEF7F0] border border-[#D5E6D8] flex items-center justify-center shrink-0">
    <Sprout size={22} className="text-[#168A45]" strokeWidth={2} />
  </div>
);

// Growth Stage SVG Icons
const StageIcon = ({ stage }: { stage: string }) => {
  return (
    <div className="w-7 h-7 rounded-full bg-[#F4F9F5] border border-[#E1E7E3] flex items-center justify-center text-[#168A45] shrink-0">
      <Sprout size={14} strokeWidth={2} />
    </div>
  );
};

// Health Score Circular Progress Component
const HealthScoreRing = ({ score, status }: { score: number; status: string }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#168A45'; // Good / Healthy
  let statusText = 'Good';
  let statusTextColor = 'text-[#168A45]';

  if (status === 'Watch') {
    strokeColor = '#F5A900';
    statusText = 'Watch';
    statusTextColor = 'text-[#B45309]';
  } else if (status === 'Needs Attention') {
    strokeColor = '#E84A3C';
    statusText = 'Needs Attention';
    statusTextColor = 'text-[#E84A3C]';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={radius}
            stroke="#F0F5F1"
            strokeWidth="3.5"
            fill="transparent"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className="absolute text-[13px] font-bold text-[#102A20]">{score}</span>
      </div>
      <span className={`text-[11px] font-bold mt-0.5 ${statusTextColor}`}>{statusText}</span>
    </div>
  );
};

/**
 * Deterministic display thresholds applied to the REAL backend health score —
 * a presentation rule, not fabricated data.
 */
export function healthStatusFor(score: number): 'Good' | 'Watch' | 'Needs Attention' {
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Watch';
  return 'Needs Attention';
}

export default function CropsTable() {
  const { fields } = useFarm();

  const renderCropIllustration = (field: Field3DData) => {
    const c = (field.crop || '').toLowerCase();
    if (c.includes('maize') || c.includes('corn')) return <MaizeIcon />;
    if (c.includes('wheat')) return <WheatIcon />;
    if (c.includes('veget') || c.includes('tomato') || c.includes('onion')) return <VegIcon />;
    return <GenericCropIcon />;
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'bg-[#EAF5EC] text-[#168A45] border-[#C4E7D0]';
      case 'Watch':
        return 'bg-[#FEF7E0] text-[#B45309] border-[#FCE8B2]';
      case 'Needs Attention':
        return 'bg-[#FCE8E6] text-[#E84A3C] border-[#FAD2CF]';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E1E8E2] shadow-[0_2px_12px_rgba(20,60,40,0.04)] overflow-hidden mb-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          
          {/* Table Header */}
          <thead>
            <tr className="border-b border-[#E1E8E2] bg-[#F9FBF9] text-[12px] font-bold text-[#52645D] uppercase tracking-wider">
              <th className="py-3.5 px-5">Crop &amp; Field</th>
              <th className="py-3.5 px-4">Growth Stage</th>
              <th className="py-3.5 px-4 text-center">Health Score</th>
              <th className="py-3.5 px-4">Irrigation</th>
              <th className="py-3.5 px-4">Next Action</th>
              <th className="py-3.5 px-5 text-right">Status</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#F0F4F1] text-[13px]">
            {fields.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  <p className="text-[13px] font-bold text-[#102A20]">No crops registered yet</p>
                  <p className="text-[12px] text-[#607469] mt-1">
                    Rows appear when a farm plot is registered on the backend — no demo crops are shown.
                  </p>
                </td>
              </tr>
            )}
            {fields.map((field) => {
              const status = healthStatusFor(field.healthScore);
              const overdue = (field.irrigationStatus || '').toLowerCase().includes('overdue');
              return (
                <tr 
                  key={field.id}
                  className="hover:bg-[#F8FAF8] transition-colors cursor-pointer group"
                >
                  {/* Column 1: Crop & Field */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      {renderCropIllustration(field)}
                      <div>
                        <h4 className="text-[14px] font-bold text-[#102A20] group-hover:text-[#168A45] transition-colors leading-tight">
                          {field.crop || 'Unknown Crop'}
                        </h4>
                        <p className="text-[12px] text-[#52645D] mt-0.5">
                          {field.name} • <span className="font-medium text-[#102A20]">{field.area}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Growth Stage */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                      <StageIcon stage={field.growthStage} />
                      <div>
                        <div className="font-semibold text-[#102A20]">{field.growthStage || 'Unknown'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Column 3: Health Score */}
                  <td className="py-4 px-4 text-center">
                    <HealthScoreRing score={field.healthScore} status={status} />
                  </td>

                  {/* Column 4: Irrigation */}
                  <td className="py-4 px-4">
                    <div className="flex items-start gap-2">
                      {overdue ? (
                        <TriangleAlert size={16} className="text-[#E84A3C] shrink-0 mt-0.5" strokeWidth={2} />
                      ) : (
                        <Sprout size={16} className="text-[#1A73E8] shrink-0 mt-0.5" strokeWidth={2} />
                      )}
                      <div>
                        <div className={`font-semibold ${overdue ? 'text-[#E84A3C]' : 'text-[#102A20]'}`}>
                          {field.irrigationStatus || 'Unknown'}
                        </div>
                        <div className="text-[11px] text-[#52645D]">
                          Soil moisture: {field.soilMoisture != null ? `${field.soilMoisture}%` : '—'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 5: Next Action */}
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-semibold text-[#102A20]">—</div>
                      <div className="text-[11px] text-[#52645D]">
                        Pending IoT gateway registration
                      </div>
                    </div>
                  </td>

                  {/* Column 6: Status Badge */}
                  <td className="py-4 px-5 text-right">
                    <span className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold border tracking-wide ${getStatusBadgeStyle(status)}`}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
}
