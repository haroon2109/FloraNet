"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Droplets, Scan } from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { useToast } from '@/context/toastContext';

// Field imagery. Field IDs come from the backend registry, so this map is
// keyed by the demo IDs only and any other ID must still resolve to a real,
// existing file — a hardcoded fallback path is how broken images reappear.
const FIELD_IMAGES = [
  '/images/home/field_1_maize.jpg',
  '/images/home/field_2_wheat.jpg',
  '/images/home/field_3_vegetables.jpg',
  '/images/home/field_4_pulses.jpg',
];

const fieldImages: Record<string, string> = {
  'field-1': FIELD_IMAGES[0],
  'field-2': FIELD_IMAGES[1],
  'field-3': FIELD_IMAGES[2],
  'field-4': FIELD_IMAGES[3],
};

/** Stable, always-valid image for a field with no explicit mapping. */
const resolveFieldImage = (fieldId: string): string => {
  if (fieldImages[fieldId]) return fieldImages[fieldId];
  let hash = 0;
  for (let i = 0; i < fieldId.length; i++) hash = (hash * 31 + fieldId.charCodeAt(i)) >>> 0;
  return FIELD_IMAGES[hash % FIELD_IMAGES.length];
};

export default function FieldOverview() {
  const { fields, toggleIrrigation } = useFarm();
  const { showToast } = useToast();
  const [pulsingFieldId, setPulsingFieldId] = useState<string | null>(null);

  const handleQuickPulse = (e: React.MouseEvent, fieldId: string, fieldName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPulsingFieldId(fieldId);
    toggleIrrigation(fieldId);
    showToast(`Valve toggle logged for ${fieldName} (backend registry).`, 'success');
    setTimeout(() => setPulsingFieldId(null), 2000);
  };

  const getBadgeStyle = (status: string) => {
    const s = status?.toLowerCase() || 'optimal';
    if (s.includes('optimal') || s.includes('active')) return 'bg-[#E6F4EA] text-[#137333] border-[#C4E7D0]';
    if (s.includes('due') || s.includes('watch')) return 'bg-[#FEF7E0] text-[#B45309] border-[#FCE8B2]';
    return 'bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF]';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#075C32]';
    if (score >= 65) return 'text-[#D97706]';
    return 'text-[#C5221F]';
  };

  return (
    <section className="mb-10">
      
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-[17px] sm:text-[18px] font-bold text-[#102A20]">Field Telemetry Overview</h2>
          <p className="text-[12.5px] text-[#607469]">Real-time Sentinel-2 canopy health and automated IoT valve states</p>
        </div>
        <Link 
          href="/field-monitor" 
          className="text-[13px] sm:text-[14px] font-bold text-[#075C32] hover:text-[#054324] transition-colors inline-flex items-center gap-1 group"
        >
          View all fields 
          <span className="text-[15px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Field Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {fields.map((field) => {
          const score = field.healthScore;
          const status = field.irrigationStatus || 'Unknown';
          const isPulsing = pulsingFieldId === field.id;
          const imgPath = resolveFieldImage(field.id);

          return (
            <div 
              key={field.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#E1E8E2] shadow-[0_4px_20px_rgba(16,42,32,0.04)] hover:shadow-[0_8px_30px_rgba(16,42,32,0.08)] transition-all duration-300 group/card flex flex-col justify-between"
            >
              {/* Field Image Header */}
              <div className="h-[135px] w-full relative overflow-hidden bg-[#F0F5F1]">
                <Image 
                  src={imgPath}
                  alt={field.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover/card:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                
                {/* Status Badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide border shadow-2xs ${getBadgeStyle(status)}`}>
                    {status}
                  </span>
                </div>

                {/* Quick Health Badge (live backend score only) */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  {score != null ? (
                    <span className="px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold bg-black/60 text-emerald-200 backdrop-blur-xs border border-white/20">
                      Score {score}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Field Info Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-[14.5px] font-bold text-[#102A20] leading-tight mb-0.5">{field.name}</h3>
                  <p className="text-[12.5px] font-medium text-[#53645D]">{field.crop || 'Unknown crop'} ({field.area || '—'})</p>
                </div>

                <div className="space-y-1.5 border-t border-[#F0F4F1] pt-2.5 text-[12.5px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#607469]">Soil Moisture</span>
                    <span className="font-bold text-[#102A20]">{field.soilMoisture != null ? `${field.soilMoisture}% VWC` : '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#607469]">Health Score</span>
                    <span className={`font-bold ${score != null ? getScoreColor(score) : 'text-[#607469]'}`}>
                      {score != null ? `${score}/100` : '—'}
                    </span>
                  </div>
                </div>

                {/* Quick Action Button */}
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleQuickPulse(e, field.id, field.name)}
                    className={`flex-1 py-1.5 rounded-lg text-[11.5px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                      isPulsing || field.irrigationStatus === 'Active'
                        ? 'bg-[#075C32] text-white'
                        : 'bg-[#F2F7F4] hover:bg-[#E2ECE5] text-[#102A20] border border-[#D5E3D8]'
                    }`}
                  >
                    <Droplets size={13} className={isPulsing ? 'animate-bounce' : ''} />
                    <span>{field.irrigationStatus === 'Active' ? 'Active' : 'Toggle Valve'}</span>
                  </button>

                  <Link
                    href={`/field-health?field=${field.id}`}
                    className="p-1.5 bg-[#F2F7F4] hover:bg-[#E2ECE5] text-[#485B51] hover:text-[#075C32] rounded-lg border border-[#D5E3D8] transition-colors"
                    aria-label="Inspect field NDVI radar"
                  >
                    <Scan size={14} />
                  </Link>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
