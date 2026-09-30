export interface RecommendationItem {
  id: string;
  priority: 'high' | 'medium' | 'low';
  priorityText: string;
  title: string;
  description: string;
  category: 'irrigation' | 'fertilizer' | 'pest' | 'weather' | 'soil' | 'harvest';
  iconType: 'droplet' | 'urea' | 'bug' | 'sun';
  field: string;
  meta1Label: string;
  meta1Value: string;
  meta2Label: string;
  meta2Value: string;
}

export interface ImpactMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  iconType: 'droplet' | 'leaf' | 'rupee' | 'shield';
}

export interface UpcomingAction {
  id: string;
  title: string;
  timeText: string;
  dateBadge: string;
  iconType: 'droplet' | 'sprout' | 'bug' | 'weed';
}

export interface RecommendationsPageData {
  recommendations: RecommendationItem[];
  aiSummary: {
    title: string;
    description: string;
  };
  impactMetrics: ImpactMetric[];
  upcomingActions: UpcomingAction[];
}
