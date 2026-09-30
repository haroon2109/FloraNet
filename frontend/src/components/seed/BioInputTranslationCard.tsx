"use client";

import React from "react";
import { FlaskConical, Globe2, Languages } from "lucide-react";

export interface BioInputValidation {
  id: string;
  type: string;
  name: string;
  sourceInstitution: string;
  sourceCountry: string;
  targetTranslation: string;
  efficacy?: string;
}

export default function BioInputTranslationCard({ data }: { data: BioInputValidation }) {
  return (
    <div className="bg-white border border-indigo-100 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <FlaskConical size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-indigo-900">{data.name}</h3>
            <p className="text-xs text-indigo-500 font-bold uppercase">{data.type}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-4 border-t border-gray-100 pt-3">
        <div>
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1">
            <Globe2 size={12} /> Validated By
          </p>
          <p className="text-xs font-semibold text-gray-800">
            {data.sourceInstitution} ({data.sourceCountry})
          </p>
          {data.efficacy ? (
            <p className="text-[10px] text-green-600 font-bold mt-0.5">{data.efficacy} Success Rate</p>
          ) : null}
        </div>

        <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-100 relative">
          <div className="absolute -right-1 -top-2 bg-white rounded-full p-0.5 text-indigo-400 border border-indigo-100">
            <Languages size={12} />
          </div>
          <p className="text-[10px] text-indigo-500 uppercase font-bold mb-1">Local Translation</p>
          <p className="text-xs font-medium text-indigo-900 italic">
            "{data.targetTranslation}"
          </p>
        </div>
      </div>
    </div>
  );
}
