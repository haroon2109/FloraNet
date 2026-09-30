"use client";

import React, { useState, useEffect } from "react";
import { Code, RefreshCcw } from "lucide-react";
import { getApiBaseUrl } from "@/lib/apiConfig";

export default function JsonLdExplorer() {
  const [schemaType, setSchemaType] = useState<
    "schema" | "outbreaks" | "soc-tracker" | "models"
  >("schema");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSchema = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/v1/dpg/${schemaType}`);
      if (response.ok) {
        const jsonLd = await response.json();
        setData(jsonLd);
      }
    } catch (error) {
      console.error("Failed to fetch JSON-LD schema", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, [schemaType]);

  return (
    <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-700 h-full flex flex-col overflow-hidden text-slate-300">
      <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Code size={18} className="text-blue-400" />
          <h3 className="font-bold text-white">JSON-LD Schema Explorer</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            className="bg-slate-700 text-sm text-white border border-slate-600 rounded px-2 py-1 outline-none focus:border-blue-500"
            value={schemaType}
            onChange={(e) => setSchemaType(e.target.value as any)}
          >
            <option value="schema">AgriN Schema Manifest</option>
            <option value="outbreaks">Outbreaks Schema</option>
            <option value="soc-tracker">SOC Tracker Schema</option>
            <option value="models">Disease Model Registry</option>
          </select>
          
          <button 
            onClick={() => {
              if (data) navigator.clipboard.writeText(JSON.stringify(data, null, 2));
              alert("Schema copied to clipboard!");
            }}
            className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors text-white font-medium"
          >
            Copy
          </button>
          
          <button 
            onClick={() => {
              if (!data) return;
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/ld+json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${schemaType}_schema.jsonld`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded transition-colors text-white font-medium"
          >
            Download JSON
          </button>

          <button 
            onClick={fetchSchema}
            disabled={loading}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white ml-1"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-auto bg-[#0d1117] font-mono text-xs sm:text-sm">
        {loading ? (
          <div className="flex items-center gap-2 text-slate-500">
            <RefreshCcw size={14} className="animate-spin" /> Fetching latest schema...
          </div>
        ) : (
          <pre className="text-green-400 whitespace-pre-wrap break-all">
            {data ? JSON.stringify(data, null, 2) : "// No data available"}
          </pre>
        )}
      </div>
    </div>
  );
}
