"use client";

import React, { useState } from 'react';
import { Sliders, CalendarDays, Repeat, Check } from 'lucide-react';
import SustainabilitySimulator from '@/components/planner/SustainabilitySimulator';

interface RotationPhase {
  phaseNumber: number;
  season: string;
  cropName: string;
  category: 'Cereal' | 'Legume / Pulse' | 'Oilseed' | 'Cover Crop';
  durationDays: number;
  role: string;
  status: 'active' | 'upcoming';
  socImpact: string;
}

const ROTATION_PHASES: RotationPhase[] = [
  {
    phaseNumber: 1,
    season: 'Current Kharif (Summer)',
    cropName: 'Hybrid Maize',
    category: 'Cereal',
    durationDays: 120,
    role: 'Primary cash crop harvest; heavy nutrient feeder balanced with precision top-dressing.',
    status: 'active',
    socImpact: '+0.3% Organic Carbon',
  },
  {
    phaseNumber: 2,
    season: 'Upcoming Rabi (Winter)',
    cropName: 'Cowpea / Green Gram',
    category: 'Legume / Pulse',
    durationDays: 85,
    role: 'Biological atmospheric Nitrogen fixation (~45 kg N/ha) & breaking monoculture pest cycles.',
    status: 'upcoming',
    socImpact: '+0.85 t/ha Bio-Nitrogen',
  },
  {
    phaseNumber: 3,
    season: 'Zaid (Spring Inter-Season)',
    cropName: 'Mustard & Sunn-Hemp Cover',
    category: 'Cover Crop',
    durationDays: 60,
    role: 'Bio-fumigation against nematodes; high-biomass green manure plowed before next sowing.',
    status: 'upcoming',
    socImpact: '+1.2% Soil Moisture Hold',
  },
];

interface BioScheduleItem {
  id: string;
  period: string;
  inputName: string;
  target: string;
  dosage: string;
  status: 'completed' | 'due-soon' | 'upcoming';
}

const BIO_SCHEDULE: BioScheduleItem[] = [
  {
    id: 'b1',
    period: 'V2 Early Vegetative',
    inputName: 'Fermented Jeevamrutha Drench',
    target: 'Indigenous soil microbe activation (200 L/acre via irrigation)',
    dosage: '200 L / acre',
    status: 'completed',
  },
  {
    id: 'b2',
    period: 'V6 Rapid Vegetative (Current)',
    inputName: 'Liquid Ghanajeevamrutha Top-Dressing',
    target: 'Bio-available Nitrogen & microbial root colonization',
    dosage: '100 kg / acre',
    status: 'due-soon',
  },
  {
    id: 'b3',
    period: 'Tasseling & Flowering',
    inputName: 'Neem Oil (10,000 ppm) + Dashaparni Extract',
    target: 'Preventive botanical repellent for Fall Armyworm & Borers',
    dosage: '5 ml / L spray',
    status: 'upcoming',
  },
  {
    id: 'b4',
    period: 'Post-Harvest Rest',
    inputName: 'Trichoderma Viride + Vermicompost Mulch Layer',
    target: 'Decomposition of stubble & fungal root rot protection',
    dosage: '2.5 kg / acre',
    status: 'upcoming',
  },
];

