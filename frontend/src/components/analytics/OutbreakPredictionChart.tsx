"use client";

import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from "recharts";
import { Radio, Satellite } from "lucide-react";
import { fetchOutbreakEvents } from "@/services/farmApi";

interface OutbreakEvent {
  id?: string;
  pest_name?: string;
  severity?: string;
  origin_country?: string;
  affected_crop?: string;
  latitude?: number;
  longitude?: number;
}

// Live chart: active NASA EONET natural-hazard events over the BRICS nations,
// grouped by event category (wildfire, severe storm, flood, drought...). Every
// point comes straight from the live feed via the backend — nothing is
// simulated and no projection is invented when data is missing.

export default function OutbreakPredictionChart() {
  const [data, setData] = useState<
    Array<{ category: string; active: number }>
  >([]);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchOutbreakEvents().then((res) => {
      if (!mounted) return;
      const events = (res?.data ?? []) as OutbreakEvent[];
      if (!res) {
        setFailed(true);
      } else {
        // Group real events by their EONET category — no invented series.
        const counts = new Map<string, number>();
        for (const e of events) {
          const cat = (e.affected_crop || "Other").toString();
          counts.set(cat, (counts.get(cat) ?? 0) + 1);
        }
        setData(
          Array.from(counts.entries())
            .map(([category, active]) => ({ category, active }))
            .sort((a, b) => b.active - a.active)
        );
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const total = data.reduce((sum, d) => sum + d.active, 0);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-bold text-gray-800 text-lg">
          Active Hazard Events (NASA EONET)
        </h3>
        <p className="text-xs text-gray-500">
          Currently open natural-hazard events over BRICS nations, grouped by
          event category from the live feed.
        </p>
      </div>

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-500">
          <Satellite size={26} className="animate-pulse" />
          <span className="text-[13px] font-semibold">
            Loading live EONET events…
          </span>
        </div>
      )}

      {!loading && failed && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <Radio size={26} className="text-amber-600" />
          <span className="text-[13.5px] font-bold text-gray-800">
            EONET feed unreachable
          </span>
          <span className="text-xs text-gray-500 max-w-xs">
            No substitute chart is shown when the live feed is down — this view
            only displays real events.
          </span>
        </div>
      )}

      {!loading && !failed && data.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <Radio size={26} className="text-gray-400" />
          <span className="text-[13.5px] font-bold text-gray-800">
            No active hazard events
          </span>
          <span className="text-xs text-gray-500 max-w-xs">
            NASA EONET currently reports no open natural-hazard events over the
            BRICS nations.
          </span>
        </div>
      )}

      {!loading && !failed && data.length > 0 && (
        <>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  itemStyle={{ fontWeight: "bold" }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />

                <ReferenceArea x1={data[0].category} x2={data[data.length - 1].category} fill="#fef08a" fillOpacity={0.15} />

                <Line
                  type="monotone"
                  dataKey="active"
                  name="Active events"
                  stroke="#ef4444"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-gray-500 mt-3 font-medium">
            {total} active event{total === 1 ? "" : "s"} · source: NASA EONET v3
            via FloraNet backend
          </p>
        </>
      )}
    </div>
  );
}
