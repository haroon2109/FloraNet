export interface FieldMonitorKPIMetric {
  id: string;
  title: string;
  value: string;
  comparison: string;
  comparisonType?: 'positive' | 'neutral' | 'negative';
  iconType: 'health' | 'moisture' | 'temperature' | 'rainfall' | 'sensors';
}

export interface FieldMonitorItem {
  id: string;
  name: string;
  area: string;
  crop: string;
  cropType: 'maize' | 'wheat' | 'vegetables' | 'pulses' | 'cotton' | 'groundnut';
  ndvi: number | null;
  healthText: string;
  soilMoisture: string | null;
  soilStatus: string | null;
  temperature: string | null;
  lastUpdated: string | null;
  status: 'Healthy' | 'Watch' | 'Poor' | 'No Data';
  overlayColor: string;
}

export interface FieldHealthDistributionCategory {
  category: 'Healthy' | 'Moderate' | 'Poor' | 'No Data';
  count: number;
  percentage: number;
  color: string;
}

export interface AlertSummaryBadge {
  type: 'Critical' | 'Warning' | 'Info' | 'Normal';
  count: number;
  color: string;
  iconBg: string;
}

export interface IoTSensorItem {
  id: string;
  name: string;
  status: 'Online' | 'Offline' | 'Warning';
  lastUpdated: string;
  iconType: 'weather' | 'soil' | 'leaf' | 'rain' | 'wind';
}

export interface FieldRecommendation {
  id: string;
  title: string;
  description: string;
  badgeText: string;
  badgeType: 'high' | 'medium' | 'low';
  iconType: 'leaf' | 'fertilizer' | 'shield';
}

export interface FieldMonitorPageData {
  kpis: FieldMonitorKPIMetric[];
  fields: FieldMonitorItem[];
  fieldDistribution: FieldHealthDistributionCategory[];
  alertsSummary: AlertSummaryBadge[];
  sensors: IoTSensorItem[];
  recommendations: FieldRecommendation[];
}
