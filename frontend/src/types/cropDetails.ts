export interface CropObservation {
  id: string;
  text: string;
  timestamp: string;
  author: string;
}

export interface NutrientLevel {
  nutrient: string;
  status: string;
  level: 'optimal' | 'adequate' | 'low';
}

export interface UpcomingTaskItem {
  id: string;
  title: string;
  dueText: string;
  iconType: 'droplet' | 'urea' | 'weed';
}

export interface CropDetailsPageData {
  cropName: string;
  status: string;
  field: string;
  acreage: string;
  location: string;
  sowingDate: string;
  expectedHarvest: string;
  currentStage: string;
  cropVariety: string;
  healthScore: number;
  healthScoreText: string;
  healthScoreChange: string;
  aiSummary: string;
  metrics: {
    height: string;
    heightChange: string;
    lai: string;
    moisture: string;
    temp: string;
  };
  growthProgressPercent: number;
  keyInsights: string[];
  observations: CropObservation[];
  pestRisk: string;
  pestRiskDetail: string;
  nutritionStatus: NutrientLevel[];
  upcomingTasks: UpcomingTaskItem[];
}
