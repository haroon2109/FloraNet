import { WeatherPageData } from '@/types/weather';

/**
 * DEPRECATED static shape retained for type compatibility only.
 * The weather page now renders LIVE Open-Meteo telemetry via useLiveWeather()
 * (backend /api/v1/farm/weather-telemetry). Every value that used to live here
 * was hardcoded sample data and has been removed — nothing fabricated ships.
 */
export const weatherPageData: WeatherPageData = {
  hourlyForecast: [],
  tempTrend: [],
  rainTrend: [],
  alerts: [],
  recommendations: [],
  past7Days: [],
  sunrise: '',
  sunset: '',
  windDirection: { direction: '', speed: '' },
  moonPhase: { name: '', illumination: '' },
};
