"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TopBar from '@/components/ai-assistant/TopBar';
import FarmHero from '@/components/ai-assistant/FarmHero';
import AIWorkspace from '@/components/ai-assistant/AIWorkspace';
import AIInsights from '@/components/ai-assistant/AIInsights';
import WeatherSummary from '@/components/ai-assistant/WeatherSummary';
import ActiveAlerts from '@/components/ai-assistant/ActiveAlerts';
import FarmOverview from '@/components/ai-assistant/FarmOverview';
import { AgronomyPersona } from '@/components/ai-assistant/CentralChat';
import { ChatTurn, Message } from '@/types/ai';
import { aiService } from '@/services/aiService';
import { useFarm } from '@/context/farmContext';
import { speechLocaleFor, speechSupportNotice } from '@/lib/speech';

/**
 * Mirrors the backend's MAX_HISTORY_TURNS (farm.py). Sending more would be
 * trimmed server-side anyway, so both ends agree on the window size.
 */
const MAX_HISTORY_TURNS = 10;

export default function AIAssistantPage() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const { userProfile, fields } = useFarm();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Honest capability warning for the farmer's own language (isiZulu, Odia …).
  // Fetched once per language so an unsupported locale is never silent.
  useEffect(() => {
    let cancelled = false;
    speechSupportNotice(speechLocaleFor(userProfile.country, userProfile.language)).then(
      (notice) => {
        if (!cancelled) setSpeechNotice(notice);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [userProfile.country, userProfile.language]);

  if (!mounted) return null;

  const speechLocale = speechLocaleFor(userProfile.country, userProfile.language);

  /**
   * Crops registered on this farm as the rotation context.
   * The registry is ordered as it was entered, with the current primary crop
   * last — that ordering is the best available proxy for recency.
   */
  const cropHistory = (() => {
    const seen: string[] = [];
    for (const field of fields) {
      const crop = (field.crop || '').trim();
      if (crop && !seen.some((c) => c.toLowerCase() === crop.toLowerCase())) seen.push(crop);
    }
    const primary = (userProfile.primaryCrop || '').trim();
    if (primary && !seen.some((c) => c.toLowerCase() === primary.toLowerCase())) seen.push(primary);
    return seen;
  })();

  const handleSendMessage = async (prompt: string, persona?: AgronomyPersona) => {
    if (isTyping) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: timeString
    };

    // Conversation memory: replay prior turns (oldest first) so a spoken
    // follow-up keeps its antecedent. The current prompt is appended by the
    // backend, so it is deliberately not included here.
    const history: ChatTurn[] = messages
      .filter((msg) => (msg.content || '').trim())
      .slice(-MAX_HISTORY_TURNS)
      .map((msg) => ({ role: msg.role, content: msg.content }));

    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    const responseMsg = await aiService.sendMessage(prompt, {
      persona: persona || 'precision',
      country: userProfile.country,
      crop: userProfile.primaryCrop,
      language: userProfile.language,
      history,
      cropHistory,
    });

    setMessages(prev => [...prev, responseMsg]);
    setIsTyping(false);
  };

  return (
    <DashboardLayout>
      {/* Top Bar */}
      <TopBar />

      {/* Hero Welcome Banner */}
      <FarmHero onPromptClick={(prompt) => handleSendMessage(prompt)} />

      {/* Main Center Workspace (Uploads, Recent, & Persona Chat) */}
      <AIWorkspace
        messages={messages}
        isTyping={isTyping}
        onSendMessage={handleSendMessage}
        speechLocale={speechLocale}
        speechNotice={speechNotice}
      />

      {/* AI Insights Bar */}
      <AIInsights />

      {/* Bottom 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <WeatherSummary />
        <ActiveAlerts />
        <FarmOverview />
      </div>
    </DashboardLayout>
  );
}
