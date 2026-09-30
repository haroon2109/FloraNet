import React from 'react';
import { Tractor, Leaf, Building2, MoreHorizontal } from 'lucide-react';

interface RoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const roles = [
    { id: 'farmer', label: 'Farmer', icon: Tractor },
    { id: 'agronomist', label: 'Agronomist', icon: Leaf },
    { id: 'agribusiness', label: 'Agribusiness', icon: Building2 },
    { id: 'other', label: 'Other', icon: MoreHorizontal }
  ];

  return (
    <div className="space-y-[12px] pt-2">
      <div className="flex items-baseline gap-2">
        <label className="block text-[14px] font-medium text-[#102A20]">What describes you best?</label>
        <span className="text-[12px] text-[#5B6A63]">(Select one)</span>
      </div>
      
      <div className="grid grid-cols-4 gap-[12px]">
        {roles.map(role => {
          const Icon = role.icon;
          const isSelected = value === role.id;
          
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onChange(role.id)}
              className={`h-[96px] flex flex-col items-center justify-center gap-3 rounded-[10px] border transition-all ${
                isSelected 
                  ? 'border-[#075C32] bg-[#F5F9F5]' 
                  : 'border-[#DDE6DF] bg-white hover:border-[#b4c9bc]'
              }`}
            >
              <Icon 
                size={24} 
                strokeWidth={1.8} 
                className={isSelected ? 'text-[#075C32]' : 'text-[#5B6A63]'} 
              />
              <span className={`text-[13px] font-medium ${isSelected ? 'text-[#075C32]' : 'text-[#5B6A63]'}`}>
                {role.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
