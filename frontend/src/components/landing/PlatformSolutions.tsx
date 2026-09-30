"use client";

import React from 'react';
import Link from 'next/link';
import { User, Leaf, Landmark, FlaskConical, ArrowRight } from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { getLandingTranslation } from '@/data/landingTranslations';

export default function PlatformSolutions() {
  const { userProfile } = useFarm();
  const t = getLandingTranslation(userProfile?.language || 'en');

  const cards = [
    {
      id: 'farmers',
      title: t.solutions.farmers,
      description: t.solutions.farmersDesc,
      icon: User,
      href: '/home',
      badgeStyles: 'bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-[#075C32] group-hover:text-white group-hover:border-[#075C32]',
      accentColor: 'text-[#075C32]',
    },
    {
      id: 'agribusinesses',
      title: t.solutions.agribusiness,
      description: t.solutions.agribusinessDesc,
      icon: Leaf,
      href: '/crop-details',
      badgeStyles: 'bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600',
      accentColor: 'text-blue-700',
    },
    {
      id: 'governments',
      title: t.solutions.government,
      description: t.solutions.governmentDesc,
      icon: Landmark,
      href: '/policy-dashboard',
      badgeStyles: 'bg-indigo-50 text-indigo-700 border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600',
      accentColor: 'text-indigo-700',
    },
    {
      id: 'researchers',
      title: t.solutions.researchers,
      description: t.solutions.researchersDesc,
      icon: FlaskConical,
      href: '/seed-network',
      badgeStyles: 'bg-amber-50 text-amber-700 border-amber-200 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600',
      accentColor: 'text-amber-700',
    },
  ];

  return (
    <section id="solutions" className="w-full pb-20 md:pb-28">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8">
        
        {/* Center Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <p className="text-[11.5px] font-bold tracking-wider text-[#075C32] uppercase mb-2">
            {t.solutions.tag}
          </p>
          <h2 className="text-[32px] sm:text-[36px] md:text-[38px] font-bold text-[#102A20] tracking-tight mb-3">
            {t.solutions.title}
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[#4F6258] leading-relaxed">
            {t.solutions.subtitle}
          </p>
        </div>

        {/* 4 Cards Grid with Semantic Badges and Hover States */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="bg-white border border-[#E2EBE4] rounded-2xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(7,92,50,0.03)] hover:shadow-[0_10px_30px_rgba(7,92,50,0.08)] hover:border-[#CFDEC1] transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-5 transition-all duration-200 shadow-2xs group-hover:scale-110 group-hover:shadow-md ${card.badgeStyles}`}>
                    <Icon size={22} strokeWidth={2.2} />
                  </div>
                  
                  <h3 className="text-[18px] font-bold text-[#102A20] mb-2.5">
                    {card.title}
                  </h3>
                  
                  <p className="text-[14px] text-[#55695F] leading-[1.55] mb-6">
                    {card.description}
                  </p>
                </div>

                <Link
                  href={card.href}
                  className="text-[#075C32] text-[13.5px] font-bold flex items-center gap-1.5 hover:gap-2 transition-all"
                >
                  <span>{t.solutions.learnMore}</span>
                  <ArrowRight size={15} strokeWidth={2.2} />
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
