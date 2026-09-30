import React from 'react';
import { Sprout, Building2, TreePine } from 'lucide-react';

interface FarmTypeSelectorProps {
  value: string;
  onChange: (value: "open-field" | "greenhouse" | "orchard") => void;
}

export default function FarmTypeSelector({ value, onChange }: FarmTypeSelectorProps) {
  const types = [
    { 
      id: 'open-field', 
      label: 'Open Field', 
      description: 'Crops grown in\nopen fields',
      icon: Sprout 
    },
    { 
      id: 'greenhouse', 
      label: 'Greenhouse', 
      description: 'Controlled\nenvironment',
      icon: Building2 
    },
    { 
      id: 'orchard', 
      label: 'Orchard', 
      description: 'Trees and\nperennial crops',
      icon: TreePine 
    }
  ];

  return (
    <div className="space-y-[12px]">
      <label className="block text-[14px] font-medium text-[#102A20]">Farm Type</label>
      
      <div className="grid grid-cols-3 gap-[16px]">
        {types.map(type => {
          const Icon = type.icon;
          const isSelected = value === type.id;
          
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange(type.id as "open-field" | "greenhouse" | "orchard")}
              className={`h-[120px] flex flex-col items-center justify-center text-center p-3 rounded-[10px] border transition-all ${
                isSelected 
                  ? 'border-[#075C32] bg-[#F9FCF9]' 
                  : 'border-[#DDE6DF] bg-white hover:border-[#b4c9bc]'
              }`}
            >
              <Icon 
                size={26} 
                strokeWidth={1.8} 
                className={`mb-2 ${isSelected ? 'text-[#075C32]' : 'text-[#5B6A63]'}`} 
              />
              <span className={`text-[14px] font-semibold mb-1 leading-tight ${isSelected ? 'text-[#102A20]' : 'text-[#102A20]'}`}>
                {type.label}
              </span>
              <span className="text-[12px] text-[#5B6A63] whitespace-pre-line leading-tight">
                {type.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
