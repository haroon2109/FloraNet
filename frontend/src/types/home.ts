export interface FarmerProfile {
  name: string;
  farmName: string;
  avatarUrl: string;
  initials: string;
}

export interface MetricItem {
  id: string;
  title: string;
  value: string;
  subValue?: string;
  status: string;
  statusType?: 'good' | 'active' | 'growing' | 'neutral' | 'warning' | 'danger';
  iconType: 'health' | 'fields' | 'crops' | 'irrigation';
}

export interface FieldItem {
  id: string;
  name: string;
  crop: string;
  area: string;
  irrigation: string;
  healthScore: number;
  status: 'healthy' | 'watch' | 'attention';
  statusLabel: string;
  imageUrl: string;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'warning' | 'water' | 'pest';
  fieldRef?: string;
}

export interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: 'sun' | 'cloud' | 'rain' | 'partly_cloudy';
}

export interface WeatherData {
  location: string;
  temp: number;
  condition: string;
  feelsLike: number;
  humidity: number;
  windSpeed: string;
  rainChance: number;
  forecast: ForecastDay[];
}

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  badgeText: string;
  badgeType: 'high' | 'recommended' | 'preventive';
  iconType: 'leaf' | 'water' | 'shield';
}

export interface MarketPriceItem {
  id: string;
  commodity: string;
  price: string;
  unit: string;
  change: string;
  isPositive: boolean;
}

export interface HomeDashboardData {
  profile: FarmerProfile;
  metrics: MetricItem[];
  fields: FieldItem[];
  alerts: AlertItem[];
  weather: WeatherData;
  recommendations: RecommendationItem[];
  marketPrices: MarketPriceItem[];
}
