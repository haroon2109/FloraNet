"use client";

import React, { useState } from 'react';
import { CheckCircle2, MoreVertical } from 'lucide-react';
import { ResolvedAlertItem, AlertItem } from '@/types/alerts';
import AlertDetailsModal from './AlertDetailsModal';

interface ResolvedAlertsProps {
  alerts?: ResolvedAlertItem[];
}

export default function ResolvedAlerts({ alerts }: ResolvedAlertsProps) {
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const displayAlerts = alerts || [];

  const handleOpenDetails = (alert: ResolvedAlertItem) => {
    setSelectedAlert({
      ...alert,
      priority: 'normal',
      status: 'resolved',
      iconType: 'check'
    });
    setModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#E1E8E2] shadow-[0_2px_12px_rgba(20,60,40,0.04)] overflow-hidden mb-6">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E1E8E2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-bold text-[#102A20]">Resolved Alerts</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#F5F9F6] text-[#52645D] text-[11px] font-bold">
              {displayAlerts.length} Historical
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            
            {/* Table Header */}
            <thead>
              <tr className="border-b border-[#E1E8E2] bg-[#F9FBF9] text-[12px] font-bold text-[#52645D] uppercase tracking-wider">
                <th className="py-3.5 px-5">Alert</th>
                <th className="py-3.5 px-4">Field</th>
                <th className="py-3.5 px-4">Resolved</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#F0F4F1] text-[13px]">
              {displayAlerts.map((alert) => (
                <tr 
                  key={alert.id}
                  onClick={() => handleOpenDetails(alert)}
                  className="hover:bg-[#F8FAF8] transition-colors cursor-pointer group"
                >
                  {/* Column 1: Alert Title & Description */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
                        <CheckCircle2 size={18} strokeWidth={2.2} />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-[#102A20] group-hover:text-[#168A45] transition-colors leading-tight">
                          {alert.title}
                        </h4>
                        <p className="text-[12px] text-[#52645D] mt-0.5 leading-snug">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Field & Crop */}
                  <td className="py-4 px-4">
                    <div className="font-bold text-[#102A20] text-[13px]">{alert.field}</div>
                    <div className="text-[11.5px] text-[#7E9086]">{alert.crop}</div>
                  </td>

                  {/* Column 3: Resolved Time */}
                  <td className="py-4 px-4">
                    <div className="font-semibold text-[#102A20] text-[13px]">{alert.timeAgo}</div>
                    <div className="text-[11px] text-[#7E9086]">{alert.timestamp}</div>
                  </td>

                  {/* Column 4: Priority Badge */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border tracking-wide bg-[#EAF5EC] text-[#168A45] border-[#C4E7D0]">
                      Resolved
                    </span>
                  </td>

                  {/* Column 5: Status Badge */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F5F9F6] text-[#52645D] text-[11px] font-bold border border-[#E1E7E3]">
                      Closed
                    </span>
                  </td>

                  {/* Column 6: Action Buttons */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(alert)}
                        className="px-3 py-1.5 bg-white border border-[#E1E7E3] hover:bg-[#F5F9F6] text-[12px] font-bold text-[#102A20] rounded-lg transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>

      <AlertDetailsModal
        alert={selectedAlert}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
