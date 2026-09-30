"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Field3DData, WeatherMode, Recommendation3D, Alert3D } from '@/types/farm3d';
import { fetchFieldsTelemetry, fetchFarmMetrics, mutateFieldIrrigation } from '@/services/farmApi';
import { 
  cacheTelemetryLocally, 
  getCachedTelemetry, 
  queueOfflineMutation 
} from '@/lib/offlineDb';
import { getBRICSCountryConfig, BRICSCountryConfig } from '@/data/bricsLocalization';
import { normalizeLanguageCode } from '@/lib/uiLanguage';

/**
 * Field registry starts EMPTY. Fields appear only when a farm/plot is
 * registered (Supabase `farm_plots`) or an IoT sensor gateway reports real
 * telemetry — the app must never render synthetic demo fields.
 */
export const initialFields: Field3DData[] = [];

export const initialRecommendations: Recommendation3D[] = [];

export const initialAlerts: Alert3D[] = [];

export interface UserProfile {
  fullName: string;
  firstName: string;
  email: string;
  phone: string;
  country: string;
  countryFlag: string;
  state: string;
  language: string;
  role: string;
  farmName: string;
  farmLocation: string;
  totalLandSize: string;
  primaryCrop: string;
  initials: string;
  avatarUrl: string;
  plan: string;
  memberSince: string;
  currencySymbol: string;
  currencyCode: string;
  marketWeightUnit: string;
  /** Default benchmark coordinates (real place) used for live API calls. */
  defaultCoordinates: BRICSCountryConfig['defaultCoordinates'];
}

export function formatUserProfile(rawUser: any, rawFarm?: any): UserProfile {
  const fullName = (rawUser?.fullName || rawUser?.name || 'Farmer').trim();
  const firstName = fullName.split(' ')[0] || 'Farmer';
  const parts = fullName.split(/\s+/).filter(Boolean);
  const initials = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (parts[0]?.[0] || 'F').toUpperCase();
  
  const country = rawUser?.country || rawFarm?.country || 'India';
  const bricsConfig = getBRICSCountryConfig(country);

  const state = rawUser?.state || rawFarm?.state || bricsConfig.defaultLocation;
  // One source of truth: always a canonical BRICS code (`hi`, `pt-BR`,
  // `en-IN` …). Normalising here means legacy word values written by older
  // flows ("English", "hindi", "mandarin-simplified") are upgraded once and
  // every consumer — landing, dates, RTL, AI prompts — agrees on the choice.
  const language = normalizeLanguageCode(rawUser?.language);
  const role = rawUser?.role || 'Farmer';
  const farmName = (rawFarm?.farmName || rawUser?.farmName || (fullName !== 'Farmer' ? `${firstName}'s Farm` : 'My Farm')).trim();
  const farmLocation = rawFarm?.farmLocation || `${state}, ${bricsConfig.country}`;
  const totalLandSize = rawFarm?.totalLandSize ? `${rawFarm.totalLandSize} ${bricsConfig.landUnit}` : `5.0 ${bricsConfig.landUnit}`;
  const primaryCrop = rawFarm?.primaryCrop || 'Maize';
  const email = rawUser?.email || '';
  const phone = rawUser?.phoneNumber || rawUser?.phone || '';
  const plan = rawUser?.plan || 'Pro Farm Plan';
  const memberSince = rawUser?.memberSince || 'Member since 2026';
  const avatarUrl = rawUser?.avatarUrl || '/images/home/farmer_avatar.jpg';

  return {
    fullName,
    firstName,
    email,
    phone,
    country: bricsConfig.country,
    countryFlag: bricsConfig.flag,
    state,
    language,
    role,
    farmName,
    farmLocation,
    totalLandSize,
    primaryCrop,
    initials,
    avatarUrl,
    plan,
    memberSince,
    currencySymbol: bricsConfig.currencySymbol,
    currencyCode: bricsConfig.currencyCode,
    marketWeightUnit: bricsConfig.marketWeightUnit,
    defaultCoordinates: bricsConfig.defaultCoordinates,
  };
}

