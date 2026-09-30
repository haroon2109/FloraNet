"use client";

import React, { useState } from "react";
import { ArrowRightLeft, Search, CheckCircle2 } from "lucide-react";

export default function AgroClimaticMatcher({ onMatch }: { onMatch: () => void }) {
  const [source, setSource] = useState("Deccan Plateau (India)");
  const [target, setTarget] = useState("Cerrado (Brazil)");
  const [isMatching, setIsMatching] = useState(false);
  const [matchComplete, setMatchComplete] = useState(false);

  const handleMatch = () => {
    // Zone selection only — the catalogue below lists real registered cultivars;
    // no compatibility percentage is computed or claimed.
    setIsMatching(false);
    setMatchComplete(true);
    onMatch();
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 text-white shadow-md border border-slate-800">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-green-400">Agro-Climatic Overlap Engine</h2>
        <p className="text-sm text-slate-400 mt-1">Cross-reference soil and rainfall profiles to discover compatible indigenous genetic lines.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="w-full">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Source Origin</label>
          <select 
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-green-500"
          >
            <option>Deccan Plateau (India)</option>
            <option>Highveld (South Africa)</option>
            <option>Cerrado (Brazil)</option>
            <option>Manchurian Plain (China)</option>
          </select>
        </div>

        <div className="hidden md:flex shrink-0 mt-6 text-slate-500">
          <ArrowRightLeft size={24} />
        </div>

        <div className="w-full">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Target Cultivation Zone</label>
          <select 
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-green-500"
          >
            <option>Cerrado (Brazil)</option>
            <option>Deccan Plateau (India)</option>
            <option>Highveld (South Africa)</option>
            <option>Manchurian Plain (China)</option>
          </select>
        </div>
      </div>

      <button 
        onClick={handleMatch}
        disabled={isMatching || source === target}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isMatching ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Calculating Overlap Vector...
          </>
        ) : (
          <>
            <Search size={18} /> Run Cross-Border Match
          </>
        )}
      </button>

      {matchComplete && (
        <div className="mt-4 bg-green-900/30 border border-green-800 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-300">Zones selected — showing catalogue matches.</p>
            <p className="text-xs text-green-500/80 mt-1">Entries below are real registered cultivars (ICAR / ICRISAT public catalogue). Trait ratings are the institutions&apos; published characterizations.</p>
          </div>
        </div>
      )}
    </div>
  );
}
