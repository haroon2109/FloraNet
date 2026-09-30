"use client";

import React, { useState } from "react";
import { Network, Send, CheckCircle2 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/apiConfig";

export default function ModelFederationNode() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{message: string, registry_id: string} | null>(null);

  // Fields mirror POST /api/v1/dpg/ingest (DiseaseModelIngest). No canned payloads:
  // the registry receipt comes back from the backend.
  const [formData, setFormData] = useState({
    model_name: "",
    institution: "",
    target_pathogen: "",
    model_version: "1.0",
    parameters: "temp, humidity, leaf_wetness"
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/v1/dpg/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model_name: formData.model_name,
          institution: formData.institution,
          target_pathogen: formData.target_pathogen,
          model_version: formData.model_version,
          parameters_required: formData.parameters.split(",").map((s) => s.trim()).filter(Boolean),
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data);
      } else {
        let detail = "";
        try {
          const err = await response.json();
          detail = err?.detail ? ` — ${JSON.stringify(err.detail)}` : "";
        } catch { /* ignore parse errors */ }
        setError(`Ingestion rejected (HTTP ${response.status}${detail}). Nothing was registered.`);
      }
    } catch (error) {
      setError("Ingestion unreachable — backend offline. Nothing was registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
        <Network size={18} className="text-purple-600" />
        <h3 className="font-bold text-gray-800">Model Federation Node</h3>
      </div>
      
      <div className="p-5 flex-1">
        <p className="text-sm text-gray-500 mb-6">
          Calibrate and ingest localized pest models from cross-border institutions against global datasets.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Model Name</label>
            <input 
              type="text" 
              value={formData.model_name}
              onChange={(e) => setFormData({...formData, model_name: e.target.value})}
              className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 outline-none" 
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Institution / Origin</label>
            <input 
              type="text" 
              value={formData.institution}
              onChange={(e) => setFormData({...formData, institution: e.target.value})}
              className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 outline-none" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Target Pathogen</label>
            <input
              type="text"
              placeholder="e.g. Puccinia striiformis"
              value={formData.target_pathogen}
              onChange={(e) => setFormData({...formData, target_pathogen: e.target.value})}
              className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Model Version</label>
            <input
              type="text"
              value={formData.model_version}
              onChange={(e) => setFormData({...formData, model_version: e.target.value})}
              className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Required Parameters (comma-separated)</label>
            <input
              type="text"
              value={formData.parameters}
              onChange={(e) => setFormData({...formData, parameters: e.target.value})}
              className="w-full text-sm font-mono border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Federating Model...</span>
            ) : (
              <>
                <Send size={16} /> Broadcast Calibration
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3 flex items-start gap-3">
            <CheckCircle2 size={20} className="text-green-600 mt-0.5" />
            <div>
              <p className="text-sm text-green-800 font-medium">{success.message}</p>
              <p className="text-xs text-green-600 mt-1">Registry ID: <span className="font-mono bg-green-100 px-1 rounded">{success.registry_id}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
