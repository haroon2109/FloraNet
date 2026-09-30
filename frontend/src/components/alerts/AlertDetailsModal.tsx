"use client";

import React from 'react';
import { 
  X, 
  TriangleAlert, 
  Droplets, 
  Sprout, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Layers,
  Thermometer,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { AlertItem } from '@/types/alerts';
import WhatsAppPrescriptionShare from '@/components/ui/WhatsAppPrescriptionShare';

interface AlertDetailsModalProps {
  alert: AlertItem | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve?: (alertId: string) => void;
}

export default function AlertDetailsModal({
  alert,
  isOpen,
  onClose,
  onResolve
}: AlertDetailsModalProps) {
  if (!isOpen || !alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E1E8E2] p-6 z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#F0F4F1]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              alert.priority === 'critical' ? 'bg-[#FCE8E6] text-[#E84A3C] border-[#FAD2CF]' :
              alert.priority === 'warning' ? 'bg-[#FEF7E0] text-[#D97706] border-[#FCE8B2]' :
              alert.priority === 'info' ? 'bg-[#EBF3FE] text-[#1A73E8] border-[#D0E2FB]' :
              'bg-[#EAF5EC] text-[#168A45] border-[#C4E7D0]'
            }`}>
              <TriangleAlert size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  alert.priority === 'critical' ? 'bg-[#FCE8E6] text-[#E84A3C] border-[#FAD2CF]' :
                  alert.priority === 'warning' ? 'bg-[#FEF7E0] text-[#B45309] border-[#FCE8B2]' :
                  alert.priority === 'info' ? 'bg-[#EBF3FE] text-[#1A73E8] border-[#D0E2FB]' :
                  'bg-[#EAF5EC] text-[#168A45] border-[#C4E7D0]'
                }`}>
                  {alert.priority} priority
                </span>
                <span className="text-[11.5px] text-[#71847A] flex items-center gap-1 font-medium">
                  <Clock size={12} /> {alert.timeAgo} ({alert.timestamp})
                </span>
              </div>
              <h3 className="text-[17px] font-bold text-[#102A20] mt-1 leading-tight">
                {alert.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#71847A] hover:text-[#102A20] hover:bg-[#F5F9F6] rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 text-[13px]">
          
          {/* Detailed Diagnosis */}
          <div className="p-3.5 bg-[#F9FAF9] rounded-xl border border-[#E2EBE5]">
            <span className="text-[11px] font-bold text-[#55695F] uppercase tracking-wider block mb-1">
              Agronomic Assessment
            </span>
            <p className="text-[#36483E] leading-relaxed">
              {alert.description}
            </p>
          </div>

          {/* Context Badges: Field & Crop */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-[#E1E8E2] rounded-xl flex items-center gap-2.5">
              <MapPin size={16} className="text-[#075C32] shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-[#7E9086] uppercase block">Location</span>
                <span className="text-[13px] font-bold text-[#102A20]">{alert.field}</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-[#E1E8E2] rounded-xl flex items-center gap-2.5">
              <Sprout size={16} className="text-[#168A45] shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-[#7E9086] uppercase block">Assigned Crop</span>
                <span className="text-[13px] font-bold text-[#102A20]">{alert.crop}</span>
              </div>
            </div>
          </div>

          {/* Action Protocol Recommendation */}
          <div className="p-3.5 bg-[#EEF7F0] border border-[#CDE5D5] rounded-xl">
            <div className="flex items-center gap-1.5 mb-1 text-[#075C32] font-bold text-[12px]">
              <ShieldAlert size={14} /> Prescriptive Intervention Protocol:
            </div>
            <p className="text-[12px] text-[#2C4837] leading-relaxed">
              Verify the live soil &amp; weather telemetry in Field Monitor, then ask the AI agronomist
              (grounded in verified ICAR / Embrapa / ARC protocols) for a crop-specific action plan
              before applying any input.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#F0F4F1]">
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <WhatsAppPrescriptionShare 
              title={alert.title}
              field={alert.field}
              prescription={alert.description}
              variant="button"
            />

            <Link
              href="/field-monitor"
              className="px-3.5 py-2.5 bg-white border border-[#075C32] text-[#075C32] hover:bg-[#F5F9F6] text-[12.5px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Layers size={14} />
              Open Field Map
            </Link>

            <Link
              href={`/ai-assistant?query=${encodeURIComponent(`How should I resolve alert: ${alert.title}?`)}`}
              className="px-3.5 py-2.5 bg-[#075C32] text-white hover:bg-[#054324] text-[12.5px] font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} />
              Ask AI
            </Link>
          </div>

          {onResolve && (
            <button
              onClick={() => {
                onResolve(alert.id);
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#168A45] hover:bg-[#127038] text-white text-[12.5px] font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 size={15} />
              Mark Resolved
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
