export interface HourlyForecastItem {
  time: string;
  temp: string;
  condition: string;
  conditionType: 'sun' | 'cloud' | 'partly_cloudy' | 'rain';
  wind: string;
}

export interface TemperatureTrendPoint {
  date: string;
  maxTemp: number;
  minTemp: number;
}

export interface RainfallTrendPoint {
  date: string;
  rainfall: number;
}

export interface WeatherAlertItem {
  id: string;
  title: string;
  description: string;
  badgeText: string;
  badgeType: 'medium' | 'low';
  time: string;
  iconType: 'warning' | 'rain';
}

export interface WeatherRecommendationItem {
  id: string;
  title: string;
  description: string;
  badgeText: string;
  badgeType: 'high' | 'medium' | 'low';
  iconType: 'leaf' | 'shield' | 'rain';
}

export interface PastDaySummaryItem {
  date: string;
  maxTemp: string;
  minTemp: string;
  rainfall: string;
}

export interface WeatherPageData {
  hourlyForecast: HourlyForecastItem[];
  tempTrend: TemperatureTrendPoint[];
  rainTrend: RainfallTrendPoint[];
  alerts: WeatherAlertItem[];
  recommendations: WeatherRecommendationItem[];
  past7Days: PastDaySummaryItem[];
  sunrise: string;
  sunset: string;
  windDirection: {
    direction: string;
    speed: string;
  };
  moonPhase: {
    name: string;
    illumination: string;
  };
}
