"use client";

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles, WifiOff, ShieldCheck, MessageCircle, FileJson } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tag: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'offline',
    question: 'Does FloraNet work in zero-connectivity rural field dead zones?',
    answer: 'Yes. FloraNet is engineered with an offline-first PWA architecture and Service Worker cache. Telemetry, downloaded agronomy manuals, and pest diagnostics remain 100% accessible in remote fields without active cellular reception, syncing automatically when connectivity resumes.',
    icon: WifiOff,
    tag: 'Offline Resilience',
  },
  {
    id: 'rag-accuracy',
    question: 'How does the Tri-Persona AI ensure agricultural recommendations are accurate?',
    answer: 'FloraNet AI connects via a Retrieval-Augmented Generation (RAG) pipeline directly to verified research databases from ICAR (India), Embrapa (Brazil), CAAS (China), and ARC (South Africa). Every dosage and treatment is strictly grounded in peer-reviewed agro-ecological corpora.',
    icon: Sparkles,
    tag: 'RAG Agronomy Engine',
  },
  {
    id: 'whatsapp',
    question: 'Can farm managers share prescriptions directly to field laborers via WhatsApp?',
    answer: 'Yes. Every alert resolution, AI diagnosis, and phenological stage protocol features 1-click WhatsApp and SMS sharing. Prescriptions are formatted into clear, multilingual action checklists tailored for field laborers.',
    icon: MessageCircle,
    tag: 'Field Labor Workflow',
  },
  {
    id: 'dpg',
    question: 'Is FloraNet compliant with Digital Public Goods (DPG) and Schema.org standards?',
    answer: 'FloraNet adheres strictly to open-source Digital Public Good principles, utilizing open telemetry schemas (AgriN JSON-LD standard) to ensure full federated data sovereignty and cross-border exchange compatibility without vendor lock-in.',
    icon: FileJson,
    tag: 'DPG Standards',
  },
  {
    id: 'brics',
    question: 'How does FloraNet calibrate for different BRICS soil types and currencies?',
    answer: 'FloraNet includes native presets for India (₹ INR), Brazil (R$ BRL), Russia (₽ RUB), China (¥ CNY), and South Africa (R ZAR). Switching regions instantly recalibrates default weather telemetry, mandi commodity exchanges, and regional cropping calendars.',
    icon: ShieldCheck,
    tag: 'BRICS Localization',
  },
];

import { useFarm } from '@/context/farmContext';
import { getLandingTranslation } from '@/data/landingTranslations';

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>('offline');
  const { userProfile } = useFarm();
  const t = getLandingTranslation(userProfile?.language || 'en');

  const toggleFAQ = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="w-full pb-20 md:pb-28">
      <div className="max-w-[1000px] mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11.5px] font-bold tracking-wider text-[#075C32] uppercase px-3 py-1 bg-[#EAF5EC] rounded-full border border-[#C4E7D0] inline-block mb-3">
            {t.faq.tag}
          </span>
          <h2 className="text-[32px] sm:text-[38px] font-bold text-[#102A20] tracking-tight mb-3">
            {t.faq.title}
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[#4F6258]">
            {t.faq.subtitle}
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-3.5">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            const Icon = faq.icon;

            return (
              <div
                key={faq.id}
                className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden shadow-2xs ${
                  isOpen ? 'border-[#168A45] ring-2 ring-[#EAF5EC]' : 'border-[#E1E8E2] hover:border-[#C8DCD0]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? 'bg-[#075C32] text-white' : 'bg-[#F2F7F4] text-[#075C32]'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#075C32] bg-[#EAF5EC] px-2 py-0.5 rounded-md mb-1 inline-block">
                        {faq.tag}
                      </span>
                      <h3 className="text-[15px] sm:text-[16px] font-bold text-[#102A20]">
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[#55695F] transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-[#075C32]' : ''
                  }`}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-[14px] text-[#4F6258] leading-relaxed border-t border-[#F0F5F2] animate-in fade-in duration-150">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
