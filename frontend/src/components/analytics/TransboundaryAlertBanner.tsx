"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, MapPin, Radio, ShieldCheck } from "lucide-react";
import { fetchOutbreakEvents } from "@/services/farmApi";

interface LiveOutbreak {
  pest_name?: string;
  severity?: string;
  origin_country?: string;
  affected_crop?: string;
}

export default function TransboundaryAlertBanner() {
  const [event, setEvent] = useState<LiveOutbreak | null>(null);

  useEffect(() => {
    // Live banner: first active NASA EONET hazard over BRICS nations, via backend.
    // Renders nothing when the feed is unreachable — never a canned alert.
    let mounted = true;
    fetchOutbreakEvents().then((data) => {
      if (!mounted) return;
      const first = data?.data?.[0] as LiveOutbreak | undefined;
      if (first) setEvent(first);
    });
    return () => { mounted = false; };
  }, []);

  if (!event) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-600 shadow-sm rounded-r-lg mb-6 p-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <div className="relative">
            <Radio size={24} className="text-red-600 animate-pulse" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-red-900 text-sm uppercase tracking-wide">
              Corridor Hazard Watch: {event.pest_name || "Unnamed event"}
            </h3>
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              CRITICAL VECTOR
            </span>
          </div>
          
          <p className="text-sm text-red-800 font-medium mb-3">
            NASA EONET reports an active <span className="font-bold">{event.affected_crop || "hazard"}</span> event
            originating in <span className="font-bold">{event.origin_country || "an unlisted region"}</span>
            {event.severity ? (<span> — severity <span className="font-bold uppercase">{event.severity}</span></span>) : null}.
          </p>

          <div className="bg-white rounded-md border border-red-100 p-3 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-gray-400" /> Target Zones at Risk
              </p>
              <p className="text-xs font-semibold text-gray-800">
                {event.origin_country || "Origin pending"} corridor — see DPG Hub map for the observed epicenter
              </p>
            </div>
            
            <div className="flex-1 border-t sm:border-t-0 sm:border-l border-red-100 pt-2 sm:pt-0 sm:pl-4">
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1">
                <ShieldCheck size={12} className="text-green-600" /> Pre-emptive Bio-Barrier Action
              </p>
              <p className="text-xs font-semibold text-green-700">
                Consult the live advisory feed before moving inputs or crews into the affected corridor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
