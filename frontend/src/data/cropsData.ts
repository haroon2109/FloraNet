import { CropsPageData } from '@/types/crops';

/**
 * DEPRECATED static shape retained for type compatibility only.
 * The crops page now derives all KPIs, rows, distributions and advisories from
 * the LIVE backend field registry (/api/v1/farm/fields + /farm/metrics +
 * /farm/recommendations). Every value that used to live here was hardcoded
 * sample data and has been removed — nothing fabricated ships.
 */
export const cropsPageData: CropsPageData = {
  kpis: [],
  crops: [],
  healthDistribution: [],
  growthStages: [],
  recommendations: [],
};
