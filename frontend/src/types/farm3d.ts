export type WeatherMode = 'Sunny' | 'Cloudy' | 'Rain';

export interface Field3DData {
  id: string; // e.g. 'field-1'
  name: string; // e.g. 'Field 1'
  crop: string; // e.g. 'Maize'
  area: string; // e.g. '2.5 acres'
  healthScore: number; // e.g. 88
  soilMoisture: number; // e.g. 42
  irrigationStatus: 'Optimal' | 'Due Tomorrow' | 'Active' | 'Needed';
  growthStage: string; // e.g. 'Vegetative'
  riskLevel: 'Low' | 'Moderate' | 'High';
  statusColor: string; // e.g. '#168A45', '#D97706', '#E84C3D'
  position: [number, number, number]; // [x, y, z] center of field mesh
  dimensions: [number, number, number]; // [width, height, depth]
}

export interface Recommendation3D {
  id: string;
  fieldId: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  actionText: string;
  position: [number, number, number];
}

export interface Alert3D {
  id: string;
  fieldId: string;
  title: string;
  severity: 'Critical' | 'Warning' | 'Info';
  message: string;
  position: [number, number, number];
}