export default function CropPlannerModule() {
  const [activeTab, setActiveTab] = useState<'simulation' | 'rotation' | 'bio-schedule'>('simulation');

  return (
    <div className="bg-white border border-[#E1E8E4] rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">
      
      {/* Module Title & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-[#F0F4F1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#075C32]" />
            <h3 className="text-[17px] font-bold text-[#102A20]">
              Crop Planning & Regenerative Sandbox
            </h3>
          </div>
          <p className="text-[12.5px] text-[#55695F] mt-0.5">
            Model sustainable agronomic interventions, seasonal rotations, and bio-input application timing
          </p>
        </div>

        {/* Sub-Tabs Nav */}
        <div className="flex items-center gap-1 bg-[#F5F8F6] p-1 rounded-xl border border-[#E2EBE5]">
          <button
            type="button"
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'simulation'
                ? 'bg-[#075C32] text-white shadow-xs'
                : 'text-[#50645B] hover:text-[#102A20] hover:bg-white/60'
            }`}
          >
            <Sliders size={13} />
            <span>What-If Sandbox</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rotation')}
            className={`px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'rotation'
                ? 'bg-[#075C32] text-white shadow-xs'
                : 'text-[#50645B] hover:text-[#102A20] hover:bg-white/60'
            }`}
          >
            <Repeat size={13} />
            <span>Rotation Phases</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bio-schedule')}
            className={`px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'bio-schedule'
                ? 'bg-[#075C32] text-white shadow-xs'
                : 'text-[#50645B] hover:text-[#102A20] hover:bg-white/60'
            }`}
          >
            <CalendarDays size={13} />
            <span>Bio-Input Schedule</span>
          </button>
        </div>
      </div>

      {/* TAB 1: What-If Scenario Sandbox */}
      {activeTab === 'simulation' && (
        <div>
          <SustainabilitySimulator />
        </div>
      )}

      {/* TAB 2: Multi-Season Crop Rotation Plan */}
      {activeTab === 'rotation' && (
        <div className="space-y-4">
          <div className="bg-[#F8FAF8] border border-[#E2ECE5] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#075C32]">
                <Repeat size={18} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#102A20]">
                  3-Season Regenerative Crop Rotation Blueprint
                </h4>
                <p className="text-[12px] text-[#55695F]">
                  Reference model: alternates heavy nitrogen consumers (Maize) with leguminous bio-fixers (Cowpea) to naturally replenish soil organic carbon. Not tied to a registered field.
                </p>
              </div>
            </div>
            <span className="text-[12px] font-bold text-[#075C32] bg-white px-3 py-1 rounded-lg border border-[#D5E5DA]">
              Reference Rotation Model
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROTATION_PHASES.map((phase) => (
              <div
                key={phase.phaseNumber}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  phase.status === 'active'
                    ? 'bg-[#FAFCFA] border-[#075C32] shadow-xs ring-1 ring-[#075C32]/20'
                    : 'bg-white border-[#E5EDE7] hover:border-[#CFDDD3]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6A7E74]">
                      Phase {phase.phaseNumber} • {phase.durationDays} Days
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        phase.status === 'active'
                          ? 'bg-[#075C32] text-white'
                          : 'bg-[#EEF2EF] text-[#6A7E74]'
                      }`}
                    >
                      {phase.status === 'active' ? 'Active In Ground' : 'Next Season'}
                    </span>
                  </div>

                  <h5 className="text-[15px] font-bold text-[#102A20] mb-0.5">
                    {phase.cropName}
                  </h5>
                  <span className="text-[11.5px] font-semibold text-[#168A45] block mb-2">
                    {phase.category}
                  </span>

                  <p className="text-[12px] text-[#506359] leading-relaxed mb-3">
                    {phase.role}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[#EEF3F0] flex items-center justify-between text-[11px]">
                  <span className="font-medium text-[#6A7E74]">Soil Benefit:</span>
                  <span className="font-bold text-[#075C32]">{phase.socImpact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Bio-Input & Organic Application Timing */}
      {activeTab === 'bio-schedule' && (
        <div className="space-y-4">
          <div className="bg-[#F8FAF8] border border-[#E2ECE5] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#075C32]">
                <CalendarDays size={18} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#102A20]">
                  Natural Farming & Jeevamrutha Application Schedule
                </h4>
                <p className="text-[12px] text-[#55695F]">
                  Synchronized with crop growth milestones to maximize microbial colonization and eliminate synthetic dependency.
                </p>
              </div>
            </div>
            <span className="text-[12px] font-bold text-[#075C32] bg-white px-3 py-1 rounded-lg border border-[#D5E5DA]">
              ZBNF Protocol
            </span>
          </div>

          <div className="space-y-2.5">
            {BIO_SCHEDULE.map((item) => {
              const isDone = item.status === 'completed';
              const isDue = item.status === 'due-soon';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isDue
                      ? 'bg-[#F4FAF6] border-[#075C32] shadow-xs'
                      : isDone
                      ? 'bg-[#FAFCFA] border-[#E5EDE7] opacity-80'
                      : 'bg-white border-[#E5EDE7]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                        isDone
                          ? 'bg-[#EAF5EC] text-[#075C32]'
                          : isDue
                          ? 'bg-[#075C32] text-white animate-pulse'
                          : 'bg-[#EEF2EF] text-[#6A7E74]'
                      }`}
                    >
                      {isDone ? <Check size={14} strokeWidth={3} /> : item.id.replace('b', '')}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#102A20]">
                          {item.inputName}
                        </span>
                        <span className="text-[10.5px] font-semibold text-[#607469] bg-white px-2 py-0.5 rounded border border-[#E0E9E3]">
                          {item.period}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#55695F] mt-0.5">
                        {item.target}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-[12px] font-bold text-[#102A20] bg-white px-2.5 py-1 rounded-lg border border-[#DCE7DF]">
                      {item.dosage}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                        isDone
                          ? 'bg-[#EAF5EC] text-[#075C32]'
                          : isDue
                          ? 'bg-[#D97706] text-white shadow-xs'
                          : 'bg-[#EEF2EF] text-[#6A7E74]'
                      }`}
                    >
                      {isDone ? 'Completed' : isDue ? 'Action Due' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
