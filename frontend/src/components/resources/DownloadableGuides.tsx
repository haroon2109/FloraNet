import React from 'react';
import { ArrowRight, Download, FileText } from 'lucide-react';

const downloadableGuides: any = [];


export default function DownloadableGuides() {
  return (
    <div className="bg-white border border-[#E1E7E3] rounded-xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-[#102A20]">Downloadable Guides</h2>
        <button className="text-[11px] font-medium text-[#168A45] flex items-center gap-1 hover:text-[#102A20] transition-colors">
          View all <ArrowRight size={12} />
        </button>
      </div>
      
      <div className="flex flex-col gap-3">
        {downloadableGuides.map((guide: any) => (
          <div key={guide.id} className="group flex items-center justify-between bg-[#F7F9F7] border border-[#E1E7E3]/60 rounded-lg p-3 hover:border-[#168A45]/40 transition-colors">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded bg-white flex items-center justify-center shrink-0 border border-[#E1E7E3] shadow-sm">
                 <FileText size={16} className="text-[#E5483F]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-semibold text-[#102A20] truncate">{guide.title}</span>
                <span className="text-[10px] text-[#52645D] font-medium">{guide.format} • {guide.size}</span>
              </div>
            </div>
            
            <button 
              className="w-8 h-8 rounded-full bg-white border border-[#E1E7E3] flex items-center justify-center text-[#52645D] hover:bg-[#168A45] hover:text-white hover:border-[#168A45] transition-colors shrink-0 shadow-sm"
              aria-label={`Download ${guide.title}`}
            >
              <Download size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
