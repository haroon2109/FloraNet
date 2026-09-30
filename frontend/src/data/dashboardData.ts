import { DashboardData } from '@/types/dashboard';

export const dashboardData: DashboardData = {
  kpis: [],
  healthTrend: [],
  fieldDistribution: [],
  cropGrowth: [],
  irrigationStatus: { efficiencyPercentage: 0, statusText: '', categories: [] },
  alerts: [],
  waterUsage: [],
  weather: {
    location: '',
    temp: 0,
    condition: '',
    feelsLike: 0,
    humidity: 0,
    windSpeed: '',
    rainChance: 0,
    forecast: [],
  },
  recommendations: [],
  marketPrices: [],
};
