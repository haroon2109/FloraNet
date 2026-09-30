"use client";

import React, { useState } from 'react';
import { Leaf, ScanLine, Mic, FileText, Sparkles } from 'lucide-react';
import PlantDoctorModal from './PlantDoctorModal';
import { useToast } from '@/context/toastContext';
import { createDictation, isSpeechRecognitionSupported } from '@/lib/speech';

interface UploadActionsProps {
  onActionClick: (title: string) => void;
  /** BCP-47 locale for dictation, resolved from the farmer's profile. */
  speechLocale?: string;
}

export default function UploadActions({ onActionClick, speechLocale }: UploadActionsProps) {
  const [isDoctorOpen, setIsDoctorOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { showToast } = useToast();

  const handleVoiceInput = () => {
    if (!isSpeechRecognitionSupported()) {
      showToast("Web Speech API not supported in this browser. Please type your query.", "warning");
      onActionClick("How do I control fall armyworm organically in maize?");
      return;
    }

    // Shared locale-aware dictation builder — honours the farmer's profile
    // language instead of silently defaulting to en-US.
    const recognition = createDictation(
      speechLocale || 'en-US',
      {
        onResult: (transcript, isFinal) => {
          if (!isFinal) return;
          setIsListening(false);
          showToast(`Heard: "${transcript}"`, "success");
          onActionClick(transcript);
        },
        onEnd: () => setIsListening(false),
        onError: () => {
          setIsListening(false);
          showToast("Voice capture completed or timed out", "info");
        },
      },
      { interimResults: false },
    );
    if (!recognition) return;

    recognition.onstart = () => {
      setIsListening(true);
      showToast("🎙️ Listening... Speak your crop question now", "info");
    };

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      onActionClick("What is the optimal nitrogen application for winter wheat?");
    }
  };

  return (
    <>
      <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">
        
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[16px] font-bold text-[#102A20]">AI Multimodal Agronomy Diagnostic Tools</h3>
            <p className="text-[12px] text-[#52645D] mt-0.5">
              Upload leaf photos, run disease diagnostics or ask questions via voice
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF5EC] text-[#075C32] border border-[#C4E7D0]">
            <Sparkles size={12} />
            <span>ICAR & Embrapa AI</span>
          </span>
        </div>

        {/* 4 Cards 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Card 1: AI Plant Doctor */}
          <button
            type="button"
            onClick={() => setIsDoctorOpen(true)}
            className="p-3.5 bg-[#FAFCFA] border border-[#F0F4F1] hover:border-[#075C32] hover:bg-[#F5F9F6] rounded-xl text-center flex flex-col items-center justify-center transition-all group cursor-pointer shadow-2xs"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#EAF5EC] text-[#075C32] flex items-center justify-center mb-2 shrink-0 border border-[#C4E7D0] group-hover:scale-105 transition-transform">
              <Leaf size={18} strokeWidth={2.2} />
            </div>
            <h4 className="text-[13px] font-bold text-[#102A20] group-hover:text-[#075C32] transition-colors leading-tight">
              AI Plant Doctor
            </h4>
            <p className="text-[11px] text-[#52645D] mt-0.5 leading-snug">
              Scan leaf diseases & get bio-recipes
            </p>
          </button>

          {/* Card 2: Field Camera Scanner */}
          <button
            type="button"
            onClick={() => setIsDoctorOpen(true)}
            className="p-3.5 bg-[#FAFCFA] border border-[#F0F4F1] hover:border-[#075C32] hover:bg-[#F5F9F6] rounded-xl text-center flex flex-col items-center justify-center transition-all group cursor-pointer shadow-2xs"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#EAF5EC] text-[#075C32] flex items-center justify-center mb-2 shrink-0 border border-[#C4E7D0] group-hover:scale-105 transition-transform">
              <ScanLine size={18} strokeWidth={2.2} />
            </div>
            <h4 className="text-[13px] font-bold text-[#102A20] group-hover:text-[#075C32] transition-colors leading-tight">
              Canopy Diagnostic
            </h4>
            <p className="text-[11px] text-[#52645D] mt-0.5 leading-snug">
              Analyze cellular deficiency
            </p>
          </button>

          {/* Card 3: Multilingual Voice Assistant */}
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-3.5 border rounded-xl text-center flex flex-col items-center justify-center transition-all group cursor-pointer shadow-2xs ${
              isListening 
                ? 'bg-red-50 border-red-300 text-red-700 animate-pulse' 
                : 'bg-[#FAFCFA] border-[#F0F4F1] hover:border-[#075C32] hover:bg-[#F5F9F6]'
            }`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 shrink-0 border transition-transform ${
              isListening 
                ? 'bg-red-100 text-red-600 border-red-200 scale-110' 
                : 'bg-[#EAF5EC] text-[#075C32] border-[#C4E7D0] group-hover:scale-105'
            }`}>
              <Mic size={18} strokeWidth={2.2} />
            </div>
            <h4 className="text-[13px] font-bold text-[#102A20] group-hover:text-[#075C32] transition-colors leading-tight">
              {isListening ? 'Listening...' : 'Voice Agronomist'}
            </h4>
            <p className="text-[11px] text-[#52645D] mt-0.5 leading-snug">
              Ask in Hindi, Portuguese, English
            </p>
          </button>

          {/* Card 4: Soil Test Report Scanner */}
          <button
            type="button"
            onClick={() => onActionClick("Analyze my soil test report: N=18ppm, P=12ppm, K=180ppm, pH=6.8 for maize crop")}
            className="p-3.5 bg-[#FAFCFA] border border-[#F0F4F1] hover:border-[#075C32] hover:bg-[#F5F9F6] rounded-xl text-center flex flex-col items-center justify-center transition-all group cursor-pointer shadow-2xs"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#EAF5EC] text-[#075C32] flex items-center justify-center mb-2 shrink-0 border border-[#C4E7D0] group-hover:scale-105 transition-transform">
              <FileText size={18} strokeWidth={2.2} />
            </div>
            <h4 className="text-[13px] font-bold text-[#102A20] group-hover:text-[#075C32] transition-colors leading-tight">
              Soil Test Decoder
            </h4>
            <p className="text-[11px] text-[#52645D] mt-0.5 leading-snug">
              Decode NPK & micronutrients
            </p>
          </button>

        </div>

      </div>

      {/* Mount Plant Doctor Modal */}
      <PlantDoctorModal 
        isOpen={isDoctorOpen} 
        onClose={() => setIsDoctorOpen(false)} 
      />
    </>
  );
}
