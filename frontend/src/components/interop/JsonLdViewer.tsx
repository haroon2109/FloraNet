"use client";

import React, { useState } from "react";
import { Download, Copy, CheckCircle2, FileJson, DatabaseZap, Network } from "lucide-react";

interface JsonLdViewerProps {
  payload: object;
  title: string;
  description: string;
}

export default function JsonLdViewer({ payload, title, description }: JsonLdViewerProps) {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/ld+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "_")}.jsonld`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-white border border-[#E8EFEA] rounded-[24px] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E8EFEA] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F8FAF9]">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <FileJson className="w-5 h-5 text-flora-500" strokeWidth={2} />
            <h3 className="font-bold text-[18px] text-[#111827]">{title}</h3>
          </div>
          <p className="text-[14px] text-[#4B5563] font-medium">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D1D5DB] rounded-[10px] text-[14px] font-semibold text-[#374151] hover:bg-[#F3F4F6] transition-colors"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-flora-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-flora-500 hover:bg-flora-600 text-white rounded-[10px] text-[14px] font-semibold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download .jsonld</span>
          </button>
        </div>
      </div>

      {/* Code Viewer (Syntax Highlighting via simple CSS rules) */}
      <div className="p-6 bg-[#0D1117] overflow-x-auto">
        <pre className="text-[14px] leading-relaxed font-mono text-[#C9D1D9]">
          <code dangerouslySetInnerHTML={{
            __html: jsonString
              .replace(/"(.*?)":/g, '<span class="text-[#79C0FF]">"$1"</span>:') // Keys
              .replace(/: "(.*?)"/g, ': <span class="text-[#A5D6FF]">"$1"</span>') // String Values
              .replace(/: (\d+\.?\d*)/g, ': <span class="text-[#79C0FF]">$1</span>') // Number Values
              .replace(/: (true|false)/g, ': <span class="text-[#FF7B72]">$1</span>') // Booleans
          }} />
        </pre>
      </div>
    </div>
  );
}
