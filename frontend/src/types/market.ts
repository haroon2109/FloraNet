export type CropIconType = "corn" | "wheat" | "pulse" | "soybean" | "cotton" | "peanut";
export type TrendDirection = "up" | "down" | "flat";
export type OpportunityLevel = "High Opportunity" | "Medium Opportunity" | "Low Opportunity";

export interface CommodityCard {
  id: string;
  name: string;
  price: number;
  icon: CropIconType;
}

export interface CommodityRow {
  id: string;
  name: string;
  variety: string;
  market: string;
  location: string;
  price: number;
  change: number;
  changePercent: number;
  trend: number[];
  updated: string;
  icon: CropIconType;
}

export interface MarketSummaryData {
  commoditiesTracked: number;
  marketsMonitored: number;
  pricesIncreased: number;
  pricesDecreased: number;
}

export interface PriceTrendData {
  date: string;
  Maize: number;
  Wheat: number;
  Tur: number;
}

export interface MarketOpportunity {
  id: string;
  title: string;
  description: string;
  level: OpportunityLevel;
  icon: CropIconType;
}

export interface PriceAlert {
  id: string;
  title: string;
  subtext: string;
  active: boolean;
}

export interface MarketInsight {
  id: string;
  text: string;
  icon: "trend" | "wheat" | "rain";
}
