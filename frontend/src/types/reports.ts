export interface ReportKPIMetric {
  id: string;
  title: string;
  value: string;
  unit?: string;
  subtext?: string;
  change?: string;
  iconType: 'fields' | 'crops' | 'area' | 'expenses' | 'yield' | 'profit';
}

export interface CropPerformanceData {
  crop: string;
  thisPeriod: number;
  lastPeriod: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  amountText: string;
  percentage: number;
  color: string;
}

export interface FieldPerformanceItem {
  id: string;
  field: string;
  crop: string;
  cropType: 'maize' | 'wheat' | 'vegetables' | 'pulses' | 'cotton' | 'soybean';
  area: number;
  yieldKgs: number;
  yieldPerAcre: number;
  status: 'Excellent' | 'Good' | 'Average';
}

export interface ProfitTrendPoint {
  date: string;
  profit: number;
  displayValue: string;
}

export interface ReportTypeItem {
  id: string;
  title: string;
  description: string;
  iconType: 'crop' | 'financial' | 'weather' | 'field' | 'custom';
  iconBg: string;
  iconColor: string;
}

export interface RecentReportItem {
  id: string;
  title: string;
  date: string;
}

export interface ReportInsight {
  id: string;
  text: string;
  iconType: 'trend' | 'droplet' | 'rupee' | 'leaf';
  iconBg: string;
  iconColor: string;
}

export interface ReportsPageData {
  kpis: ReportKPIMetric[];
  cropPerformance: CropPerformanceData[];
  expenses: ExpenseCategory[];
  totalExpensesText: string;
  fieldPerformance: FieldPerformanceItem[];
  profitTrend: ProfitTrendPoint[];
  reportTypes: ReportTypeItem[];
  recentReports: RecentReportItem[];
  insights: ReportInsight[];
}
