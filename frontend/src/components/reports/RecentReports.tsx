"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, FileText, Info } from 'lucide-react';
import { fetchCropStats } from '@/services/farmApi';
import { useToast } from '@/context/toastContext';

interface GeneratedReport {
  id: string;
  title: string;
  date: string;
  generate: () => Promise<string | null>;
}

export default function RecentReports() {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    // The only reports this deployment can genuinely produce are exports of
    // live data. We list those — not fabricated past reports.
    setReports([
      {
        id: 'brics-crop-stats',
        title: 'BRICS Crop Statistics (World Bank WDI)',
        date: 'Generated on demand from live data',
        generate: async () => {
          const data = await fetchCropStats();
          if (!data || !data.stats || data.stats.length === 0) return null;
          const rows = [
            ['country', 'iso3', 'cereal_yield_kg_ha', 'yield_year', 'fertilizer_intensity', 'fertilizer_year'],
            ...data.stats.map((s) => [
              s.country,
              s.iso3,
              s.cereal_yield_kg_ha ? String(s.cereal_yield_kg_ha.value) : '',
              s.cereal_yield_kg_ha?.year ?? '',
              s.fertilizer_intensity ? String(s.fertilizer_intensity.value) : '',
              s.fertilizer_intensity?.year ?? '',
            ]),
          ];
          return rows
            .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
            .join('\n');
        },
      },
    ]);
  }, []);

  const handleDownload = async (report: GeneratedReport) => {
    setDownloadingId(report.id);
    try {
      const content = await report.generate();
      if (content === null) {
        showToast(
          'Report unavailable: the live data source could not be reached. Nothing was downloaded.',
          'error',
          undefined,
          6000
        );
        return;
      }
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.id}_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Report downloaded from live data', 'success');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A20]">Reports You Can Generate Now</h3>
        <Link 
          href="/reports" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View all 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {reports.map((report) => (
          <div 
            key={report.id}
            className="flex items-center justify-between p-2.5 rounded-xl border border-[#F0F4F1] bg-[#FAFCFA] hover:bg-[#F5F9F6] transition-colors"
          >
            <div className="min-w-0 pr-2 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
                <FileText size={15} />
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] font-bold text-[#102A20] leading-tight truncate">
                  {report.title}
                </h4>
                <span className="text-[11px] font-medium text-[#889B91] mt-0.5 block">
                  {report.date}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDownload(report)}
              disabled={downloadingId === report.id}
              aria-label={`Download ${report.title}`}
              className="w-8 h-8 rounded-lg bg-white border border-[#E1E7E3] flex items-center justify-center text-[#52645D] hover:text-[#168A45] hover:border-[#C4E7D0] transition-colors shrink-0 disabled:opacity-50"
            >
              <Download size={15} strokeWidth={2} className={downloadingId === report.id ? 'animate-pulse' : ''} />
            </button>
          </div>
        ))}

        {reports.length === 0 && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#F5F8FC] border border-[#D9E4F0]">
            <Info size={14} className="text-[#2C5282] mt-0.5 shrink-0" />
            <span className="text-[12px] text-[#2C5282] leading-snug">
              No reports have been generated yet. Reports appear here once created from live data.
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
