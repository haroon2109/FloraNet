import React from 'react';
import { Check } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
}

export default function OnboardingProgress({ currentStep = 1 }: OnboardingProgressProps) {
  const steps = [
    { id: 1, label: 'Your Details' },
    { id: 2, label: 'Farm Details' },
    { id: 3, label: 'Preferences' },
    { id: 4, label: 'Review' }
  ];

  return (
    <div className="w-full flex items-center justify-between mt-[48px] mb-[42px] max-w-[440px]">
      {steps.map((step: any, index: any) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        const isPending = currentStep < step.id;

        return (
          <React.Fragment key={step.id}>
            {/* Step Node */}
            <div className="flex flex-col items-center gap-2 relative z-10 w-[72px]">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors ${
                  isCompleted 
                    ? 'bg-white border border-[#075C32] text-[#075C32]' 
                    : isActive
                      ? 'bg-[#075C32] text-white border border-[#075C32]'
                      : 'bg-white border border-[#DDE6DF] text-[#5B6A63]'
                }`}
              >
                {isCompleted ? <Check size={16} strokeWidth={2.5} className="text-[#075C32]" /> : step.id}
              </div>
              <span 
                className={`text-[12px] font-semibold whitespace-nowrap text-center ${
                  isActive || isCompleted ? 'text-[#075C32]' : 'text-[#5B6A63] font-medium'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting Line (except after last step) */}
            {index < steps.length - 1 && (
              <div 
                className={`flex-1 h-[2px] mx-2 -mt-[20px] z-0 transition-colors ${
                  currentStep > step.id ? 'bg-[#075C32]' : 'bg-[#DDE6DF]'
                }`} 
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
