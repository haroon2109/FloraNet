'use client';

import React from 'react';
import { Leaf, Globe2, Shield, TrendingUp, Cpu, ArrowRight } from 'lucide-react';

const FEATURES = [
  { icon: Globe2, title: 'BRICS Agro-Globe', desc: 'Transboundary pest & trade vector intelligence across India, Brazil, and South Africa corridors.', color: '#4ADE80' },
  { icon: Leaf, title: 'Digital Soil Core', desc: 'GLSL wetness shaders driven by live Open-Meteo API — soil organic carbon, mycorrhizal networks.', color: '#22D3EE' },
  { icon: Cpu, title: 'Holographic Plant Twin', desc: 'On-device AI pins pathogen hotspots on a 3D GLSL holographic plant model for precision diagnosis.', color: '#818CF8' },
  { icon: Shield, title: 'Early Warning System', desc: '48-hour pest outbreak alerts with NDVI change detection and satellite-verified ground truth.', color: '#FBBF24' },
  { icon: TrendingUp, title: 'Yield Forecasting', desc: 'Neural network ensemble models calibrated on 12 years of SoilGrids + ERA5 reanalysis data.', color: '#F87171' },
  { icon: Globe2, title: 'Multi-Polar Policy Hub', desc: 'Real-time agricultural subsidy, tariff, and food security dashboards for BRICS policy makers.', color: '#34D399' },
];

const STATS = [
  { val: '2.4M', label: 'Acres Monitored', sub: 'Across 3 BRICS corridors' },
  { val: '94%', label: 'Model Accuracy', sub: 'Soil prediction (SoilGrids)' },
  { val: '48hr', label: 'Pest Warning', sub: 'Early detection window' },
  { val: '5', label: 'BRICS Nations', sub: 'India · Brazil · ZAF · China · Russia' },
];

const TECH = ['Next.js 16', 'React Three Fiber', 'GLSL Shaders', 'Ollama (local AI)', 'Open-Meteo API', 'FastAPI', 'Drei', 'Three.js', 'TypeScript', 'Tailwind CSS'];

export default function ZenithFooter() {
  return (
    <footer className="relative" style={{ background: 'linear-gradient(180deg, #010805 0%, #000000 100%)' }}>
      
      {/* Feature Grid Section */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-14 pt-20 pb-16">
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest">Platform Capabilities</span>
          <h2 className="text-[34px] md:text-[44px] font-black text-white leading-tight mt-2">
            Everything you need to<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #4ade80, #22d3ee)' }}>
              farm intelligently
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {FEATURES.map((f) => (
            <div key={f.title} className="group p-5 bg-white/3 hover:bg-white/6 border border-white/8 hover:border-white/16 rounded-2xl transition-all duration-300">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                <f.icon size={18} style={{ color: f.color }} />
              </div>
              <h3 className="text-[14px] font-black text-white mb-1.5">{f.title}</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-16 border-y border-white/8 py-10">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-[38px] font-black text-white leading-none">{s.val}</div>
              <div className="text-[13px] font-bold text-emerald-400 mt-1">{s.label}</div>
              <div className="text-[11px] text-slate-600 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tech Stack Pill Row */}
        <div className="flex flex-wrap justify-center gap-2 mb-16">
          <span className="text-[11px] text-slate-500 font-semibold mr-2 self-center">Built with:</span>
          {TECH.map((t) => (
            <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 text-white/60 text-[11px] font-bold rounded-full">
              {t}
            </span>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 text-center border border-emerald-900/40"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, #052916 0%, #01100A 100%)' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #4ade8014 0%, transparent 60%), radial-gradient(circle at 70% 50%, #22d3ee10 0%, transparent 60%)' }} />
          <h2 className="relative text-[28px] md:text-[40px] font-black text-white leading-tight mb-3">
            Start farming smarter.<br />
            <span className="text-emerald-400">Join FloraNet Zenith today.</span>
          </h2>
          <p className="relative text-[14px] text-slate-400 mb-6 max-w-[420px] mx-auto">
            Free tier includes 5 fields, full 3D visualisations, and live AI diagnostics.
          </p>
          <div className="relative flex items-center justify-center gap-3 flex-wrap">
            <a href="/signup" className="flex items-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[14px] rounded-2xl transition-all shadow-lg shadow-emerald-900/40">
              Get Started Free <ArrowRight size={15} />
            </a>
            <a href="/home" className="flex items-center gap-2 px-7 py-3.5 bg-white/8 hover:bg-white/12 border border-white/10 text-white font-bold text-[14px] rounded-2xl transition-all">
              View Live Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="border-t border-white/8 px-6 md:px-14 py-6 max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <Leaf size={12} className="text-white" />
          </div>
          <span className="font-black text-[15px] text-white">FloraNet</span>
          <span className="text-[10px] text-slate-500 font-semibold">Zenith MVP · Google CEO Direct Build</span>
        </div>
        <div className="flex items-center gap-5 text-[12px] text-slate-600">
          <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
          <a href="/field" className="hover:text-white transition-colors">Field Monitor</a>
          <a href="/policy-dashboard" className="hover:text-white transition-colors">Policy Hub</a>
          <a href="/ai-assistant" className="hover:text-white transition-colors">AI Assistant</a>
        </div>
        <p className="text-[11px] text-slate-700">© 2026 FloraNet · Open-source stack · Local AI</p>
      </div>
    </footer>
  );
}
