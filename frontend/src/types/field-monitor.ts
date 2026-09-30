export interface KPIMetric {
  id: string;
  title: string;
  value: string;
  secondary?: string;
  status?: string;
  comparison?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export type FieldStatus = 'Healthy' | 'Watch' | 'Poor' | 'No Data';

export interface Field {
  id: string;
  name: string;
  area: string;
  crop: string;
  ndvi: number | null;
  soilMoisture: number | null;
  soilStatus: string;
  temperature: number | null;
  lastUpdated: string | null;
  status: FieldStatus;
}

export interface MapField {
  id: string;
  name: string;
  ndvi: number | null;
  path: string; // SVG path data
}

export interface HealthSummary {
  total: number;
  healthy: number;
  moderate: number;
  poor: number;
  noData: number;
}

export interface AlertSummary {
  critical: number;
  warning: number;
  info: number;
  normal: number;
}

export interface SensorStatus {
  id: string;
  name: string;
  status: 'Online' | 'Offline';
  lastUpdated: string;
}

export interface FieldRecommendation {
  id: string;
  type: 'leaf' | 'agriculture' | 'shield';
  title: string;
  description: string;
  priority: 'High Priority' | 'Medium Priority' | 'Low Priority';
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  feelsLike: number;
  humidity: number;
  wind: number;
  rainChance: number;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: 'cloudy' | 'rain' | 'sun';
  }>;
}
