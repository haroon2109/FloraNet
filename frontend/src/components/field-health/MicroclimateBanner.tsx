"use client";

import React, { useEffect, useState } from "react";
import { ThermometerSun, Snowflake, Droplets, X, Wind } from "lucide-react";
import { useFarm } from "@/context/farmContext";
import { fetchWeatherTelemetry } from "@/services/farmApi";

export interface Alert {
  id: string;
  type: "heat" | "frost" | "humidity" | "wind";
  title: string;
  message: string;
}

/**
 * Microclimate alerts derived from LIVE Open-Meteo current conditions +
 * 7-day forecast using deterministic agronomic thresholds. No static mock
 * alerts — if the feed is unavailable, nothing is rendered.
 */
export default function MicroclimateBanner() {
  const { userProfile } = useFarm();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    const coords = userProfile.defaultCoordinates;
    fetchWeatherTelemetry(coords?.lat, coords?.lng).then((wx) => {
      if (!mounted) return;
      const found: Alert[] = [];
      if (wx) {
        const temp = wx.current_temp as number | undefined;
        const humidity = wx.humidity as number | undefined;
        const wind = wx.wind_speed_kmh as number | undefined;
        const forecast = (wx.forecast || []) as any[];

        if (temp != null && temp >= 35) {
          found.push({
            id: "heat-now",
            type: "heat",
            title: "Heat Stress Warning",
            message: `Live temp ${temp}°C ≥ 35°C. Increase irrigation frequency.`,
          });
        }
        const hotDay = forecast.find((f) => f.high != null && f.high >= 38);
        if (hotDay) {
          found.push({
            id: `heat-${hotDay.date}`,
            type: "heat",
            title: "Heat Stress Expected",
            message: `Forecast high ${hotDay.high}°C on ${hotDay.date}. Pre-irrigate and consider shade mulching.`,
          });
        }
        const coldDay = forecast.find((f) => f.low != null && f.low <= 5);
        if (coldDay) {
          found.push({
            id: `frost-${coldDay.date}`,
            type: "frost",
            title: "Frost Risk",
            message: `Forecast low ${coldDay.low}°C on ${coldDay.date}. Protect sensitive crops.`,
          });
        }
        if (humidity != null && humidity >= 85) {
          found.push({
            id: "humidity-now",
            type: "humidity",
            title: "High Humidity Alert",
            message: `Live humidity ${humidity}% — favorable for fungal spore germination. Scout for blight.`,
          });
        }
        if (wind != null && wind >= 30) {
          found.push({
            id: "wind-now",
            type: "wind",
            title: "Strong Wind Advisory",
            message: `Live wind ${wind} km/h — spray operations not advised; check staking.`,
          });
        }
      }
      setAlerts(found);
      setChecked(true);
    });
    return () => {
      mounted = false;
    };
  }, [userProfile.defaultCoordinates]);

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  if (!checked) return null;
  if (alerts.length === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto space-y-2 mt-4 px-4">
      {alerts.map((alert) => {
        let bgColor = "bg-orange-100";
        let borderColor = "border-orange-300";
        let iconColor = "text-orange-600";
        let Icon = ThermometerSun;

        if (alert.type === "frost") {
          bgColor = "bg-blue-100";
          borderColor = "border-blue-300";
          iconColor = "text-blue-600";
          Icon = Snowflake;
        } else if (alert.type === "humidity") {
          bgColor = "bg-purple-100";
          borderColor = "border-purple-300";
          iconColor = "text-purple-600";
          Icon = Droplets;
        } else if (alert.type === "wind") {
          bgColor = "bg-teal-100";
          borderColor = "border-teal-300";
          iconColor = "text-teal-600";
          Icon = Wind;
        }

        return (
          <div key={alert.id} className={`relative flex items-start gap-3 p-3 rounded-lg border shadow-sm ${bgColor} ${borderColor}`}>
            <Icon className={`mt-0.5 shrink-0 ${iconColor}`} size={20} />
            <div className="flex-1">
              <h4 className={`font-bold text-sm ${iconColor}`}>{alert.title}</h4>
              <p className="text-xs text-gray-700 font-medium leading-relaxed mt-0.5">{alert.message}</p>
              <p className="text-[10px] text-gray-500 mt-1">Source: Open-Meteo (live)</p>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className={`p-1 rounded-full hover:bg-white/50 transition-colors ${iconColor}`}
              aria-label="Dismiss alert"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
