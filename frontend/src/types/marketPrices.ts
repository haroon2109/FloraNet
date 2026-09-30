export interface CommodityPriceItem {
  id: string;
  name: string;
  variety: string;
  price: string;
  rawPrice: number;
  changeYesterday: string;
  changeYesterdayAmount: string;
  isYesterdayPositive: boolean;
  changeLastWeek: string;
  changeLastWeekAmount: string;
  isLastWeekPositive: boolean;
  trendData: number[];
  priceRangeMin: string;
  priceRangeMax: string;
  cropType: 'maize' | 'wheat' | 'rice' | 'cotton' | 'pulses' | 'soybean' | 'groundnut';
}

export interface MarketComparisonItem {
  id: string;
  market: string;
  maizePrice: string;
  wheatPrice: string;
  ricePrice: string;
}

export interface MarketInsightItem {
  id: string;
  text: string;
  iconType: 'trend' | 'droplet' | 'store' | 'rain';
  iconBg: string;
  iconColor: string;
}

export interface MarketPricesPageData {
  commodities: CommodityPriceItem[];
  summaryMetrics: {
    commoditiesTracked: number;
    pricesUpToday: number;
    pricesDownToday: number;
  };
  overallTrendData: {
    date: string;
    price: number;
  }[];
  avgPriceText: string;
  avgPriceChangeText: string;
  topMarkets: MarketComparisonItem[];
  insights: MarketInsightItem[];
}
