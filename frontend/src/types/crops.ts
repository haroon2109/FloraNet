export interface CropItem {
  id: string;
  name: string;
  field: string;
  area: string;
  growthStage: string;
  daysInStage: number;
  healthScore: number;
  healthStatus: 'Good' | 'Watch' | 'Needs Attention';
  irrigationText: string;
  nextIrrigation: string;
  nextAction: string;
  actionTiming: string;
  status: 'Healthy' | 'Watch' | 'Needs Attention';
  cropType: 'maize' | 'wheat' | 'vegetables' | 'pulses' | 'cotton';
}

export interface CropKPIMetric {
  id: string;
  title: string;
  value: string;
  secondary: string;
  comparisonType?: 'positive' | 'neutral' | 'negative';
  iconType: 'crops' | 'area' | 'health' | 'trend' | 'warning';
}

export interface GrowthStageItem {
  stage: 'Initial' | 'Vegetative' | 'Flowering' | 'Podding' | 'Maturity';
  count: number;
}

export interface CropHealthCategory {
  category: 'Healthy' | 'Watch' | 'Needs Attention';
  count: number;
  percentage: number;
  color: string;
}

export interface CropRecommendation {
  id: string;
  title: string;
  description: string;
  badgeText: string;
  badgeType: 'high' | 'recommended' | 'preventive';
  iconType: 'leaf' | 'water' | 'shield';
}

export interface CropsPageData {
  kpis: CropKPIMetric[];
  crops: CropItem[];
  healthDistribution: CropHealthCategory[];
  growthStages: GrowthStageItem[];
  recommendations: CropRecommendation[];
}
