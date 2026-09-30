export type AlertPriority = 'critical' | 'warning' | 'info' | 'normal';
export type AlertStatus = 'active' | 'resolved';

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  field: string;
  crop: string;
  timeAgo: string;
  timestamp: string;
  priority: AlertPriority;
  status: AlertStatus;
  iconType: 'warning_red' | 'warning_amber' | 'rain' | 'plant' | 'check';
}

export type ResolvedAlertItem = AlertItem;

export interface AlertCategoryCount {
  category: 'Critical' | 'Warning' | 'Info' | 'Normal';
  count: number;
  percentage: number;
  color: string;
}

export interface FieldAlertCount {
  id: string;
  fieldName: string;
  count: number;
  badgeBg: string;
  badgeText: string;
}

export interface AIAlertRecommendation {
  id: string;
  title: string;
  description: string;
  badgeText: string;
  badgeType: 'high' | 'medium' | 'low';
  iconType: 'leaf' | 'shield' | 'rain';
}

export interface AlertsPageData {
  activeAlerts: AlertItem[];
  resolvedAlerts: AlertItem[];
  summaryDistribution: AlertCategoryCount[];
  alertsByField: FieldAlertCount[];
  recommendations: AIAlertRecommendation[];
}
