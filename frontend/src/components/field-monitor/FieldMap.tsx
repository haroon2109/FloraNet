import React from 'react';
import { ChevronDown, Plus, Minus, Layers, Info } from 'lucide-react';

const mapFields: any = [];


const getFieldColor = (ndvi: number | null) => {
  if (ndvi === null) return '#D4D4D8';
  if (ndvi >= 0.7) return 'rgba(22, 138, 69, 0.8)';
  if (ndvi >= 0.5) return 'rgba(245, 169, 0, 0.8)';
  return 'rgba(229, 72, 63, 0.8)';
};

export default function FieldMap() {
  return (
    <div className="bg-white border border-[#E1E7E3] rounded-xl shadow-[0_2px_12px_rgba(20,60,40,0.04)] overflow-hidden flex flex-col h-[400px]">
      <div className="flex items-center justify-between p-4 border-b border-[#E1E7E3]">
        <h2 className="text-[15px] font-semibold text-[#102A20]">Field Map Overview</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-between gap-2 bg-white border border-[#E1E7E3] px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#102A20] shadow-sm">
            All Fields <ChevronDown size={14} className="text-[#52645D]" />
          </button>
          <button className="flex items-center justify-between gap-2 bg-white border border-[#E1E7E3] px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#102A20] shadow-sm">
            NDVI View <ChevronDown size={14} className="text-[#52645D]" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative bg-[#e0d6c8] overflow-hidden">
        {/* Placeholder Map Background - Using SVG for perfect control */}
        <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d0c6b8" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Roads / Infrastructure lines */}
          <path d="M 0 50 L 400 150 M 200 0 L 150 300" stroke="#d0c6b8" strokeWidth="6" fill="none" />
          
          {/* SVG Polygons for Fields */}
          <g transform="translate(40, 20)">
            {mapFields.map((field: any) => (
              <g key={field.id} className="group cursor-pointer">
                <path 
                  d={field.path} 
                  fill={getFieldColor(field.ndvi)} 
                  stroke="#FFFFFF" 
                  strokeWidth="1.5"
                  className="transition-opacity hover:opacity-90"
                />
                {/* Find center of path for text roughly based on bounding box visually */}
                {field.id === 'f1' && (
                  <text x="65" y="45" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                    <tspan x="65" dy="0">{field.name}</tspan>
                    <tspan x="65" dy="14" fontSize="10" fontWeight="normal">{field.ndvi}</tspan>
                  </text>
                )}
                {field.id === 'f2' && (
                  <text x="80" y="135" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                    <tspan x="80" dy="0">{field.name}</tspan>
                    <tspan x="80" dy="14" fontSize="10" fontWeight="normal">{field.ndvi}</tspan>
                  </text>
                )}
                {field.id === 'f3' && (
                  <text x="160" y="45" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                    <tspan x="160" dy="0">{field.name}</tspan>
                    <tspan x="160" dy="14" fontSize="10" fontWeight="normal">{field.ndvi}</tspan>
                  </text>
                )}
                {field.id === 'f4' && (
                  <text x="180" y="135" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                    <tspan x="180" dy="0">{field.name}</tspan>
                    <tspan x="180" dy="14" fontSize="10" fontWeight="normal">{field.ndvi}</tspan>
                  </text>
                )}
                {field.id === 'f5' && (
                  <text x="260" y="135" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                    <tspan x="260" dy="0">{field.name}</tspan>
                    <tspan x="260" dy="14" fontSize="10" fontWeight="normal">{field.ndvi}</tspan>
                  </text>
                )}
                {field.id === 'f6' && (
                  <text x="200" y="225" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                    <tspan x="200" dy="0">{field.name}</tspan>
                    <tspan x="200" dy="14" fontSize="10" fontWeight="normal">{field.ndvi}</tspan>
                  </text>
                )}
              </g>
            ))}
          </g>
        </svg>

        {/* Map Controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-white rounded-md shadow-md border border-gray-200 overflow-hidden flex flex-col">
            <button className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-50 border-b border-gray-200">
              <Plus size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-50">
              <Minus size={16} />
            </button>
          </div>
          <button className="w-8 h-8 bg-white rounded-md shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50">
            <Layers size={16} />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md border border-gray-200 p-2.5 w-[140px]">
          <div className="text-[10px] font-semibold text-[#102A20] mb-1.5">NDVI Scale</div>
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#E5483F] via-[#F5A900] to-[#168A45] mb-1"></div>
          <div className="flex justify-between text-[10px] text-[#52645D]">
            <span>0</span>
            <span>1</span>
          </div>
        </div>
      </div>
      
      <div className="p-3 border-t border-[#E1E7E3] bg-white flex items-center justify-between">
        <p className="text-[11px] text-[#52645D]">
          NDVI (Normalized Difference Vegetation Index) indicates crop health and vigor.
        </p>
        <Info size={14} className="text-[#A0AAB2]" />
      </div>
    </div>
  );
}
