"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { useToast } from '@/context/toastContext';

interface WhatsAppPrescriptionShareProps {
  title: string;
  field?: string;
  prescription: string;
  actionItems?: string[];
  variant?: 'button' | 'pill' | 'icon';
}

export default function WhatsAppPrescriptionShare({
  title,
  field = 'Registered field',
  prescription,
  actionItems = [],
  variant = 'pill',
}: WhatsAppPrescriptionShareProps) {
  const { userProfile } = useFarm();
  const { showToast } = useToast();

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();

    const formattedActions = actionItems.length > 0 
      ? actionItems.map(item => `  • ${item}`).join('\n') 
      : '';

    const text = `🌱 *FloraNet Agronomy Prescription*
📍 *Region:* ${userProfile.countryFlag} ${userProfile.country} (${field})
⚠️ *Topic / Diagnosis:* ${title}

📋 *Prescription:*
${prescription}
${formattedActions ? `\n✅ *Action Items:*\n${formattedActions}` : ''}

_Sent via FloraNet Autonomous Farm System_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Opening WhatsApp with pre-filled prescription...', 'success');
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleShare}
        className="p-1.5 text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-colors cursor-pointer"
        title="Share prescription to WhatsApp"
        aria-label="Share prescription to WhatsApp"
      >
        <MessageCircle size={17} className="fill-current" />
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-[13px] font-bold rounded-xl shadow-xs transition-all hover:scale-105 cursor-pointer"
      >
        <MessageCircle size={16} className="fill-current" />
        <span>Share to WhatsApp</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1DA851] hover:text-[#128C41] border border-[#25D366]/30 rounded-xl text-[11.5px] font-bold transition-all hover:scale-105 cursor-pointer"
      title="Share advice with field laborers on WhatsApp"
    >
      <MessageCircle size={13} className="fill-current" />
      <span>WhatsApp Advice</span>
    </button>
  );
}
