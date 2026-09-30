"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Wifi, WifiOff } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/apiConfig';

export default function LiveNodeStatus() {
  const [latency, setLatency] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const checkNodeHealth = async () => {
      const startTime = performance.now();
      try {
        const res = await fetch(`${getApiBaseUrl()}/`, { 
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        });
        const elapsed = Math.round(performance.now() - startTime);
        if (isMounted) {
          if (res.ok) {
            setLatency(elapsed);
            setIsOnline(true);
          } else {
            setIsOnline(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          // If direct localhost:7880 fails (e.g. client side CORS / offline), indicate cached state
          setIsOnline(false);
        }
      }
    };

    checkNodeHealth();
    const interval = setInterval(checkNodeHealth, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 font-medium text-[12px]">
      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
      <span>
        {isOnline 
          ? `FloraNet Core Node Online ${latency ? `· ${latency}ms` : ''}` 
          : 'Local PWA Telemetry Cache Active'}
      </span>
    </div>
  );
}
