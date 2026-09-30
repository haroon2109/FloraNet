"use client";

import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode2, Globe, MapPin, Layers } from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { useToast } from '@/context/toastContext';

interface GeoJsonExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GeoJsonExportModal({ isOpen, onClose }: GeoJsonExportModalProps) {
  const { userProfile, fields } = useFarm();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Base coordinates around user's regional center
  const baseLat = userProfile.country === 'Brazil' ? -12.5432 : (userProfile.country === 'Russia' ? 51.6720 : 18.5204);
  const baseLng = userProfile.country === 'Brazil' ? -55.7214 : (userProfile.country === 'Russia' ? 39.1843 : 73.8567);

  const geoJsonData = {
    type: "FeatureCollection",
    metadata: {
      standard: "Open Geospatial Consortium (OGC) GeoJSON v1.0",
      generator: "FloraNet DPG Interoperability Node",
      timestamp: new Date().toISOString(),
      farmOwner: userProfile.fullName,
      farmName: userProfile.farmName,
      country: userProfile.country,
      crs: {
        type: "name",
        properties: {
          name: "urn:ogc:def:crs:OGC:1.3:CRS84"
        }
      }
    },
    features: fields.map((f, i) => {
      const offsetLat = (i * 0.0025);
      const offsetLng = (i * 0.0025);
      return {
        type: "Feature",
        id: f.id,
        properties: {
          parcel_id: f.id,
          name: f.name,
          crop: f.crop,
          area_acres: parseFloat(f.area || '2.0'),
          health_score: f.healthScore,
          soil_moisture_vwc: f.soilMoisture,
          irrigation_status: f.irrigationStatus,
          risk_level: f.riskLevel,
          loRa_telemetry_active: true,
        },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [baseLng + offsetLng, baseLat + offsetLat],
            [baseLng + offsetLng + 0.002, baseLat + offsetLat],
            [baseLng + offsetLng + 0.002, baseLat + offsetLat + 0.002],
            [baseLng + offsetLng, baseLat + offsetLat + 0.002],
            [baseLng + offsetLng, baseLat + offsetLat],
          ]]
        }
      };
    })
  };

  const geoJsonString = JSON.stringify(geoJsonData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(geoJsonString);
    setCopied(true);
    showToast("OGC GeoJSON copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadGeoJson = () => {
    const blob = new Blob([geoJsonString], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `floranet_${userProfile.farmName.toLowerCase().replace(/\s+/g, '_')}_parcels.geojson`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("GeoJSON parcel boundaries downloaded successfully!", "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-[24px] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[#DCE6DE] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#EEF3EF] flex items-center justify-between bg-[#F8FAF8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF5EC] text-[#075C32] flex items-center justify-center border border-[#C4E7D0]">
              <Globe size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#102A20] leading-tight">
                OGC GeoJSON & GIS Parcel Boundary Export
              </h2>
              <p className="text-[12px] text-[#55695F]">
                Standard Open Geospatial Consortium vector schema for QGIS, ArcGIS, and land registries
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#55695F] hover:text-[#102A20] hover:bg-[#EAEFEA] rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Metadata Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#F5FAF6] border border-[#C4E7D0] rounded-2xl text-[12.5px]">
            <div>
              <span className="text-[#6D8177] font-semibold block text-[11px] uppercase">Format</span>
              <span className="font-bold text-[#102A20]">OGC GeoJSON (WGS84)</span>
            </div>
            <div>
              <span className="text-[#6D8177] font-semibold block text-[11px] uppercase">Parcels</span>
              <span className="font-bold text-[#102A20]">{fields.length} Boundary Polygons</span>
            </div>
            <div>
              <span className="text-[#6D8177] font-semibold block text-[11px] uppercase">Coordinate System</span>
              <span className="font-mono font-bold text-[#102A20]">EPSG:4326</span>
            </div>
            <div>
              <span className="text-[#6D8177] font-semibold block text-[11px] uppercase">Compliance</span>
              <span className="font-bold text-[#075C32]">Digital Public Good</span>
            </div>
          </div>

          {/* Code Viewer Container */}
          <div className="relative">
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white/90 hover:bg-white text-[#102A20] rounded-xl text-[11.5px] font-bold border border-[#D5E3D8] flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                {copied ? <Check size={13} className="text-[#075C32]" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <pre className="w-full h-[280px] bg-[#0E1F18] text-emerald-300 font-mono text-[12px] p-4 rounded-2xl overflow-auto leading-relaxed border border-[#1B382C]">
              {geoJsonString}
            </pre>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#EEF3EF]">
            <p className="text-[12px] text-[#55695F]">
              Directly importable into QGIS, Google Earth Pro, and drone autopilot mapping software.
            </p>

            <button
              type="button"
              onClick={handleDownloadGeoJson}
              className="px-5 py-2.5 bg-[#075C32] hover:bg-[#064E2A] text-white rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-102"
            >
              <Download size={16} />
              <span>Download .geojson</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
