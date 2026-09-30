"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Leaf, 
  Droplets, 
  TrendingUp, 
  Scan, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Play, 
  Radio, 
  Sliders, 
  Sun,
  Send,
  Loader2,
  Bot,
  Satellite
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/apiConfig';
import { fetchBRICSExchangeRates, fetchSentinel2Scene, fetchWeatherTelemetry, fetchFieldsTelemetry, mutateFieldIrrigation } from '@/services/farmApi';
import { useUILocale } from '@/lib/useUILocale';

export default function InteractiveSandbox() {
  // Scene timestamps follow the language picked on the landing page.
  const locale = useUILocale();
  const [activeTab, setActiveTab] = useState<'twin' | 'radar' | 'ai' | 'mandi'>('twin');
  // Valve toggle state comes from the backend field registry — no demo valves.
  const [twinIrrigationState, setTwinIrrigationState] = useState<boolean | null>(null);
  const [twinFieldId, setTwinFieldId] = useState<string | null>(null);
  const [twinIrrigationPending, setTwinIrrigationPending] = useState(false);
  const [twinIrrigationMsg, setTwinIrrigationMsg] = useState<string>('');
  const [twinWeather, setTwinWeather] = useState<{ soil_moisture_pct?: number | null; temperature_c?: number | null } | null>(null);
  const [demoPersona, setDemoPersona] = useState<'precision' | 'regenerative' | 'sage'>('precision');
  const [selectedCurrency, setSelectedCurrency] = useState<'INR' | 'BRL' | 'RUB' | 'CNY' | 'ZAR'>('INR');
  const [liveCommodities, setLiveCommodities] = useState<any[]>([]);
  const [marketStatus, setMarketStatus] = useState<'loading' | 'live' | 'unavailable'>('loading');

  // Live Sentinel-2 scene metadata (real Copernicus catalogue)
  const [s2Scene, setS2Scene] = useState<{ scene_id: string; sensing_time: string; tile: string } | null>(null);
  const [s2Status, setS2Status] = useState<'loading' | 'live' | 'unavailable'>('loading');

  useEffect(() => {
    let mounted = true;
    fetchSentinel2Scene(18.5204, 73.8567).then((data) => {
      if (!mounted) return;
      if (data?.scene) {
        setS2Scene(data.scene);
        setS2Status('live');
      } else {
        setS2Status('unavailable');
      }
    });
    // Live twin panel: first registered field + live Pune weather (no demo values).
    fetchFieldsTelemetry().then((rows) => {
      if (!mounted || !rows || rows.length === 0) return;
      setTwinFieldId(rows[0].id ?? null);
      const st = rows[0].irrigation_status;
      setTwinIrrigationState(typeof st === 'boolean' ? st : st === 'ON' || st === 'Active' ? true : st === 'OFF' || st === 'Inactive' ? false : null);
    });
    fetchWeatherTelemetry(18.5204, 73.8567).then((wx) => {
      if (!mounted) return;
      if (wx) setTwinWeather({ soil_moisture_pct: wx.soil_moisture_pct ?? null, temperature_c: wx.temperature_c ?? null });
    });
    return () => { mounted = false; };
  }, []);

  const handleTwinIrrigation = async () => {
    if (!twinFieldId) {
      setTwinIrrigationMsg('No registered field — register a farm/plot before logging valve actions.');
      return;
    }
    const next = !(twinIrrigationState === true);
    setTwinIrrigationPending(true);
    const res = await mutateFieldIrrigation(twinFieldId, next);
    setTwinIrrigationPending(false);
    if (res) {
      setTwinIrrigationState(next);
      setTwinIrrigationMsg(`Valve ${next ? 'ON' : 'OFF'} logged for ${twinFieldId}.`);
    } else {
      setTwinIrrigationMsg('Backend unreachable — valve action was not logged.');
    }
  };

  // Tab 2: Dynamic NDVI Threshold
  const [ndviThreshold, setNdviThreshold] = useState<number>(0.65);

  // Tab 3: Interactive Live AI Inference
  const [userQuery, setUserQuery] = useState<string>("How should I manage yellowing leaf margins in wheat?");
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiSource, setAiSource] = useState<string>('FloraNet RAG corpus');

  useEffect(() => {
    let isMounted = true;
    setMarketStatus('loading');
    fetchBRICSExchangeRates(selectedCurrency).then((rows) => {
      if (!isMounted) return;
      setLiveCommodities(rows.slice(0, 3));
      setMarketStatus(rows.length > 0 ? 'live' : 'unavailable');
    });
    return () => { isMounted = false; };
  }, [selectedCurrency]);

  // Preset queries for AI Sandbox
  const sampleQueries = [
    "How should I manage yellowing leaf margins in wheat?",
    "Best organic treatment for cotton bollworm infestation?",
    "Optimal drip irrigation schedule for sandy loam soil?"
  ];

  const handleAskAI = async (queryText?: string) => {
    const prompt = queryText || userQuery;
    if (!prompt.trim()) return;

    setIsAiLoading(true);
    setAiResponse('');

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/farm/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          persona: demoPersona,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.content || '');
        setAiSource((data.sources?.[0]) || 'FloraNet RAG + local LLM (live)');
      } else {
        let detail = '';
        try {
          const err = await res.json();
          detail = err?.detail ? ` — ${err.detail}` : '';
        } catch { /* ignore */ }
        setAiResponse(`Live AI advisory unavailable (HTTP ${res.status}${detail}). No substitute advice is shown.`);
        setAiSource('Live RAG Engine');
      }
    } catch (e) {
      setAiResponse('Live AI advisory unreachable (backend offline or timed out). FloraNet does not fabricate advice in offline mode.');
      setAiSource('Live RAG Engine');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Trigger AI response generation when persona changes
  useEffect(() => {
    handleAskAI(userQuery);
  }, [demoPersona]);

  return (
    <section className="w-full py-16 sm:py-20 bg-gradient-to-b from-[#F7F9F7] via-white to-[#F7F9F7] border-y border-[#E5EFE8]">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11.5px] font-bold tracking-wider text-[#075C32] uppercase px-3 py-1 bg-[#EAF5EC] rounded-full border border-[#C4E7D0] inline-block mb-3">
            INTERACTIVE LIVE SANDBOX
          </span>
          <h2 className="text-[32px] sm:text-[38px] font-bold text-[#102A20] tracking-tight mb-3">
            Experience FloraNet Intelligence
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[#4F6258]">
            Test the live telemetry models, satellite radar, and agronomy personas right in your browser.
          </p>
        </div>

        {/* Tab Strip */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'twin', label: '3D Digital Twin Farm', icon: Leaf },
            { id: 'radar', label: 'Sentinel-2 NDVI Radar', icon: Scan },
            { id: 'ai', label: 'Multi-Persona AI Advisor', icon: Sparkles },
            { id: 'mandi', label: 'BRICS Mandi Arbitrage', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[14px] font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#075C32] text-white shadow-sm scale-105'
                    : 'bg-white text-[#4A5D54] hover:bg-[#EEF7F1] border border-[#D5E5D8]'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D5E5D8] shadow-xl relative overflow-hidden">
          
          {/* TAB 1: 3D Digital Twin */}
          {activeTab === 'twin' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-200">
              <div className="lg:col-span-6 space-y-4">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-[12px] font-bold border border-emerald-200">
                  ⚡ Autonomous IoT LoRaWAN Mesh Control
                </span>
                <h3 className="text-[22px] font-bold text-[#102A20]">
                  Closed-Loop Soil Telemetry & Deficit Irrigation
                </h3>
                <p className="text-[14px] text-[#55695F] leading-relaxed">
                  Real-time soil probe telemetry measuring VWC moisture, electrical conductivity, and root-zone thermal gradients across distributed zones.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#E3ECE6]">
                    <span className="text-[11.5px] text-[#607469] font-medium block">Live Soil Moisture (Open-Meteo)</span>
                    {twinWeather == null ? (
                      <span className="text-[13px] font-bold text-[#607469]">Unavailable — backend offline</span>
                    ) : (
                      <span className="text-[20px] font-bold text-[#102A20]">{twinWeather.soil_moisture_pct ?? '—'}% VWC</span>
                    )}
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#E3ECE6]">
                    <span className="text-[11.5px] text-[#607469] font-medium block">Live Air Temp (Open-Meteo)</span>
                    {twinWeather == null ? (
                      <span className="text-[13px] font-bold text-[#607469]">Unavailable — backend offline</span>
                    ) : (
                      <span className="text-[20px] font-bold text-[#102A20]">{twinWeather.temperature_c ?? '—'}°C</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTwinIrrigation}
                    disabled={twinIrrigationPending}
                    className="px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all flex items-center gap-2 bg-[#075C32] hover:bg-[#054324] text-white shadow-xs hover:scale-105 disabled:opacity-50"
                  >
                    <Droplets size={16} />
                    <span>{twinIrrigationPending ? 'Logging…' : twinIrrigationState === true ? 'Log Valve OFF' : 'Log Valve ON'}</span>
                  </button>

                  <Link
                    href="/dashboard"
                    className="px-4 py-2.5 bg-[#F2F7F4] hover:bg-[#E2ECE5] text-[#243A2E] rounded-xl font-bold text-[13px] transition-all inline-flex items-center gap-2"
                  >
                    <span>Full Telemetry</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
                {twinIrrigationMsg && (
                  <p className="text-[11.5px] text-[#607469]">{twinIrrigationMsg}</p>
                )}
              </div>

              <div className="lg:col-span-6 bg-[#102A20] rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[280px]">
                <div className="flex items-center justify-between border-b border-emerald-900 pb-3">
                  <span className="text-[12px] font-bold text-emerald-400">🌿 Field Digital Twin State</span>
                  <span className="text-[11px] text-emerald-300 font-mono">LoRa Node #04 · 868 MHz</span>
                </div>
                <div className="space-y-3 py-4">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-300">Irrigation Valve (backend log):</span>
                    <span className="font-bold text-white">
                      {twinIrrigationState == null ? 'No registered field' : twinIrrigationState ? 'ON (logged)' : 'OFF (logged)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-300">Live Soil Moisture:</span>
                    <span className="font-bold text-white">{twinWeather == null ? 'Unavailable' : `${twinWeather.soil_moisture_pct ?? '—'}%`}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-300">Live Air Temp:</span>
                    <span className="font-bold text-white">{twinWeather == null ? 'Unavailable' : `${twinWeather.temperature_c ?? '—'}°C`}</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800 text-[11.5px] text-emerald-200">
                  Valve actions are logged to POST /api/v1/farm/irrigation/toggle. Physical actuation requires a registered gateway.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Sentinel-2 NDVI Radar with Interactive Threshold Slider */}
          {activeTab === 'radar' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-200">
              <div className="lg:col-span-6 space-y-4">
                <span className="px-3 py-1 bg-amber-50 text-amber-800 rounded-lg text-[12px] font-bold border border-amber-200">
                  🛰️ Sentinel-2 Multispectral Constellation (10m Resolution)
                </span>
                <h3 className="text-[22px] font-bold text-[#102A20]">
                  Satellite Multispectral Field Canopy Health
                </h3>
                <p className="text-[14px] text-[#55695F] leading-relaxed">
                  Monitor photosynthetic vigor across your acreage without manual scouting. Adjust the NDVI threshold slider to segment stress zones in real time.
                </p>

                {/* Interactive Threshold Slider */}
                <div className="p-4 bg-[#F7FAF8] rounded-2xl border border-[#DCE8DF] space-y-2">
                  <div className="flex items-center justify-between text-[12.5px] font-bold text-[#102A20]">
                    <span className="flex items-center gap-1.5">
                      <Sliders size={14} className="text-[#075C32]" />
                      <span>Stress Alarm Threshold</span>
                    </span>
                    <span className="font-mono text-[#075C32] bg-[#EAF5EC] px-2 py-0.5 rounded">
                      NDVI &lt; {ndviThreshold.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="0.9"
                    step="0.05"
                    value={ndviThreshold}
                    onChange={(e) => setNdviThreshold(parseFloat(e.target.value))}
                    className="w-full accent-[#075C32] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#607469]">
                    <span>0.20 (Severe Stress)</span>
                    <span>0.90 (Max Density)</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {s2Status === 'live' && s2Scene ? (
                    <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#DCE8DF] space-y-1.5">
                      <p className="text-[11px] font-bold text-[#075C32] uppercase tracking-wider">Latest Real Sentinel-2 Acquisition</p>
                      <p className="text-[12px] text-[#243A2E] font-mono break-all">{s2Scene.scene_id}</p>
                      <p className="text-[11px] text-[#55695F]">
                        Tile {s2Scene.tile} · sensed {new Date(s2Scene.sensing_time).toLocaleString(locale)}
                      </p>
                      <p className="text-[10.5px] text-[#607469] border-t border-[#E3ECE6] pt-1.5">
                        Source: Copernicus Data Space catalogue. Pixel-level NDVI requires authenticated
                        raster access and is therefore not simulated here.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <p className="text-[12px] font-bold text-amber-800">
                        {s2Status === 'loading' ? 'Fetching Copernicus catalogue…' : 'Sentinel-2 scene metadata unavailable'}
                      </p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        {s2Status !== 'loading' && 'Live NDVI values require an authenticated Copernicus raster subscription — no substitute values shown.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Link
                    href="/field-health"
                    className="px-4 py-2.5 bg-[#075C32] text-white hover:bg-[#054324] rounded-xl font-bold text-[13px] transition-all inline-flex items-center gap-2"
                  >
                    <span>Launch Field Health Map</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 bg-gradient-to-br from-[#168A45] to-[#075C32] rounded-2xl p-6 text-white flex flex-col justify-between min-h-[280px] shadow-lg">
                <div className="flex items-center justify-between border-b border-emerald-400/30 pb-3">
                  <span className="font-bold text-[13px]">Copernicus Sentinel-2 L2A</span>
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-mono">10m MSI</span>
                </div>
                <div className="py-6 text-center space-y-2">
                  {s2Status === 'live' && s2Scene ? (
                    <>
                      <Satellite size={40} className="mx-auto text-emerald-100" />
                      <p className="text-[13px] text-emerald-200">Real scene over the demo farm</p>
                      <p className="text-[11px] font-mono text-emerald-100/80">{s2Scene.tile} · {s2Scene.sensing_time?.slice(0, 10)}</p>
                    </>
                  ) : (
                    <>
                      <Scan size={40} className="mx-auto text-emerald-100/60" />
                      <p className="text-[13px] text-emerald-200">{s2Status === 'loading' ? 'Querying Copernicus…' : 'Scene metadata unavailable'}</p>
                    </>
                  )}
                </div>
                <div className="p-3 bg-black/20 rounded-xl text-[11.5px] text-emerald-100">
                  NDVI threshold simulation is a UI demo only — displayed thresholds are not
                  applied to real pixels. Live NDVI requires Copernicus authenticated access.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Multi-Persona AI Advisor with Live RAG Execution */}
          {activeTab === 'ai' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
              <div className="lg:col-span-6 space-y-4">
                <span className="px-3 py-1 bg-purple-50 text-purple-800 rounded-lg text-[12px] font-bold border border-purple-200">
                  🤖 Tri-Persona Agricultural RAG Engine
                </span>
                <h3 className="text-[22px] font-bold text-[#102A20]">
                  Grounded in Verified ICAR, Embrapa & ARC Corpora
                </h3>
                <p className="text-[14px] text-[#55695F] leading-relaxed">
                  Switch between 3 agronomic perspectives tailored to your farming philosophy.
                </p>

                {/* Persona Switcher Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setDemoPersona('precision')}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                      demoPersona === 'precision' 
                        ? 'bg-[#075C32] text-white shadow-xs' 
                        : 'bg-[#F2F7F4] text-[#4F6258] hover:bg-white border border-[#D5E5D8]'
                    }`}
                  >
                    Precision Agronomist
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoPersona('regenerative')}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                      demoPersona === 'regenerative' 
                        ? 'bg-[#168A45] text-white shadow-xs' 
                        : 'bg-[#F2F7F4] text-[#4F6258] hover:bg-white border border-[#D5E5D8]'
                    }`}
                  >
                    Regenerative Guide
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoPersona('sage')}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                      demoPersona === 'sage' 
                        ? 'bg-[#854D0E] text-white shadow-xs' 
                        : 'bg-[#F2F7F4] text-[#4F6258] hover:bg-white border border-[#D5E5D8]'
                    }`}
                  >
                    Traditional Sage
                  </button>
                </div>

                {/* Sample Prompt Quick-Pills */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11.5px] font-bold text-[#607469] uppercase tracking-wider block">
                    Quick Sample Questions:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {sampleQueries.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setUserQuery(q);
                          handleAskAI(q);
                        }}
                        className="text-left text-[12px] text-[#243A2E] hover:text-[#075C32] bg-[#F7FAF8] hover:bg-[#EEF7F1] px-3 py-2 rounded-xl border border-[#DCE8DF] transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <span className="truncate pr-2">{q}</span>
                        <ArrowRight size={12} className="shrink-0 text-[#8DA095] group-hover:text-[#075C32]" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/ai-assistant"
                    className="px-4 py-2.5 bg-[#075C32] text-white hover:bg-[#054324] rounded-xl font-bold text-[13px] transition-all inline-flex items-center gap-2"
                  >
                    <span>Open Full AI Advisor</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Interactive Prompt & AI Response Console */}
              <div className="lg:col-span-6 bg-[#FAFCFA] border border-[#DCE8DE] rounded-2xl p-5 space-y-4 shadow-xs">
                
                {/* User Input Bar */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskAI();
                  }}
                  className="relative flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Ask any crop health or soil question..."
                    className="w-full bg-white border border-[#D5E3D8] rounded-xl pl-3.5 pr-10 py-2.5 text-[13px] text-[#102A20] placeholder-[#8DA095] focus:outline-none focus:ring-2 focus:ring-[#168A45]/30"
                  />
                  <button
                    type="submit"
                    disabled={isAiLoading || !userQuery.trim()}
                    className="absolute right-1.5 p-1.5 bg-[#075C32] hover:bg-[#054324] disabled:opacity-50 text-white rounded-lg transition-all cursor-pointer"
                    aria-label="Send Query"
                  >
                    {isAiLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  </button>
                </form>

                {/* AI Persona Response Card */}
                <div className="p-4 bg-white border border-[#E1E8E2] rounded-xl space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#EEF2EF] pb-2">
                    <span className="text-[11.5px] font-bold text-[#075C32] uppercase tracking-wider flex items-center gap-1.5">
                      <Bot size={14} />
                      {demoPersona === 'precision' && 'Precision Telemetry Model'}
                      {demoPersona === 'regenerative' && 'Bio-Ecological RAG Model'}
                      {demoPersona === 'sage' && 'Heritage Agronomy Model'}
                    </span>
                    <span className="text-[10.5px] font-mono text-[#607469] bg-[#F0F5F2] px-2 py-0.5 rounded">
                      {aiSource}
                    </span>
                  </div>

                  {isAiLoading ? (
                    <div className="flex items-center gap-2.5 py-4 text-[13px] text-[#607469]">
                      <Loader2 size={16} className="animate-spin text-[#075C32]" />
                      <span>Synthesizing multi-modal telemetry recommendations...</span>
                    </div>
                  ) : (
                    <p className="text-[13px] text-[#243A2E] leading-relaxed">
                      {aiResponse || 'Select a question or type your crop challenge above to run live inference.'}
                    </p>
                  )}
                </div>

                <div className="p-3 bg-[#EAF5EC] rounded-xl text-[11.5px] text-[#075C32] flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>Ground truth verified against ICAR & Embrapa agronomy publications.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BRICS Mandi Arbitrage */}
          {activeTab === 'mandi' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-200">
              <div className="lg:col-span-6 space-y-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-lg text-[12px] font-bold border border-blue-200">
                  📈 Cross-Border Commodity Price Radar
                </span>
                <h3 className="text-[22px] font-bold text-[#102A20]">
                  Real-Time Commodity Benchmarks Across BRICS
                </h3>
                <p className="text-[14px] text-[#55695F] leading-relaxed">
                  Track live CBOT/ICE futures benchmarks converted at spot FX for INR, BRL, RUB, CNY and ZAR — the same feed powers farm-level price alerts.
                </p>

                {/* Currency Switcher */}
                <div className="flex gap-2 pt-1">
                  {(['INR', 'BRL', 'RUB', 'CNY', 'ZAR'] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setSelectedCurrency(curr)}
                      className={`px-3 py-1 text-[11.5px] font-bold rounded-lg transition-all cursor-pointer ${
                        selectedCurrency === curr
                          ? 'bg-[#075C32] text-white shadow-xs'
                          : 'bg-[#F2F7F4] text-[#4F6258] hover:bg-white border border-[#D5E5D8]'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <Link
                    href="/market-prices"
                    className="px-4 py-2.5 bg-[#075C32] text-white hover:bg-[#054324] rounded-xl font-bold text-[13px] transition-all inline-flex items-center gap-2"
                  >
                    <span>View All Mandi Rates</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 bg-[#FAFCFA] border border-[#DCE8DE] rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex justify-between items-center border-b border-[#EEF2EF] pb-3 text-[12px] font-bold text-[#607469]">
                  <span>Commodity</span>
                  <span>Benchmark ({selectedCurrency}/t)</span>
                  <span>Δ 1D</span>
                </div>
                {marketStatus === 'loading' && (
                  <div className="py-8 text-center text-[13px] text-[#607469]">Fetching live CBOT/ICE futures…</div>
                )}
                {marketStatus === 'unavailable' && (
                  <div className="py-8 text-center">
                    <p className="text-[13px] font-bold text-[#102A20]">Live market feed unavailable</p>
                    <p className="text-[11px] text-[#607469] mt-1">Backend /api/v1/farm/mandi-spot unreachable — no substitute prices shown.</p>
                  </div>
                )}
                {marketStatus === 'live' && liveCommodities.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white border border-[#E1E8E2] rounded-xl flex justify-between items-center text-[13px]">
                    <span className="font-semibold text-[#102A20]">{item.crop}</span>
                    <span className="font-mono font-bold text-[#075C32]">{item.price}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      item.direction === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                    }`}>
                      {item.trend}
                    </span>
                  </div>
                ))}
                <p className="text-[10.5px] text-[#8DA095] leading-relaxed">
                  Real-time CBOT/ICE futures benchmarks converted at live spot FX (Yahoo Finance).
                  Exchange benchmarks, not local retail mandi quotes.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
