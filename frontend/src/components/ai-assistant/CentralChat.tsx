"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Sparkles, 
  Paperclip, 
  Mic, 
  MicOff, 
  Send, 
  CheckCircle2, 
  Sliders, 
  Leaf, 
  Sun, 
  Droplets, 
  FileText, 
  ScanLine, 
  Volume2, 
  VolumeX, 
  X, 
  ImageIcon 
} from 'lucide-react';
import { Message } from '@/types/ai';
import { useToast } from '@/context/toastContext';
import WhatsAppPrescriptionShare from '@/components/ui/WhatsAppPrescriptionShare';
import { createDictation, speakText, stopSpeaking } from '@/lib/speech';

export type AgronomyPersona = 'precision' | 'regenerative' | 'sage';

interface CentralChatProps {
  messages?: Message[];
  isTyping?: boolean;
  onSendMessage?: (prompt: string, persona?: AgronomyPersona) => void;
  /** BCP-47 locale for dictation and read-aloud (e.g. `ta`, `pt-BR`). */
  speechLocale?: string;
  /** Honest warning when the local speech model lacks the farmer's language. */
  speechNotice?: string | null;
}

const DICTATION_ERRORS: Record<string, string> = {
  'not-allowed': 'Microphone permission was denied — allow mic access to dictate.',
  'no-speech': 'No speech detected — please try again.',
  network: 'Speech recognition needs a network connection in this browser.',
  'language-not-supported': 'This browser has no recognition model for your language.',
};

