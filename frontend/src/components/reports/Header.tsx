"use client";

import React, { useState } from 'react';
import { ChartNoAxesColumn, Calendar, FileCheck, Award, Printer } from 'lucide-react';
import AgronomyReportModal from './AgronomyReportModal';

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-2 z-30 relative">
        <div>
          <h1 className="text-[28px] sm:text-[34px] font-bold text-[#102A20] tracking-tight flex items-center gap-2.5">
            <span>Agronomic Reports & Intelligence</span>
            <ChartNoAxesColumn className="text-[#168A45]" size={26} strokeWidth={2.2} />
          </h1>
          <p className="text-[13.5px] sm:text-[14.5px] font-medium text-[#52645D] mt-0.5">
            Live field telemetry, cross-border BRICS benchmarks, and open-data export.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Generate Farm Passport (Open Data) Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[#075C32] hover:bg-[#064E2A] text-white rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all shadow-xs hover:scale-102 cursor-pointer"
          >
            <Award size={16} className="text-emerald-300" />
            <span>Generate Farm Passport</span>
          </button>
        </div>
      </div>

      {/* Mount Agronomy Report Modal */}
      <AgronomyReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
