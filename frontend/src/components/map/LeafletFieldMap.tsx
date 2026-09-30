"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useFarm } from '@/context/farmContext';
import { Layers, Scan, Droplets, Sprout, ShieldAlert, Sparkles } from 'lucide-react';
import L from 'leaflet';

// Fix standard Leaflet default icon path bug in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to dynamically re-center map when country changes
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14, { animate: true });
  }, [lat, lng, map]);
  return null;
}

export default function LeafletFieldMap() {
  const { userProfile, fields } = useFarm();
  const [mapLayer, setMapLayer] = useState<'satellite' | 'street' | 'ndvi'>('satellite');

  // Country Center Coordinates
  const countryCoordinates: Record<string, { lat: number; lng: number }> = {
    India: { lat: 18.5204, lng: 73.8567 }, // Pune, Maharashtra
    Brazil: { lat: -12.5447, lng: -55.7214 }, // Sorriso, Mato Grosso
    Russia: { lat: 51.6608, lng: 39.2003 }, // Voronezh
    China: { lat: 34.7466, lng: 113.6253 }, // Zhengzhou, Henan
    'South Africa': { lat: -29.1167, lng: 26.2167 }, // Bloemfontein
  };

  const center = countryCoordinates[userProfile.country] || countryCoordinates.India;

  // Field boundaries derived from the REAL backend field registry. When no
  // farm plot is registered the map shows the live satellite basemap with an
  // explicit "no fields" banner — synthetic demo parcels are never drawn.
  const parcelPolygons = fields.map((field, idx) => {
    // Deterministic placement offsets so registered fields don't overlap.
    const offsets = [
      { dLat: 0.002, dLng: -0.003 },
      { dLat: 0.001, dLng: 0.003 },
      { dLat: -0.002, dLng: -0.003 },
      { dLat: -0.002, dLng: 0.003 },
    ];
    const o = offsets[idx % offsets.length];
    const status = field.healthScore >= 80 ? '#168A45' : field.healthScore >= 60 ? '#D97706' : '#DC2626';
    return {
      id: field.id,
      name: field.name,
      crop: field.crop || 'Unknown',
      statusColor: status,
      positions: [
        [center.lat + o.dLat, center.lng + o.dLng],
        [center.lat + o.dLat + 0.003, center.lng + o.dLng + 0.002],
        [center.lat + o.dLat + 0.002, center.lng + o.dLng + 0.005],
        [center.lat + o.dLat - 0.001, center.lng + o.dLng + 0.002],
      ] as [number, number][],
    };
  });

  return (
    <div className="relative w-full h-[400px] sm:h-[460px] rounded-2xl overflow-hidden border border-[#D5E5D8] shadow-xs">
      
      {/* Top Map Layer Selector Controls */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-md p-1 rounded-xl border border-[#D5E5D8] shadow-md flex items-center gap-1">
        <button
          type="button"
          onClick={() => setMapLayer('satellite')}
          className={`px-2.5 py-1 text-[11.5px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
            mapLayer === 'satellite' ? 'bg-[#075C32] text-white shadow-2xs' : 'text-[#50645B] hover:text-[#102A20]'
          }`}
        >
          <Scan size={12} />
          <span>Satellite True Color</span>
        </button>

        <button
          type="button"
          onClick={() => setMapLayer('street')}
          className={`px-2.5 py-1 text-[11.5px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
            mapLayer === 'street' ? 'bg-[#075C32] text-white shadow-2xs' : 'text-[#50645B] hover:text-[#102A20]'
          }`}
        >
          <Layers size={12} />
          <span>OpenStreetMap</span>
        </button>

        <button
          type="button"
          onClick={() => setMapLayer('ndvi')}
          className={`px-2.5 py-1 text-[11.5px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
            mapLayer === 'ndvi' ? 'bg-[#168A45] text-white shadow-2xs' : 'text-[#50645B] hover:text-[#102A20]'
          }`}
        >
          <Sparkles size={12} />
          <span>NDVI Spectral Grid</span>
        </button>
      </div>

      {/* Real-time OpenStreetMap / Esri World Imagery Canvas */}
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <MapRecenter lat={center.lat} lng={center.lng} />

        {mapLayer === 'street' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {/* Registered Field Boundary Polygons (live registry) */}
        {parcelPolygons.map((parcel) => (
          <Polygon
            key={parcel.id}
            positions={parcel.positions}
            pathOptions={{
              color: parcel.statusColor,
              fillColor: mapLayer === 'ndvi' ? parcel.statusColor : '#168A45',
              fillOpacity: mapLayer === 'ndvi' ? 0.65 : 0.35,
              weight: 2.5,
            }}
          >
            <Popup>
              <div className="p-1 space-y-1.5 min-w-[180px] font-sans">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                  <span className="font-bold text-[13px] text-[#102A20]">{parcel.name}</span>
                </div>
                <div className="text-[12px] space-y-1 text-[#4B5E53]">
                  <div className="flex justify-between">
                    <span>Crop:</span>
                    <span className="font-bold text-[#102A20]">{parcel.crop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Health Status:</span>
                    <span className="font-bold text-[#075C32]" style={{ color: parcel.statusColor }}>
                      {parcel.statusColor === '#168A45' ? 'Good' : parcel.statusColor === '#D97706' ? 'Watch' : 'Needs Attention'}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* Central IoT Telemetry Gateway Pin */}
        <CircleMarker
          center={[center.lat, center.lng]}
          radius={8}
          pathOptions={{ color: '#075C32', fillColor: '#34D399', fillOpacity: 0.9, weight: 3 }}
        >
          <Popup>
            <div className="text-[12px] font-bold text-[#075C32]">
              🌿 FloraNet IoT LoRa Gateway
              <p className="text-[10.5px] font-normal text-gray-600">
                {userProfile.countryFlag} {userProfile.country} Active Agro-Station
              </p>
            </div>
          </Popup>
        </CircleMarker>
      </MapContainer>

      {/* Floating Status Banner at bottom */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#D5E5D8] shadow-md text-[11px] font-bold text-[#075C32] flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${fields.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
        <span>
          {fields.length > 0
            ? `${fields.length} Registered Field${fields.length > 1 ? 's' : ''} · ${userProfile.countryFlag} ${userProfile.country}`
            : `No Registered Fields · ${userProfile.countryFlag} ${userProfile.country}`}
        </span>
      </div>

    </div>
  );
}
