export interface DashboardKPIMetric {
  id: string;
  title: string;
  value: string;
  comparison: string;
  comparisonType: 'positive' | 'neutral' | 'negative';
  iconType: 'health' | 'fields' | 'area' | 'crops' | 'water' | 'expenses';
}

export interface HealthTrendPoint {
  date: string;
  score: number;
}

export interface FieldHealthDistributionItem {
  category: 'Healthy' | 'Watch' | 'Needs Attention';
  count: number;
  percentage: number;
  color: string;
}

export interface CropGrowthItem {
  id: string;
  name: string;
  fieldInfo: string;
  progress: number;
  status: 'Healthy' | 'Watch' | 'Needs Attention';
  statusColor: string;
  iconType: 'maize' | 'wheat' | 'vegetables';
}

export interface IrrigationStatusData {
  efficiencyPercentage: number;
  statusText: string;
  categories: {
    label: string;
    count: number;
    color: string;
  }[];
}

export interface DashboardAlert {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'warning' | 'water' | 'pest';
}

export interface WaterUsagePoint {
  date: string;
  thisPeriod: number;
  lastPeriod: number;
}

export interface WeatherOverviewData {
  location: string;
  temp: number;
  condition: string;
  feelsLike: number;
  humidity: number;
  windSpeed: string;
  rainChance: number;
  forecast: {
    day: string;
    high: number;
    low: number;
    condition: 'sun' | 'cloud' | 'rain' | 'partly_cloudy';
  }[];
}

export interface DashboardRecommendation {
  id: string;
  title: string;
  description: string;
  badgeText: string;
  badgeType: 'high' | 'recommended' | 'preventive';
  iconType: 'leaf' | 'water' | 'shield';
}

export interface CommodityPrice {
  id: string;
  commodity: string;
  price: string;
  unit: string;
  change: string;
  sparkline: number[];
}

export interface DashboardData {
  kpis: DashboardKPIMetric[];
  healthTrend: HealthTrendPoint[];
  fieldDistribution: FieldHealthDistributionItem[];
  cropGrowth: CropGrowthItem[];
  irrigationStatus: IrrigationStatusData;
  alerts: DashboardAlert[];
  waterUsage: WaterUsagePoint[];
  weather: WeatherOverviewData;
  recommendations: DashboardRecommendation[];
  marketPrices: CommodityPrice[];
}
