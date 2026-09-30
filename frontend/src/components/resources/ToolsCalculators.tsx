import React from 'react';
import { ArrowRight, Calculator } from 'lucide-react';
import Link from 'next/link';

const toolsCalculators: any = [];


const getToolIllustration = (type: string) => {
  switch (type) {
    case 'fertilizer':
      return (
        <div className="w-10 h-10 rounded-full bg-[#EAF5EC] flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#168A45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
      );
    case 'seed':
      return (
        <div className="w-10 h-10 rounded-full bg-[#FFF7E5] flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5A900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-8"/><path d="M12 14c-2-2-4-1-6 2"/><path d="M12 10c-2-2-5-1-7 2"/><path d="M12 6c-3-2-6-1-8 2"/><path d="M12 14c2-2 4-1 6 2"/><path d="M12 10c2-2 5-1 7 2"/><path d="M12 6c3-2 6-1 8 2"/></svg>
        </div>
      );
    case 'profit':
      return (
        <div className="w-10 h-10 rounded-full bg-[#F0F9FF] flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4EA7DF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
      );
    case 'water':
      return (
        <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E5483F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <Calculator size={20} className="text-gray-500" />
        </div>
      );
  }
}

export default function ToolsCalculators() {
  return (
    <div className="mb-8 mx-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold text-[#102A20]">Tools & Calculators</h2>
        <button className="text-[12px] font-semibold text-[#168A45] flex items-center gap-1 hover:text-[#102A20] transition-colors">
          View all tools <ArrowRight size={14} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {toolsCalculators.map((tool: any) => (
          <div key={tool.id} className="flex flex-col bg-white border border-[#E1E7E3] rounded-xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-start gap-3 mb-3">
              {getToolIllustration(tool.illustration)}
              <div>
                <h3 className="text-[13px] font-semibold text-[#102A20] mb-1">{tool.title}</h3>
                <p className="text-[11px] text-[#52645D] leading-relaxed line-clamp-2">{tool.description}</p>
              </div>
            </div>
            
            <Link 
              href={tool.link} 
              className="mt-auto pt-3 border-t border-[#E1E7E3]/60 text-[12px] font-semibold text-[#168A45] flex items-center justify-between group hover:text-[#127038]"
            >
              Use Tool
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
