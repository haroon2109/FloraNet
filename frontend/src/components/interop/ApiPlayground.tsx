"use client";

import React from "react";
import { Terminal } from "lucide-react";
import { getApiBaseUrl } from "@/lib/apiConfig";

export default function ApiPlayground() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px] overflow-hidden">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-blue-600" />
          <h3 className="font-bold text-gray-800">OpenAPI / DPG Endpoints</h3>
        </div>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold uppercase tracking-wide">
          Live Connection
        </span>
      </div>

      {/* We embed the native FastAPI Swagger UI for the ultimate interactive playground */}
      <div className="flex-1 w-full bg-white relative">
        <iframe
          src={`${getApiBaseUrl()}/docs`}
          title="FloraNet API Swagger Playground"
          className="w-full h-full border-none absolute inset-0"
        />
      </div>
    </div>
  );
}
