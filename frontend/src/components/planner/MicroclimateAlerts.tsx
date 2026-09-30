import React from "react";
import { CloudLightning, AlertCircle, ThermometerSun } from "lucide-react";

export interface Alert {
  alert_type: string;
  severity: string;
  actionable_prep_steps: string[];
}

interface AlertsProps {
  alerts: Alert[];
}

export default function MicroclimateAlerts({ alerts }: AlertsProps) {
  if (!alerts || alerts.length === 0) return null;

  const getSeverityStyles = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high": return "bg-red-50 border-red-200 text-red-800";
      case "medium": return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "low": return "bg-blue-50 border-blue-200 text-blue-800";
      default: return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getIcon = (type: string) => {
    if (type.toLowerCase().includes("heat") || type.toLowerCase().includes("drought")) {
      return <ThermometerSun size={18} />;
    }
    return <CloudLightning size={18} />;
  };

  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-bold text-gray-800 flex items-center gap-2 px-1">
        <AlertCircle size={18} className="text-red-500" />
        Hyper-Local Microclimate Alerts
      </h3>
      
      <div className="space-y-3">
        {alerts.map((alert: any, index: any) => (
          <div key={index} className={`p-4 rounded-xl border ${getSeverityStyles(alert.severity)} shadow-sm`}>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold flex items-center gap-2">
                {getIcon(alert.alert_type)} {alert.alert_type}
              </h4>
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-white bg-opacity-50">
                {alert.severity} Risk
              </span>
            </div>
            
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase opacity-80 mb-1">Actionable Prep Steps:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {alert.actionable_prep_steps.map((step: any, idx: any) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
