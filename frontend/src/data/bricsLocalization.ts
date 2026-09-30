/**
 * BRICS Country Localization — FloraNet
 *
 * Static per-country configuration (currency, units, administrative data)
 * plus DEFAULT GEO-COORDINATES for the capital-region benchmark used to pull
 * LIVE weather, soil and market data from real public APIs (Open-Meteo,
 * ISRIC SoilGrids, NASA EONET, Copernicus, World Bank WDI, Yahoo Finance).
 *
 * NOTE: There are deliberately NO hardcoded weather readings, mandi prices or
 * market sample data here. All displayed weather/soil/price values are fetched
 * live from the backend (which proxies the public APIs above). When live data
 * is unavailable, the UI must show an explicit unavailable state — never a
 * synthetic number.
 */

export interface BRICSCountryConfig {
  country:
    | 'Brazil' | 'Russia' | 'India' | 'China' | 'South Africa'
    | 'Egypt' | 'Ethiopia' | 'Iran' | 'UAE';
  flag: string;
  currencySymbol: string;
  currencyCode: string;
  marketWeightUnit: string;
  landUnit: 'acres' | 'hectares';
  defaultLocation: string;
  /** Default benchmark coordinates used for live API calls (real place). */
  defaultCoordinates: { lat: number; lng: number };
}

export const bricsCountryConfigs: Record<string, BRICSCountryConfig> = {
  India: {
    country: 'India',
    flag: '🇮🇳',
    currencySymbol: '₹',
    currencyCode: 'INR',
    marketWeightUnit: '/quintal',
    landUnit: 'acres',
    defaultLocation: 'Pune, Maharashtra',
    defaultCoordinates: { lat: 18.5204, lng: 73.8567 },
  },
  Brazil: {
    country: 'Brazil',
    flag: '🇧🇷',
    currencySymbol: 'R$',
    currencyCode: 'BRL',
    marketWeightUnit: '/saca (60kg)',
    landUnit: 'hectares',
    defaultLocation: 'Sorriso, Mato Grosso',
    defaultCoordinates: { lat: -12.5459, lng: -55.7113 },
  },
  Russia: {
    country: 'Russia',
    flag: '🇷🇺',
    currencySymbol: '₽',
    currencyCode: 'RUB',
    marketWeightUnit: '/ton',
    landUnit: 'hectares',
    defaultLocation: 'Voronezh, Chernozem Belt',
    defaultCoordinates: { lat: 51.6720, lng: 39.1843 },
  },
  China: {
    country: 'China',
    flag: '🇨🇳',
    currencySymbol: '¥',
    currencyCode: 'CNY',
    marketWeightUnit: '/ton',
    landUnit: 'hectares',
    defaultLocation: 'Zhengzhou, Henan',
    defaultCoordinates: { lat: 34.7466, lng: 113.6254 },
  },
  'South Africa': {
    country: 'South Africa',
    flag: '🇿🇦',
    currencySymbol: 'R',
    currencyCode: 'ZAR',
    marketWeightUnit: '/tonne',
    landUnit: 'hectares',
    defaultLocation: 'Bloemfontein, Free State',
    defaultCoordinates: { lat: -29.0852, lng: 26.1596 },
  },
  Egypt: {
    country: 'Egypt',
    flag: '🇪🇬',
    currencySymbol: 'E£',
    currencyCode: 'EGP',
    marketWeightUnit: '/tonne',
    landUnit: 'hectares',
    defaultLocation: 'Zagazig, Nile Delta',
    defaultCoordinates: { lat: 30.5877, lng: 31.5020 },
  },
  Ethiopia: {
    country: 'Ethiopia',
    flag: '🇪🇹',
    currencySymbol: 'Br',
    currencyCode: 'ETB',
    marketWeightUnit: '/quintal',
    landUnit: 'hectares',
    defaultLocation: 'Adama, Oromia',
    defaultCoordinates: { lat: 8.5400, lng: 39.2700 },
  },
  Iran: {
    country: 'Iran',
    flag: '🇮🇷',
    currencySymbol: '﷼',
    currencyCode: 'IRR',
    marketWeightUnit: '/ton',
    landUnit: 'hectares',
    defaultLocation: 'Mashhad, Razavi Khorasan',
    defaultCoordinates: { lat: 36.2605, lng: 59.6168 },
  },
  UAE: {
    country: 'UAE',
    flag: '🇦🇪',
    currencySymbol: 'Dh',
    currencyCode: 'AED',
    marketWeightUnit: '/tonne',
    landUnit: 'hectares',
    defaultLocation: 'Al Ain, Abu Dhabi',
    defaultCoordinates: { lat: 24.2075, lng: 55.7447 },
  },
};

export function getBRICSCountryConfig(countryName?: string): BRICSCountryConfig {
  if (!countryName) return bricsCountryConfigs.India;
  const raw = countryName.trim().toLowerCase();
  if (raw === 'in' || raw === 'india') return bricsCountryConfigs.India;
  if (raw === 'br' || raw === 'brazil') return bricsCountryConfigs.Brazil;
  if (raw === 'ru' || raw === 'russia') return bricsCountryConfigs.Russia;
  if (raw === 'cn' || raw === 'china') return bricsCountryConfigs.China;
  if (raw === 'za' || raw === 'south africa' || raw === 'southafrica') return bricsCountryConfigs['South Africa'];
  if (raw === 'eg' || raw === 'egypt') return bricsCountryConfigs.Egypt;
  if (raw === 'et' || raw === 'ethiopia') return bricsCountryConfigs.Ethiopia;
  if (raw === 'ir' || raw === 'iran') return bricsCountryConfigs.Iran;
  if (raw === 'ae' || raw === 'uae' || raw === 'united arab emirates') return bricsCountryConfigs.UAE;
  return bricsCountryConfigs.India;
}
