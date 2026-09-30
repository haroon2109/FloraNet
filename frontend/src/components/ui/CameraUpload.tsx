"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload } from "lucide-react";

export default function CameraUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 border rounded-xl shadow-sm bg-white">
      <h3 className="text-lg font-semibold mb-4 text-center">Capture Leaf Image</h3>
      
      {preview ? (
        <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
          <img src={preview} alt="Leaf preview" className="object-cover w-full h-full" />
          <button 
            onClick={() => setPreview(null)}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs px-2"
          >
            Retake
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300 mb-4"
        >
          <Camera size={48} className="text-gray-400 mb-2" />
          <span className="text-gray-500 text-sm font-medium">Tap to open camera</span>
        </div>
      )}

      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleCapture}
      />

      <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
        <Upload size={20} />
        Analyze Image
      </button>
    </div>
  );
}
