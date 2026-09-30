"use client";

import React from 'react';
import UploadActions from '@/components/ai-assistant/UploadActions';
import RecentConversations from '@/components/ai-assistant/RecentConversations';
import CentralChat from '@/components/ai-assistant/CentralChat';
import { Message } from '@/types/ai';
import { AgronomyPersona } from '@/components/ai-assistant/CentralChat';

interface AIWorkspaceProps {
  messages?: Message[];
  isTyping?: boolean;
  onSendMessage?: (prompt: string, persona?: AgronomyPersona) => void;
  /** BCP-47 locale for dictation and read-aloud, resolved from the profile. */
  speechLocale?: string;
  /** Honest warning when the local speech model lacks the farmer's language. */
  speechNotice?: string | null;
}

export default function AIWorkspace({
  messages,
  isTyping,
  onSendMessage,
  speechLocale,
  speechNotice,
}: AIWorkspaceProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
      
      {/* Left Workspace Column (Upload Actions & Recent Conversations) */}
      <div className="lg:col-span-4">
        <UploadActions
          speechLocale={speechLocale}
          onActionClick={(title) => onSendMessage?.(`[Action: ${title}] How can I get help with this?`)}
        />
        <RecentConversations onSelectConversation={(title) => onSendMessage?.(`Tell me more about ${title}`)} />
      </div>

      {/* Central Conversation Workspace */}
      <div className="lg:col-span-8">
        <CentralChat
          messages={messages}
          isTyping={isTyping}
          onSendMessage={onSendMessage}
          speechLocale={speechLocale}
          speechNotice={speechNotice}
        />
      </div>

    </div>
  );
}