interface FarmContextType {
  fields: Field3DData[];
  selectedField: string | null;
  hoveredField: string | null;
  weatherMode: WeatherMode;
  irrigationActive: Record<string, boolean>;
  recommendations: Recommendation3D[];
  alerts: Alert3D[];
  liveMetrics: any;
  userProfile: UserProfile;
  selectField: (id: string | null) => void;
  setHoveredField: (id: string | null) => void;
  setWeatherMode: (mode: WeatherMode) => void;
  toggleIrrigation: (fieldId: string) => void;
  focusFieldByName: (fieldName: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  refreshUserProfile: () => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ children }: { children: React.ReactNode }) {
  const [fields, setFields] = useState<Field3DData[]>(initialFields);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [weatherMode, setWeatherMode] = useState<WeatherMode>('Sunny');
  const [liveMetrics, setLiveMetrics] = useState<any>(null);
  const [irrigationActive, setIrrigationActive] = useState<Record<string, boolean>>({
    'field-1': false,
    'field-2': true,
    'field-3': false,
    'field-4': true,
  });

  const [userProfile, setUserProfileState] = useState<UserProfile>(() => formatUserProfile({}));

  const refreshUserProfile = () => {
    if (typeof window !== 'undefined') {
      try {
        const u = JSON.parse(localStorage.getItem('floranet_user') || '{}');
        const f = JSON.parse(localStorage.getItem('floranet_farm') || '{}');
        setUserProfileState(formatUserProfile(u, f));
      } catch (e) {
        setUserProfileState(formatUserProfile({}));
      }
    }
  };

  useEffect(() => {
    refreshUserProfile();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'floranet_user' || e.key === 'floranet_farm') {
        refreshUserProfile();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfileState((prev) => {
      const merged = { ...prev, ...updates };
      const formatted = formatUserProfile(merged, updates);
      if (typeof window !== 'undefined') {
        localStorage.setItem('floranet_user', JSON.stringify(formatted));
      }
      return formatted;
    });
  };

  // Fetch real-time live telemetry from FastAPI backend (real data only).
  // The backend returns an empty field registry until a farm is registered,
  // so the 3D twin renders its explicit "no registered fields" state.
  useEffect(() => {
    async function loadLiveData() {
      try {
        const backendFields = await fetchFieldsTelemetry();
        if (backendFields && backendFields.length > 0) {
          cacheTelemetryLocally('fields_telemetry', backendFields);
          setFields(
            backendFields.map((bf: any, idx: number) => ({
              id: bf.id || `field-${idx + 1}`,
              name: bf.name || `Field ${idx + 1}`,
              crop: bf.crop || 'Unknown',
              area: bf.area_acres ? `${bf.area_acres} acres` : '—',
              healthScore: bf.health_score ?? 0,
              soilMoisture: bf.soil_moisture_pct ?? 0,
              irrigationStatus: bf.irrigation_status || 'Unknown',
              growthStage: bf.growth_stage || 'Unknown',
              riskLevel: bf.risk_level || 'Unknown',
              statusColor: bf.status_color || '#889B91',
              position: [-16 + (idx % 2) * 30, 0.2, 8 - Math.floor(idx / 2) * 22] as [number, number, number],
              dimensions: [18, 0.4, 16] as [number, number, number],
            }))
          );
        }

        const metrics = await fetchFarmMetrics();
        if (metrics) {
          cacheTelemetryLocally('farm_metrics', metrics);
          setLiveMetrics(metrics);
        }
      } catch (err) {
        // Keep empty registry; live metrics stay null → UI shows unavailable state.
        console.log('[FloraNet] Live telemetry unavailable:', err);
      }
    }

    loadLiveData();
  }, []);

  const selectField = (id: string | null) => {
    setSelectedField(id);
  };

  const toggleIrrigation = (fieldId: string) => {
    setIrrigationActive((prev) => {
      const nextActive = !prev[fieldId];
      // Asynchronously mutate backend telemetry with outbox queue fallback
      if (typeof window !== 'undefined') {
        if (!navigator.onLine) {
          queueOfflineMutation('TOGGLE_IRRIGATION', '/api/v1/farm/irrigation/toggle', {
            field_id: fieldId,
            active: nextActive,
          });
        } else {
          mutateFieldIrrigation(fieldId, nextActive).catch(() => {
            queueOfflineMutation('TOGGLE_IRRIGATION', '/api/v1/farm/irrigation/toggle', {
              field_id: fieldId,
              active: nextActive,
            });
          });
        }
      }
      return {
        ...prev,
        [fieldId]: nextActive,
      };
    });
  };

  const focusFieldByName = (fieldName: string) => {
    const found = fields.find(
      (f) => f.name.toLowerCase() === fieldName.toLowerCase() || f.crop.toLowerCase() === fieldName.toLowerCase()
    );
    if (found) {
      setSelectedField(found.id);
    }
  };

  return (
    <FarmContext.Provider
      value={{
        fields,
        selectedField,
        hoveredField,
        weatherMode,
        irrigationActive,
        recommendations: initialRecommendations,
        alerts: initialAlerts,
        liveMetrics,
        userProfile,
        selectField,
        setHoveredField,
        setWeatherMode,
        toggleIrrigation,
        focusFieldByName,
        updateUserProfile,
        refreshUserProfile,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}
