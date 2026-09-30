"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, X } from 'lucide-react';

export default function FieldPhoto() {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const images = [
    '/images/home/field_1_maize.jpg',
    '/images/home/field_2_wheat.jpg',
    '/images/home/field_3_vegetables.jpg',
    '/images/home/field_4_pulses.jpg',
  ];

  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <>
      <div className="bg-white border border-[#E1E8E4] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-[#102A2A]">Field Photo (Today)</h3>
          <button
            type="button"
            onClick={() => setIsFullScreen(true)}
            className="text-[12px] font-semibold text-[#087A45] hover:text-[#075B3A] transition-colors inline-flex items-center gap-1 shrink-0"
          >
            <span>View full screen</span>
            <ExternalLink size={13} strokeWidth={2} />
          </button>
        </div>

        {/* Main Photo */}
        <div className="relative w-full h-[220px] sm:h-[260px] rounded-xl overflow-hidden mb-3 border border-[#E1E8E4] shadow-xs">
          <Image 
            src={activeImage}
            alt="Field Photo Today"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1200px) 100vw, 800px"
          />
        </div>

        {/* 4 Thumbnails */}
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <button
              key={img}
              type="button"
              onClick={() => setActiveImage(img)}
              className={`relative h-[65px] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                activeImage === img ? 'border-[#087A45] ring-2 ring-[#EAF6EE]' : 'border-[#E1E8E4] opacity-80 hover:opacity-100'
              }`}
            >
              <Image 
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="150px"
              />
            </button>
          ))}
        </div>

      </div>

      {/* Full Screen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-[1000px] h-[80vh] bg-black rounded-2xl overflow-hidden">
            <button
              onClick={() => setIsFullScreen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
              aria-label="Close full screen"
            >
              <X size={20} />
            </button>
            <Image 
              src={activeImage}
              alt="Field Photo Full Screen"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}
