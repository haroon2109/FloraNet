"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("./FieldMapComponent"),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[450px] w-full rounded-xl bg-gray-100 animate-pulse flex items-center justify-center border">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mb-3"></div>
          <p className="text-gray-500 font-medium text-sm">Initializing Geospatial Engine...</p>
        </div>
      </div>
    )
  }
);

interface FieldMapViewerProps {
  activeLayer: "base" | "ndvi" | "ndre" | "moisture";
}

export default function FieldMapViewer({ activeLayer }: FieldMapViewerProps) {
  return <MapComponent activeLayer={activeLayer} />;
}