export default function CentralChat({
  messages = [],
  isTyping = false,
  onSendMessage,
  speechLocale = 'en-US',
  speechNotice = null,
}: CentralChatProps) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [activePersona, setActivePersona] = useState<AgronomyPersona>('precision');
  const [isRecording, setIsRecording] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedImageName, setAttachedImageName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { showToast } = useToast();

  // Voice dictation, rebuilt whenever the locale changes — `lang` is fixed
  // once a SpeechRecognition instance is constructed, so reusing the old one
  // would keep transcribing English for a Tamil-speaking farmer.
  useEffect(() => {
    const recognition = createDictation(
      speechLocale,
      {
        onResult: (transcript) => setInputPrompt(transcript),
        onEnd: () => setIsRecording(false),
        onError: (code) => {
          setIsRecording(false);
          showToast(DICTATION_ERRORS[code] || 'Voice dictation paused', 'info');
        },
      },
      { interimResults: true },
    );

    recognitionRef.current = recognition;
    setIsRecording(false);

    return () => {
      try {
        recognition?.stop();
      } catch {
        /* already stopped */
      }
      recognitionRef.current = null;
    };
  }, [speechLocale, showToast]);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      showToast('Speech recognition not supported in this browser', 'warning');
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* already stopped */
      }
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        showToast(`Listening in ${speechLocale}… speak now`, 'info');
      } catch (err) {
        console.warn('Speech recognition start error:', err);
      }
    }
  };

  /** Read an assistant reply aloud in the farmer's own language. */
  const handleSpeak = (msg: Message) => {
    if (speakingId === msg.id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }

    stopSpeaking();
    setSpeakingId(msg.id);
    const started = speakText(msg.content, speechLocale, {
      onEnd: () => setSpeakingId(null),
      onFallback: (used) =>
        showToast(`No ${speechLocale} voice installed — reading in ${used}`, 'info'),
    });

    if (!started) {
      setSpeakingId(null);
      showToast('Read-aloud is not supported on this device.', 'warning');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedImageName(file.name);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setAttachedImage(loadEvent.target?.result as string);
        showToast(`Attached photo: ${file.name}`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachedImage = () => {
    setAttachedImage(null);
    setAttachedImageName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() && !attachedImage) return;

    let finalPrompt = inputPrompt.trim();
    if (attachedImageName) {
      finalPrompt = `[Photo Diagnostic: ${attachedImageName}] ${finalPrompt || 'Please diagnose crop disease or deficiency in this leaf sample.'}`;
    }

    onSendMessage?.(finalPrompt, activePersona);
    setInputPrompt('');
    removeAttachedImage();
  };

  const handleFollowUpClick = (action: string) => {
    onSendMessage?.(action, activePersona);
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-6 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6 flex flex-col justify-between min-h-[580px]">
      
      {/* Persona Selector Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-[#F0F4F1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#168A45] animate-pulse" />
            <h4 className="text-[13.5px] font-bold text-[#102A20]">
              Agronomy Advisory Engine
            </h4>
            <span
              lang={speechLocale}
              title={`Dictation & read-aloud locale: ${speechLocale}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5EC] text-[#075C32] border border-[#C4E7D0]"
            >
              {speechLocale}
            </span>
          </div>
          <p className="text-[11.5px] text-[#607469] mt-0.5">
            {activePersona === 'precision' && 'Focuses on quantitative yield maximization, NPK timing & telemetry'}
            {activePersona === 'regenerative' && 'Focuses on organic inputs, Jeevamrutha, and long-term soil carbon'}
            {activePersona === 'sage' && 'Focuses on seasonal crop rotations, bio-barriers & agro-climatic wisdom'}
          </p>
        </div>

        {/* 3-Way Minimal Pill Selector */}
        <div className="flex items-center gap-1 bg-[#F5F8F6] p-1 rounded-xl border border-[#E2EBE5]">
          <button
            type="button"
            onClick={() => setActivePersona('precision')}
            className={`px-2.5 py-1 text-[11.5px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activePersona === 'precision'
                ? 'bg-[#075C32] text-white shadow-xs'
                : 'text-[#50645B] hover:text-[#102A20] hover:bg-white/60'
            }`}
          >
            <Sliders size={12} />
            <span>Precision Agronomist</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePersona('regenerative')}
            className={`px-2.5 py-1 text-[11.5px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activePersona === 'regenerative'
                ? 'bg-[#168A45] text-white shadow-xs'
                : 'text-[#50645B] hover:text-[#102A20] hover:bg-white/60'
            }`}
          >
            <Leaf size={12} />
            <span>Regenerative Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePersona('sage')}
            className={`px-2.5 py-1 text-[11.5px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activePersona === 'sage'
                ? 'bg-[#854D0E] text-white shadow-xs'
                : 'text-[#50645B] hover:text-[#102A20] hover:bg-white/60'
            }`}
          >
            <Sun size={12} />
            <span>Traditional Sage</span>
          </button>
        </div>
      </div>

      {/* Speech capability — never silent when the local model lacks a language */}
      {speechNotice && (
        <div
          role="status"
          className="mb-4 flex items-start gap-2 rounded-xl border border-[#F3E3C3] bg-[#FDF7EC] px-3.5 py-2.5"
        >
          <Mic size={14} className="text-[#854D0E] mt-0.5 shrink-0" strokeWidth={2.2} />
          <p className="text-[12px] leading-relaxed text-[#854D0E] font-medium">
            {speechNotice}
          </p>
        </div>
      )}

      {/* Messages Scroll Workspace */}
      <div className="space-y-6 flex-1 mb-6">
        
        {/* Empty State — answers are generated live by the local model + RAG; no canned demo conversation is shown */}
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#075C32] text-white flex items-center justify-center shadow-xs mb-3">
              <Sparkles size={22} className="text-emerald-300" />
            </div>
            <p className="text-[14px] font-bold text-[#102A20]">Ask the Agronomy Advisory Engine</p>
            <p className="text-[12.5px] text-[#607469] mt-1 max-w-[420px] leading-relaxed">
              Answers are generated live by the local AI model, grounded in the verified BRICS RAG corpus
              (ICAR · Embrapa · ARC · CAAS · VNIIEA). No canned demo answers are shown.
            </p>
          </div>
        )}

        {/* Dynamic Messages */}
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start gap-3'}`}
          >
            {msg.role === 'user' ? (
              <div className="bg-[#EAF5EC] border border-[#C4E7D0] text-[#102A20] p-4 rounded-2xl max-w-[85%] sm:max-w-[75%] shadow-xs">
                <p className="text-[14px] font-semibold leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <div className="text-[10px] font-medium text-[#168A45] mt-1.5 text-right flex items-center justify-end gap-1">
                  <span>{msg.timestamp}</span>
                  <CheckCircle2 size={12} strokeWidth={2} />
                </div>
              </div>
            ) : (
              <>
                <div className="w-9 h-9 rounded-2xl bg-[#075C32] text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Sparkles size={18} className="text-emerald-300" />
                </div>
                <div className="bg-[#FAFCFA] border border-[#E1E7E3] rounded-2xl p-5 max-w-[88%] sm:max-w-[80%] shadow-2xs space-y-3">
                  <div className="text-[14px] text-[#102A20] font-medium leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#EEF2EF]">
                    <WhatsAppPrescriptionShare 
                      title="AI Agronomist Prescription"
                      field="Active Parcel"
                      prescription={msg.content}
                      variant="pill"
                    />
                    <div className="flex items-center gap-2">
                      {/* Read-aloud in the farmer's own language */}
                      <button
                        type="button"
                        onClick={() => handleSpeak(msg)}
                        aria-label={speakingId === msg.id ? 'Stop reading aloud' : 'Read answer aloud'}
                        title={
                          speakingId === msg.id
                            ? 'Stop read-aloud'
                            : `Read aloud in ${speechLocale}`
                        }
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          speakingId === msg.id
                            ? 'bg-[#075C32] text-white border-[#075C32]'
                            : 'bg-white text-[#52645D] border-[#D5E5D8] hover:text-[#075C32] hover:border-[#168A45]'
                        }`}
                      >
                        {speakingId === msg.id ? (
                          <VolumeX size={13} strokeWidth={2.2} />
                        ) : (
                          <Volume2 size={13} strokeWidth={2.2} />
                        )}
                      </button>
                      <div className="text-[10px] text-[#889B91] font-medium">
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-[#075C32] text-[13px] font-semibold bg-[#EAF5EC] p-3 rounded-2xl w-fit animate-pulse">
            <Sparkles size={16} className="animate-spin" />
            <span>Consulting BRICS RAG Agronomy Manuals...</span>
          </div>
        )}

      </div>

      {/* Material 3 Interactive Assist Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-3 pt-3 border-t border-[#F0F4F1]">
        {[
          { label: 'How to prepare Jeevamrutha?', icon: Leaf },
          { label: 'Optimize wheat fertigation', icon: Droplets },
          { label: 'Trigger Sentinel-2 NDVI scan', icon: ScanLine },
          { label: 'Export DPG Soil Passport', icon: FileText },
        ].map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => handleFollowUpClick(chip.label)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#D5E5D8] hover:border-[#168A45] hover:bg-[#EAF5EC] rounded-full text-[12px] font-bold text-[#3B4F44] hover:text-[#075C32] transition-all cursor-pointer shadow-2xs hover:scale-105"
            >
              <Icon size={13} className="text-[#168A45]" />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* Image Attachment Preview Chip */}
      {attachedImage && (
        <div className="mb-2 p-2 bg-[#F0F7F2] border border-[#C4E7D0] rounded-xl flex items-center justify-between w-fit gap-3">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#C4E7D0]">
              <Image src={attachedImage} alt="Preview" fill className="object-cover" />
            </div>
            <span className="text-[12px] font-bold text-[#075C32] truncate max-w-[200px]">
              {attachedImageName}
            </span>
          </div>
          <button
            type="button"
            onClick={removeAttachedImage}
            className="p-1 text-[#6A7E73] hover:text-[#E84A3C] rounded-md transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* AI Voice & Input Bar */}
      <div>
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={isRecording ? 'Listening in real-time... (Speak now)' : 'Ask anything or upload a leaf photo for disease diagnosis...'}
            className={`w-full bg-[#FAFCFA] border rounded-2xl pl-4 pr-32 py-3.5 text-[14px] text-[#102A20] placeholder-[#7F9388] shadow-xs focus:outline-none focus:ring-2 transition-all ${
              isRecording 
                ? 'border-red-400 ring-2 ring-red-300/40 bg-red-50/20' 
                : 'border-[#D5E5D8] focus:ring-[#168A45]/30'
            }`}
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {/* Photo Upload Attachment Button */}
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload leaf photo" 
              title="Upload leaf photo for disease diagnosis"
              className="p-2 text-[#52645D] hover:text-[#168A45] hover:bg-[#EAF5EC] rounded-xl transition-colors cursor-pointer"
            >
              <Paperclip size={18} strokeWidth={2} />
            </button>

            {/* Live Voice Dictation Button */}
            <button 
              type="button" 
              onClick={toggleVoiceRecording}
              aria-label="Voice input dictation" 
              title="Speak to dictate query"
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30' 
                  : 'text-[#52645D] hover:text-[#168A45] hover:bg-[#EAF5EC]'
              }`}
            >
              {isRecording ? <MicOff size={18} strokeWidth={2.5} /> : <Mic size={18} strokeWidth={2} />}
            </button>

            {/* Send Message Button */}
            <button 
              type="submit" 
              aria-label="Send message" 
              className="w-8 h-8 rounded-xl bg-[#075C32] hover:bg-[#054324] text-white flex items-center justify-center transition-all shadow-xs cursor-pointer hover:scale-105"
            >
              <Send size={15} strokeWidth={2.2} />
            </button>
          </div>
        </form>

        <p className="text-[11px] font-medium text-[#7F9388] mt-2 text-center">
          FloraNet AI is grounded in verified ICAR, Embrapa, ARC & CAAS agricultural corpora.{' '}
          <span className="text-[#075C32] font-bold underline cursor-pointer">Learn more</span>
        </p>
      </div>

    </div>
  );
}
