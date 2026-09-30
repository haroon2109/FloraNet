"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Boxes, Database, RefreshCcw } from "lucide-react";
import { DpgModelRecord, fetchDpgModels } from "@/services/farmApi";

/**
 * Read side of the federated disease-model registry (GET /api/v1/dpg/models).
 * Renders whatever the backend actually holds — including an explicit empty
 * state and the reported storage backend, so nothing implies persistence the
 * node does not have.
 */
export default function ModelRegistry() {
  const [models, setModels] = useState<DpgModelRecord[]>([]);
  const [storage, setStorage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreachable, setUnreachable] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const json = await fetchDpgModels();
    if (json && Array.isArray(json.data)) {
      setModels(json.data);
      setStorage(json.storage ?? null);
      setUnreachable(false);
    } else {
      setUnreachable(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-3 h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
        <span className="text-sm text-gray-600 font-medium">Reading federation registry…</span>
      </div>
    );
  }

  if (unreachable) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6 h-full">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-gray-900">Registry unreachable</p>
            <p className="text-xs text-gray-500 mt-1">
              Backend endpoint /api/v1/dpg/models did not respond. Registered models are not
              shown and no sample data is substituted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <Boxes size={18} className="text-purple-600" />
          <h3 className="font-bold text-gray-800">Federated Model Registry</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-bold uppercase tracking-wide">
            {models.length} model{models.length === 1 ? "" : "s"}
          </span>
          <button
            onClick={load}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-500 transition-colors"
            title="Reload registry"
          >
            <RefreshCcw size={14} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-3 flex items-center gap-2 text-[11px] text-gray-500">
        <Database size={12} className="text-gray-400" />
        <span>
          Storage: <span className="font-mono text-gray-700">{storage ?? "unknown"}</span>
        </span>
      </div>

      <div className="p-4 flex-1 overflow-auto">
        {models.length === 0 ? (
          <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center">
            <Boxes size={26} className="text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-700">No disease models registered yet</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Submit the federation form to register a localized model. It will appear here — this
              list is read live from the backend registry, never pre-populated.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {models.map((m, i) => (
              <li
                key={`${m.registry_id ?? "row"}-${i}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{m.model_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.institution}</p>
                  </div>
                  <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    v{m.model_version}
                  </span>
                </div>

                <p className="text-xs text-gray-700 mt-2">
                  Target pathogen: <span className="font-semibold">{m.target_pathogen}</span>
                </p>

                {m.parameters_required.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.parameters_required.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-100 px-1.5 py-0.5 rounded"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-gray-400">
                  {m.registry_id && <span className="font-mono">id: {m.registry_id}</span>}
                  {m.received_at && <span>received: {m.received_at}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
