// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
// Need to import leaflet-draw for the L.Control.Draw plugin to attach to L
import "leaflet-draw";

interface FieldMapProps {
  activeLayer: "base" | "ndvi" | "ndre" | "moisture";
}

// A hook to add the draw control to the map
function DrawControl() {
  const map = useMap();

  useEffect(() => {
    // Initialize the FeatureGroup to store editable layers
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
        poly: {
          allowIntersection: false
        }
      },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true
        },
        polyline: false,
        circle: false,
        rectangle: true,
        marker: false,
        circlemarker: false
      }
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);
    });

    return () => {
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [map]);

  return null;
}

export default function FieldMapComponent({ activeLayer }: FieldMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  let filterStyle = "none";
  if (activeLayer === "ndvi") {
    filterStyle = "sepia(1) hue-rotate(90deg) saturate(3) contrast(1.2)";
  } else if (activeLayer === "ndre") {
    filterStyle = "sepia(1) hue-rotate(45deg) saturate(4) brightness(1.1)";
  } else if (activeLayer === "moisture") {
    filterStyle = "sepia(1) hue-rotate(180deg) saturate(3) brightness(0.9)";
  }

  return (
    <div className="h-[450px] w-full rounded-xl overflow-hidden shadow-lg border relative">
      <MapContainer 
        center={[20.5937, 78.9629]} // Center on India
        zoom={5} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <div style={{ filter: filterStyle, height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </div>
        
        {/* Adds drawing tools */}
        <DrawControl />

      </MapContainer>
      
      {/* Legend Overlay */}
      {activeLayer !== "base" && (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/90 p-2 rounded shadow-md text-xs border border-gray-200 pointer-events-none">
          <div className="font-bold mb-1 uppercase text-gray-800">
            {activeLayer === "ndvi" && "Vegetation Vigor"}
            {activeLayer === "ndre" && "Nitrogen / Chlorophyll"}
            {activeLayer === "moisture" && "Surface Moisture"}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-600 rounded"></div>
            <span className="text-[10px] text-gray-600 font-bold">Low &rarr; High</span>
          </div>
        </div>
      )}
    </div>
  );
}
