"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/context/toastContext';
import { getApiBaseUrl } from '@/lib/apiConfig';

interface PilotRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PilotRegistrationModal({ isOpen, onClose }: PilotRegistrationModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [country, setCountry] = useState('India');
  const [role, setRole] = useState('Farmer / Cooperative');
  const [acreage, setAcreage] = useState('25');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !organization.trim()) {
      showToast('Please fill all required fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        email,
        organization,
        country,
        role,
        acreage: parseFloat(acreage) || 10,
      };

      const res = await fetch(`${getApiBaseUrl()}/api/v1/farm/pilot-waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedResult(data);
        showToast('Pilot registration submitted successfully!', 'success');
      } else {
        let detail = '';
        try {
          const errBody = await res.json();
          detail = errBody?.detail ? ` — ${errBody.detail}` : '';
        } catch { /* ignore parse errors */ }
        showToast(`Pilot registration failed (HTTP ${res.status}${detail}). No reservation was made.`, 'error');
      }
    } catch (err) {
      showToast('Pilot registration unreachable — backend offline. No reservation was made; please retry.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedResult(null);
    setName('');
    setEmail('');
    setOrganization('');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      
      {/* Full-Screen Clickable Backdrop */}
      <div 
        className="fixed inset-0" 
        onClick={resetForm}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#D5E5D8] overflow-hidden z-10 animate-in zoom-in-95 duration-150 my-auto">
        
        {/* Header with Back Button */}
        <div className="p-5 sm:p-6 bg-[#FAFCFA] border-b border-[#EEF2EF] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* Back Button */}
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#EEF7F1] border border-[#D5E3D8] hover:border-[#075C32] text-[#304439] hover:text-[#075C32] text-[13px] font-bold transition-all shadow-2xs cursor-pointer"
              aria-label="Back to Landing Page"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              <span>Back</span>
            </button>

            <div>
              <h3 className="text-[16px] font-bold text-[#102A20] leading-tight">
                Join Regional BRICS Pilot
              </h3>
              <p className="text-[11.5px] text-[#607469]">
                Early access for cooperatives & researchers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="p-2 text-[#7F9489] hover:text-[#102A20] hover:bg-[#EEF2EF] rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {submittedResult ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#EAF5EC] text-[#075C32] flex items-center justify-center mx-auto shadow-xs border border-[#C4E7D0]">
                <CheckCircle2 size={30} strokeWidth={2.5} />
              </div>
              <h4 className="text-[18px] font-bold text-[#102A20]">
                Pilot Deployment Confirmed
              </h4>
              <p className="text-[13.5px] text-[#55695F] max-w-sm mx-auto">
                Your application has been assigned to{' '}
                <span className="font-bold text-[#075C32]">{submittedResult.node_assigned}</span>. A technical liaison will reach out to <span className="font-semibold text-[#102A20]">{email}</span>.
              </p>
              <div className="p-3 bg-[#FAFCFA] rounded-xl border border-[#E1E8E2] text-[12px] text-[#607469] font-mono">
                Pilot Token: {submittedResult.pilot_id}
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="w-full py-3 bg-[#075C32] hover:bg-[#054324] text-white font-bold text-[14px] rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#102A20] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full bg-[#FAFCFA] border border-[#D5E5D8] rounded-xl px-3.5 py-2.5 text-[13.5px] text-[#102A20] focus:outline-none focus:ring-2 focus:ring-[#168A45]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#102A20] mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.org"
                    className="w-full bg-[#FAFCFA] border border-[#D5E5D8] rounded-xl px-3.5 py-2.5 text-[13.5px] text-[#102A20] focus:outline-none focus:ring-2 focus:ring-[#168A45]/30"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#102A20] mb-1">
                    Institution / Farm *
                  </label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Maharashtra Agri Trust"
                    className="w-full bg-[#FAFCFA] border border-[#D5E5D8] rounded-xl px-3.5 py-2.5 text-[13.5px] text-[#102A20] focus:outline-none focus:ring-2 focus:ring-[#168A45]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#102A20] mb-1">
                    BRICS Nation
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#FAFCFA] border border-[#D5E5D8] rounded-xl px-3 py-2.5 text-[13px] text-[#102A20] focus:outline-none"
                  >
                    <option value="India">🇮🇳 India</option>
                    <option value="Brazil">🇧🇷 Brazil</option>
                    <option value="Russia">🇷🇺 Russia</option>
                    <option value="China">🇨🇳 China</option>
                    <option value="South Africa">🇿🇦 South Africa</option>
                    <option value="Egypt">🇪🇬 Egypt</option>
                    <option value="Ethiopia">🇪🇹 Ethiopia</option>
                    <option value="Iran">🇮🇷 Iran</option>
                    <option value="UAE">🇦🇪 UAE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#102A20] mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#FAFCFA] border border-[#D5E5D8] rounded-xl px-3 py-2.5 text-[13px] text-[#102A20] focus:outline-none"
                  >
                    <option value="Farmer / Cooperative">Farmer / Co-op</option>
                    <option value="Agribusiness">Agribusiness</option>
                    <option value="Government / Ministry">Ministry</option>
                    <option value="Research / University">University</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#102A20] mb-1">
                    Acreage
                  </label>
                  <input
                    type="number"
                    value={acreage}
                    onChange={(e) => setAcreage(e.target.value)}
                    placeholder="25"
                    className="w-full bg-[#FAFCFA] border border-[#D5E5D8] rounded-xl px-3 py-2.5 text-[13px] text-[#102A20] focus:outline-none"
                  />
                </div>
              </div>

              {/* Bottom Actions with Back and Submit buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 rounded-xl border border-[#D5E3D8] hover:bg-[#F2F7F4] text-[#4A5D54] font-bold text-[13.5px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#075C32] hover:bg-[#054324] text-white font-bold text-[14px] rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering with Node...</span>
                  ) : (
                    <>
                      <span>Submit Pilot Application</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
