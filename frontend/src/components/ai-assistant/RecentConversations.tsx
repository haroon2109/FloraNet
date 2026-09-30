"use client";

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { aiAssistantPageData } from '@/data/aiAssistantData';

interface RecentConversationsProps {
  onSelectConversation: (title: string) => void;
}

export default function RecentConversations({ onSelectConversation }: RecentConversationsProps) {
  const { recentConversations } = aiAssistantPageData;

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">
      
      {/* Header */}
      <h3 className="text-[16px] font-bold text-[#102A20] mb-3">Recent Conversations</h3>

      {/* List */}
      <div className="space-y-2.5 mb-4">
        {recentConversations.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectConversation(item.title)}
            className="w-full text-left p-2.5 rounded-xl border border-[#F0F4F1] bg-[#FAFCFA] hover:bg-[#F5F9F6] hover:border-[#D5E6D8] transition-colors flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#C4E7D0]">
              <MessageSquare size={15} strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-[13px] font-bold text-[#102A20] group-hover:text-[#168A45] transition-colors leading-tight truncate">
                {item.title}
              </h4>
              <p className="text-[11px] text-[#889B91] mt-0.5 font-medium">
                {item.timeAgo}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* View All Button */}
      <button
        type="button"
        className="w-full py-2 bg-white border border-[#E1E7E3] hover:bg-[#F5F9F6] text-[12px] font-semibold text-[#52645D] hover:text-[#102A20] rounded-xl transition-colors shadow-xs"
      >
        View all conversations
      </button>

    </div>
  );
}
