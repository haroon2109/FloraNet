"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, Wheat, Sprout, Mountain, Sun } from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { getLandingTranslation } from '@/data/landingTranslations';

export default function BRICSImpact() {
  const { userProfile } = useFarm();
  const t = getLandingTranslation(userProfile?.language || 'en');

  const countries = [
    {
      id: 'brazil',
      name: 'Brazil',
      impact: 'Cerrado & Mato Grosso regenerative soy corridors (Embrapa)',
      image: '/images/landing/brics_brazil.jpg',
      badgeBg: 'bg-[#009B3A]',
      icon: Leaf,
    },
    {
      id: 'russia',
      name: 'Russia',
      impact: 'Chernozem black soil winter wheat resilience (Voronezh)',
      image: '/images/landing/brics_russia.jpg',
      badgeBg: 'bg-[#0039A6]',
      icon: Wheat,
    },
    {
      id: 'india',
      name: 'India',
      impact: 'Smallholder NPK precision & fermented bio-inputs (ICAR)',
      image: '/images/landing/brics_india.jpg',
      badgeBg: 'bg-[#FF9933]',
      icon: Sprout,
    },
    {
      id: 'china',
      name: 'China',
      impact: 'Smart sensor precision & grain security (CAAS)',
      image: '/images/landing/brics_china.jpg',
      badgeBg: 'bg-[#DE2910]',
      icon: Mountain,
    },
    {
      id: 'south-africa',
      name: 'South Africa',
      impact: 'Highveld & Karoo drought-hardy pulse systems (ARC)',
      image: '/images/landing/brics_south_africa.jpg',
      badgeBg: 'bg-[#007749]',
      icon: Sun,
    },
  ];

  return (
    <section id="brics-impact" className="w-full pb-20 md:pb-28">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* LEFT SIDE: Heading & Copy */}
          <div className="lg:col-span-4 flex flex-col justify-center pr-0 lg:pr-4">
            <p className="text-[11.5px] font-bold tracking-wider text-[#075C32] uppercase mb-2">
              {t.brics.tag}
            </p>
            <h2 className="text-[32px] sm:text-[36px] font-bold text-[#102A20] tracking-tight leading-[1.18] mb-4">
              {t.brics.title}
            </h2>
            <p className="text-[15px] text-[#4F6258] leading-[1.6] mb-6">
              {t.brics.subtitle}
            </p>
            <Link
              href="/policy-dashboard"
              className="text-[#075C32] text-[14.5px] font-semibold flex items-center gap-1.5 hover:gap-2 transition-all w-fit"
            >
              <span>{t.brics.viewCorridor}</span>
              <ArrowRight size={16} strokeWidth={2.2} />
            </Link>
          </div>

          {/* RIGHT SIDE: 5 Country Cards */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
              {countries.map((country) => {
                const Icon = country.icon;
                return (
                  <Link
                    key={country.id}
                    href={`/market-prices?country=${country.name}`}
                    className="flex flex-col items-center text-center group cursor-pointer transition-transform hover:-translate-y-1"
                  >
                    {/* Country Illustration Card Wrapper with Unclipped Badge */}
                    <div className="relative w-full mb-3.5">
                      <div className="relative w-full aspect-[3/4] rounded-[14px] overflow-hidden border border-[#E2EBE4] shadow-xs group-hover:shadow-md group-hover:border-[#168A45]/40 transition-all bg-white">
                        <img
                          src={country.image}
                          alt={`${country.name} agricultural landscape`}
                          loading="lazy"
                          draggable={false}
                          width={200}
                          height={267}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                        />
                      </div>
                      {/* Floating Bottom Badge - Overlapping Bottom Border (Unclipped) */}
                      <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20">
                        <div className={`w-8 h-8 rounded-full ${country.badgeBg} text-white flex items-center justify-center shadow-md border-2 border-white transition-transform group-hover:scale-115`}>
                          <Icon size={14} strokeWidth={2.2} />
                        </div>
                      </div>
                    </div>

                    {/* Country Name & Impact */}
                    <div className="pt-2">
                      <h3 className="text-[14.5px] font-bold text-[#102A20] group-hover:text-[#075C32] leading-tight mb-1 transition-colors">
                        {country.name}
                      </h3>
                      <p className="text-[11.5px] text-[#55695F] leading-tight line-clamp-2">
                        {country.impact}
                      </p>
                    </div>

                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
