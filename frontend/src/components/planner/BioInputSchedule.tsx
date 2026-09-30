// @ts-nocheck
import React from "react";
import { CalendarDays, Droplets, LeafyGreen, Flower2, Info } from "lucide-react";

interface ScheduleItem {
  id: string;
  month: string;
  action: string;
  type: "mycorrhizae" | "compost" | "mulch";
  status: "pending" | "completed";
}

const typeConfig = {
  mycorrhizae: { icon: Flower2, color: "text-purple-600", bg: "bg-purple-100" },
  compost: { icon: Droplets, color: "text-amber-600", bg: "bg-amber-100" },
  mulch: { icon: LeafyGreen, color: "text-green-600", bg: "bg-green-100" }
};

/**
 * Bio-Input Schedule TEMPLATE.
 * This is a generic agronomic planning template (not measured telemetry):
 * it is clearly labeled as a suggested schedule based on the verified
 * ICAR/Embrapa/ARC corpus. Real execution status requires a registered farm
 * (Supabase `farm_plots`) — none is connected, so all items show "planned".
 */
export default function BioInputSchedule() {
  const schedule: ScheduleItem[] = [
    { id: "1", month: "Season Start", action: "TEMPLATE: Apply Mycorrhizal Fungi Inoculant to seeds (ICAR protocol).", type: "mycorrhizae", status: "pending" },
    { id: "2", month: "Mid-Season", action: "TEMPLATE: Drench with aerated Compost Tea (Embrapa bio-input guidance).", type: "compost", status: "pending" },
    { id: "3", month: "Post-Harvest", action: "TEMPLATE: Layer Organic Mulch & Crop Residue (ARC conservation agriculture).", type: "mulch", status: "pending" },
    { id: "4", month: "Next Season Prep", action: "TEMPLATE: Rhizobium inoculation for legume cover crop (Embrapa N-fixation).", type: "mycorrhizae", status: "pending" },
  ];

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mt-6 w-full max-w-md mx-auto">
      <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
        <CalendarDays size={18} className="text-blue-600" />
        Bio-Input Schedule
      </h3>
      <p className="text-[11px] text-gray-500 mb-4 flex items-start gap-1.5">
        <Info size={12} className="mt-0.5 shrink-0 text-blue-400" />
        Generic planning template from the verified ICAR/Embrapa/ARC corpus — connect a registered farm to track real execution status.
      </p>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">

        {schedule.map((item: any) => {
          const Icon = typeConfig[item.type].icon;

          return (
            <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Timeline dot */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${typeConfig[item.type].bg} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                <Icon size={16} className={typeConfig[item.type].color} />
              </div>

              {/* Card */}
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900 text-sm">{item.month}</div>
                  <div className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                    {item.status}
                  </div>
                </div>
                <div className="text-slate-600 text-sm">{item.action}</div>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
