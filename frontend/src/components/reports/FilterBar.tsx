"use client";

import React, { useEffect, useState } from 'react';
import { ChevronDown, Download, Calendar, Info, Loader2 } from 'lucide-react';
import { fetchFieldsTelemetry, fetchCropStats } from '@/services/farmApi';
import { useToast } from '@/context/toastContext';
import { useUILocale } from '@/lib/useUILocale';

interface FilterBarProps {
  selectedReportType?: string;
  onReportTypeChange?: (val: string) => void;
  selectedField?: string;
  onFieldChange?: (val: string) => void;
  selectedCrop?: string;
  onCropChange?: (val: string) => void;
  selectedDateRange?: string;
  onDateRangeChange?: (val: string) => void;
}

interface FieldOption {
  id: string;
  name: string;
  crop?: string;
}

interface FieldTelemetry {
  id?: string;
  field_id?: string;
  name?: string;
  field_name?: string;
  crop?: string;
}

export default function FilterBar({
  selectedReportType = 'All Reports',
  onReportTypeChange,
  selectedField = 'All Fields',
  onFieldChange,
  selectedCrop = 'All Crops',
  onCropChange,
  selectedDateRange,
  onDateRangeChange,
}: FilterBarProps) {
  const locale = useUILocale();
  // Default range is derived after the hook (a hook can't run in a parameter
  // default) so the label is localized to the profile language too.
  const dateRangeLabel = selectedDateRange ??
    new Date().toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  const [exportOpen, setExportOpen] = useState(false);
  const [fields, setFields] = useState<FieldOption[] | null>(null); // null = still loading
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Real registered fields come from the backend registry. An empty registry
    // is shown as-is — we never fabricate "Field 1..6" placeholders.
    let mounted = true;
    fetchFieldsTelemetry().then((data) => {
      if (!mounted) return;
      const options = (Array.isArray(data) ? (data as FieldTelemetry[]) : []).map(
        (f) => ({
          id: String(f.id ?? f.field_id ?? f.name ?? ''),
          name: String(f.name ?? f.field_name ?? f.id ?? f.field_id ?? 'Field'),
          crop: f.crop,
        })
      );
      setFields(options.filter((o) => o.id));
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleExport = async (format: 'csv' | 'json') => {
    setExportOpen(false);
    setExporting(true);

    // Real export: downloads the live World Bank WDI crop statistics for the
    // five BRICS nations. (PDF/XLSX rendering is not implemented in this
    // deployment, so those options are not offered rather than faked.)
    try {
      const data = await fetchCropStats();
      if (!data || !data.stats || data.stats.length === 0) {
        showToast(
          'Export unavailable: World Bank data could not be reached. Nothing was downloaded.',
          'error',
          undefined,
          6000
        );
        return;
      }

      let content: string;
      let mime: string;
      let filename: string;

      if (format === 'csv') {
        const rows = [['country', 'iso3', 'cereal_yield_kg_ha', 'yield_year', 'fertilizer_intensity', 'fertilizer_year']];
        for (const s of data.stats) {
          rows.push([
            s.country,
            s.iso3,
            s.cereal_yield_kg_ha ? String(s.cereal_yield_kg_ha.value) : '',
            s.cereal_yield_kg_ha?.year ?? '',
            s.fertilizer_intensity ? String(s.fertilizer_intensity.value) : '',
            s.fertilizer_intensity?.year ?? '',
          ]);
        }
        content = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
        mime = 'text/csv';
        filename = `floranet_brics_crop_stats_${new Date().getTime()}.csv`;
      } else {
        content = JSON.stringify(data, null, 2);
        mime = 'application/json';
        filename = `floranet_brics_crop_stats_${new Date().getTime()}.json`;
      }

      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Exported live World Bank BRICS crop statistics', 'success');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-3 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6 flex flex-wrap items-center justify-between gap-3">
      
      {/* Left Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* Dropdown 1: All Reports */}
        <div className="relative">
          <select 
            value={selectedReportType}
            onChange={(e) => onReportTypeChange?.(e.target.value)}
            className="appearance-none bg-white border border-[#E1E7E3] rounded-xl px-3.5 py-2 pr-9 text-[13px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors cursor-pointer focus:outline-none"
          >
            <option>All Reports</option>
            <option>Crop Reports</option>
            <option>Financial Reports</option>
            <option>Weather Reports</option>
            <option>Field Reports</option>
            <option>Custom Reports</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52645D] pointer-events-none" />
        </div>

        {/* Dropdown 2: All Fields (real registered fields from the backend) */}
        <div className="relative">
          <select 
            value={selectedField}
            onChange={(e) => onFieldChange?.(e.target.value)}
            className="appearance-none bg-white border border-[#E1E7E3] rounded-xl px-3.5 py-2 pr-9 text-[13px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors cursor-pointer focus:outline-none"
          >
            <option>All Fields</option>
            {fields === null && (
              <option disabled>Loading fields…</option>
            )}
            {fields !== null && fields.length === 0 && (
              <option disabled>No fields registered yet — register a farm to see your fields here</option>
            )}
            {fields !== null &&
              fields.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52645D] pointer-events-none" />
        </div>

        {/* Dropdown 3: All Crops */}
        <div className="relative">
          <select 
            value={selectedCrop}
            onChange={(e) => onCropChange?.(e.target.value)}
            className="appearance-none bg-white border border-[#E1E7E3] rounded-xl px-3.5 py-2 pr-9 text-[13px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors cursor-pointer focus:outline-none"
          >
            <option>All Crops</option>
            <option>Wheat</option>
            <option>Maize</option>
            <option>Pulses</option>
            <option>Cotton</option>
            <option>Vegetables</option>
            <option>Soybean</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52645D] pointer-events-none" />
        </div>

        {/* Dropdown 4: Date Range */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-white border border-[#E1E7E3] rounded-xl px-3.5 py-2 pr-8 text-[13px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors cursor-pointer">
            <Calendar size={15} className="text-[#52645D]" />
            <span>{dateRangeLabel}</span>
          </div>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52645D] pointer-events-none" />
        </div>

      </div>

      {/* Right Action: Export Report Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setExportOpen(!exportOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E1E7E3] rounded-xl text-[13px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors"
        >
          {exporting ? (
            <Loader2 size={15} className="text-[#168A45] animate-spin" strokeWidth={2.2} />
          ) : (
            <Download size={15} className="text-[#168A45]" strokeWidth={2.2} />
          )}
          <span>Export Report</span>
          <ChevronDown size={14} className="text-[#52645D]" />
        </button>

        {/* Export Dropdown Menu */}
        {exportOpen && (
          <div className="absolute right-0 mt-2 w-60 bg-white border border-[#E1E7E3] rounded-xl shadow-lg z-50 py-1.5 text-[13px] font-semibold text-[#102A20]">
            <button 
              onClick={() => handleExport('csv')}
              className="w-full text-left px-4 py-2 hover:bg-[#F5F9F6] transition-colors flex items-center justify-between"
            >
              <span>Crop Statistics (CSV)</span>
              <span className="text-[10px] text-[#52645D] bg-[#F0F4F1] px-1.5 py-0.5 rounded">.csv</span>
            </button>
            <button 
              onClick={() => handleExport('json')}
              className="w-full text-left px-4 hover:bg-[#F5F9F6] transition-colors flex items-center justify-between py-2"
            >
              <span>Crop Statistics (JSON)</span>
              <span className="text-[10px] text-[#52645D] bg-[#F0F4F1] px-1.5 py-0.5 rounded">.json</span>
            </button>
            <div className="px-4 pt-2 pb-1.5 border-t border-[#F0F4F1] mt-1 flex items-start gap-1.5">
              <Info size={12} className="text-[#6A7E74] mt-0.5 shrink-0" />
              <span className="text-[10.5px] text-[#6A7E74] leading-snug">
                Exports live World Bank WDI statistics for all 5 BRICS nations
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
