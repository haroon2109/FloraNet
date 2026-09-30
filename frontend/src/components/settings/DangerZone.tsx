"use client";

import React, { useState } from 'react';
import { Trash2, ArrowRight, TriangleAlert, X } from 'lucide-react';
import { useToast } from '@/context/toastContext';

export default function DangerZone() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { showToast } = useToast();

  // Account deletion requires a backend endpoint that does not exist in this
  // deployment yet. We say that plainly instead of simulating a deletion that
  // never happens — a farmer must never believe their data was erased when it
  // was not.
  const handleDeleteAccount = () => {
    setShowConfirmModal(false);
    showToast(
      'Account deletion is not available in this deployment — no data was changed. Contact your cooperative administrator to remove your records.',
      'warning',
      undefined,
      7000
    );
  };

  return (
    <>
      {/* Danger Zone Card */}
      <div className="bg-[#FFF1F0] border border-[#FAD2CF] rounded-2xl p-4 shadow-[0_2px_12px_rgba(232,74,60,0.04)] mb-5">
        
        {/* Header */}
        <h3 className="text-[15px] font-bold text-[#E84A3C] mb-3 px-0.5">Danger Zone</h3>

        {/* Delete Row */}
        <div 
          onClick={() => setShowConfirmModal(true)}
          className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 hover:bg-white border border-[#FAD2CF] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#FCE8E6] text-[#E84A3C] flex items-center justify-center shrink-0 border border-[#FAD2CF]">
              <Trash2 size={16} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[13px] font-bold text-[#E84A3C] group-hover:underline leading-tight">
                Delete Account
              </h4>
              <p className="text-[11px] text-[#52645D] truncate mt-0.5">
                Permanently delete your account and all data
              </p>
            </div>
          </div>

          <ArrowRight size={16} className="text-[#E84A3C] group-hover:translate-x-1 transition-transform shrink-0" />
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102A20]/40 backdrop-blur-xs">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden border border-[#E1E7E3]"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E1E7E3] bg-[#FFF1F0]">
              <div className="flex items-center gap-2 text-[#E84A3C]">
                <TriangleAlert size={18} strokeWidth={2.2} />
                <h3 className="text-[15px] font-bold">Delete your FloraNet account?</h3>
              </div>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#52645D] hover:bg-[#FCE8E6] transition-colors"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              <p className="text-[13px] text-[#52645D] leading-relaxed">
                Account deletion is not wired up in this deployment: FloraNet is
                running as a Digital Public Good node without a user-account
                removal service. Nothing will be deleted if you proceed — you
                will simply see a notice.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F7F9F7] border-t border-[#E1E7E3] flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-[13px] font-semibold text-[#52645D] hover:text-[#102A20] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="px-5 py-2 bg-[#E84A3C] text-white rounded-xl text-[13px] font-bold hover:bg-[#C93B2F] transition-colors shadow-xs"
              >
                Continue anyway
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
