"use client";

import React, { useEffect, useState } from 'react';
import { Database, Sprout, Droplets, Globe } from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { getLandingTranslation } from '@/data/landingTranslations';
import { fetchCorpusStats } from '@/services/farmApi';

export default function ImpactStats() {
  const { userProfile } = useFarm();
  const t = getLandingTranslation(userProfile?.language || 'en');

  // Real corpus size from the backend's FAISS index — never a guess.
  const [docCount, setDocCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchCorpusStats().then((stats) => {
      if (!mounted) return;
      setDocCount(stats && stats.indexed ? stats.document_count : null);
    });
    return () => { mounted = false; };
  }, []);

  const stats = [
    {
      id: 'stat-1',
      icon: Globe,
      value: '5',
      label: t.stats.nodes,
      badgeStyles: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'stat-2',
      icon: Database,
      value: docCount != null ? String(docCount) : '—',
      label: t.stats.corpora,
      badgeStyles: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'stat-3',
      icon: Droplets,
      value: 'LoRa',
      label: t.stats.water,
      badgeStyles: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'stat-4',
      icon: Sprout,
      value: '10m',
      label: t.stats.resolution,
      badgeStyles: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];

  return (
    <section className="w-full pb-16 md:pb-24">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8">
        
        {/* Horizontal Card Container */}
        <div className="bg-white border border-[#E2EBE4] rounded-2xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(7,92,50,0.04)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-[#E5ECE7]">
            
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.id}
                  className="flex items-center gap-4 lg:px-6 first:pl-2 last:pr-2 group"
                >
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-2xs ${stat.badgeStyles}`}>
                    <Icon size={22} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="text-[26px] sm:text-[28px] font-extrabold text-[#102A20] leading-none mb-1 tracking-tight">
                      {stat.value}
                    </h3>
                    <p className="text-[12.5px] font-semibold text-[#586C62] leading-tight">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>
        </div>

      </div>
    </section>
  );
}
