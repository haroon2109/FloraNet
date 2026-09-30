"use client";

import dynamic from "next/dynamic";

// Dynamically import the map component with SSR disabled
const Map = dynamic(
  () => import("./MapComponent"),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[500px] w-full rounded-xl bg-gray-100 animate-pulse flex items-center justify-center border">
        <p className="text-gray-400 font-medium">Loading geospatial data...</p>
      </div>
    )
  }
);

export default function MapViewer() {
  return <Map />;
}
