"use client";

import React, { useState } from 'react';
import { TriangleAlert, Droplets, Sprout, MoreVertical, CheckCircle2 } from 'lucide-react';
import { AlertItem } from '@/types/alerts';
import AlertDetailsModal from './AlertDetailsModal';

import EmptyFilterState from '@/components/ui/EmptyFilterState';

interface ActiveAlertsProps {
  alerts: AlertItem[];
  onResolveAlert?: (alertId: string) => void;
  onResetFilters?: () => void;
}

export default function ActiveAlerts({ alerts, onResolveAlert, onResetFilters }: ActiveAlertsProps) {
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenDetails = (alert: AlertItem) => {
    setSelectedAlert(alert);
    setModalOpen(true);
  };

  const renderIcon = (type: AlertItem['iconType']) => {
    switch (type) {
      case 'warning_red':
        return (
          <div className="w-9 h-9 rounded-full bg-[#FCE8E6] text-[#E84A3C] flex items-center justify-center shrink-0 border border-[#FAD2CF]">
            <TriangleAlert size={18} strokeWidth={2.2} />
          </div>
        );
      case 'warning_amber':
        return (
          <div className="w-9 h-9 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
            <TriangleAlert size={18} strokeWidth={2.2} />
          </div>
        );
      case 'rain':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
            <Droplets size={18} strokeWidth={2.2} fill="#1A73E8" fillOpacity={0.2} />
          </div>
        );
      case 'plant':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
            <Sprout size={18} strokeWidth={2.2} />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
            <TriangleAlert size={18} strokeWidth={2.2} />
          </div>
        );
    }
  };

  const getPriorityBadgeStyle = (priority: AlertItem['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-[#FCE8E6] text-[#E84A3C] border-[#FAD2CF]';
      case 'warning':
        return 'bg-[#FEF7E0] text-[#B45309] border-[#FCE8B2]';
      case 'info':
        return 'bg-[#EBF3FE] text-[#1A73E8] border-[#D0E2FB]';
      case 'normal':
        return 'bg-[#EAF5EC] text-[#168A45] border-[#C4E7D0]';
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#E1E8E2] shadow-[0_2px_12px_rgba(20,60,40,0.04)] overflow-hidden mb-6">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E1E8E2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-bold text-[#102A20]">Active Alerts</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#EAF5EC] text-[#168A45] text-[11px] font-bold">
              {alerts.length} Active
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
                <th className="py-3.5 px-4">Detected</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#F0F4F1] text-[13px]">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 px-4">
                    <EmptyFilterState 
                      title="No active alerts found"
                      description="No alerts match the selected priority or search filter. All field telemetry is operating within nominal thresholds."
                      onReset={onResetFilters}
                      resetLabel="Reset All Filters"
                    />
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr 
                    key={alert.id}
                    onClick={() => handleOpenDetails(alert)}
                    className="hover:bg-[#F8FAF8] transition-colors cursor-pointer group"
                  >
                    {/* Column 1: Alert Title & Description */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        {renderIcon(alert.iconType)}
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

                    {/* Column 3: Detected Time */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#102A20] text-[13px]">{alert.timeAgo}</div>
                      <div className="text-[11px] text-[#7E9086]">{alert.timestamp}</div>
                    </td>

                    {/* Column 4: Priority Badge */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border capitalize ${getPriorityBadgeStyle(alert.priority)}`}>
                        {alert.priority}
                      </span>
                    </td>

                    {/* Column 5: Status Badge */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EAF5EC] text-[#168A45] text-[11px] font-bold border border-[#C4E7D0]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#168A45]" />
                        Active
                      </span>
                    </td>

                    {/* Column 6: Action Buttons */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(alert)}
                          className="px-3 py-1.5 bg-white border border-[#075C32] hover:bg-[#F5F9F6] text-[12px] font-bold text-[#075C32] rounded-lg transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                        {onResolveAlert && (
                          <button
                            type="button"
                            onClick={() => onResolveAlert(alert.id)}
                            title="Mark as resolved"
                            className="p-1.5 text-[#52645D] hover:text-[#168A45] hover:bg-[#EAF5EC] rounded-md transition-colors cursor-pointer"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

      </div>

      {/* Interactive Modal */}
      <AlertDetailsModal
        alert={selectedAlert}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onResolve={onResolveAlert}
      />
    </>
  );
}
