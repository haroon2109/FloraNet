export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  /** Language the backend answered in (assistant turns only). */
  language?: string;
  /** Turns replayed by the backend for this answer, including this one. */
  turnsInContext?: number;
  /** RAG institutions the answer cited. */
  sources?: string[];
}

/** One replayed conversation turn sent to POST /farm/chat. */
export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIInsightItem {
  id: string;
  text: string;
  badgeText: string;
  badgeType: 'high' | 'medium' | 'positive' | 'low';
  iconType: 'leaf' | 'droplet' | 'chart' | 'bug';
}

export interface RecentConversationItem {
  id: string;
  title: string;
  timeAgo: string;
}

export interface FarmOverviewMetric {
  id: string;
  title: string;
  value: string;
  subtext: string;
  changeText: string;
  isPositive: boolean;
  type: 'health' | 'water' | 'yield' | 'profit';
}

export interface AIAssistantData {
  quickPrompts: string[];
  recentConversations: RecentConversationItem[];
  insights: AIInsightItem[];
  weatherSummary: {
    location: string;
    temp: string;
    condition: string;
    humidity: string;
    wind: string;
    forecast: { day: string; high: string; low: string }[];
  };
  alerts: {
    id: string;
    title: string;
    description: string;
    timeAgo: string;
    type: 'amber' | 'red' | 'blue';
  }[];
  farmOverview: FarmOverviewMetric[];
}
