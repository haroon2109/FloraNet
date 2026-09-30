import { CropDetailsPageData } from '@/types/cropDetails';

export const cropDetailsPageData: CropDetailsPageData = {
  cropName: '',
  status: '',
  field: '',
  acreage: '',
  location: '',
  sowingDate: '',
  expectedHarvest: '',
  currentStage: '',
  cropVariety: '',
  healthScore: 0,
  healthScoreText: '',
  healthScoreChange: '',
  aiSummary: '',
  
  metrics: {
    height: '',
    heightChange: '',
    lai: '',
    moisture: '',
    temp: '',
  },

  growthProgressPercent: 0,

  keyInsights: [],

  observations: [],

  pestRisk: '',
  pestRiskDetail: '',

  nutritionStatus: [],

  upcomingTasks: [],
};
