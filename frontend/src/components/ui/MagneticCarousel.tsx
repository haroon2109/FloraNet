"use client";

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Layers, Droplets, Sparkles, ChevronLeft, ChevronRight, CheckCircle2, Info } from 'lucide-react';

export interface SoilType {
  id: string;
  name: string;
  category: string;
  color: string;
  bgGradient: string;
  pH: string;
  texture: string;
  moistureRetention: string;
  suitableCrops: string[];
  description: string;
  recommendedFertilizer: string;
}

export const soilTypesData: SoilType[] = [
  {
    id: 'alluvial',
    name: 'Alluvial Soil',
    category: 'Indo-Gangetic Plain',
    color: '#8D6E63',
    bgGradient: 'from-[#FAF4F0] to-[#EFE5DC]',
    pH: '6.5 – 7.5 (Neutral)',
    texture: 'Silty Loam / Clayey',
    moistureRetention: 'High (75%)',
    suitableCrops: ['Maize', 'Wheat', 'Sugarcane', 'Paddy'],
    description: 'Extremely fertile soil formed by river silt deposits. Rich in potash, phosphoric acid, and lime.',
    recommendedFertilizer: 'NPK 12:32:16 + Zinc Sulfate',
  },
  {
    id: 'black',
    name: 'Black Cotton Soil (Regur)',
    category: 'Deccan Trap Plateau',
    color: '#3E2723',
    bgGradient: 'from-[#F4EFEF] to-[#E5D7D7]',
    pH: '7.2 – 8.5 (Slightly Alkaline)',
    texture: 'Deep Clayey / Shrink-Swell',
    moistureRetention: 'Very High (88%)',
    suitableCrops: ['Cotton', 'Soybean', 'Wheat', 'Gram'],
    description: 'High clay content with high moisture retention capacity. Self-ploughing property during dry seasons.',
    recommendedFertilizer: 'Urea (46% N) + Single Super Phosphate',
  },
  {
    id: 'red-yellow',
    name: 'Red & Yellow Soil',
    category: 'Peninsular Region',
    color: '#D84315',
    bgGradient: 'from-[#FDF2F0] to-[#FADED9]',
    pH: '5.5 – 6.8 (Slightly Acidic)',
    texture: 'Sandy Loam / Porous',
    moistureRetention: 'Moderate (52%)',
    suitableCrops: ['Millets', 'Groundnut', 'Pulses', 'Potato'],
    description: 'Developed over crystalline igneous rocks. Rich in iron oxides giving a characteristic reddish hue.',
    recommendedFertilizer: 'DAP 18:46:0 + Organic Compost',
  },
  {
    id: 'laterite',
    name: 'Laterite Soil',
    category: 'Western Ghats & Hills',
    color: '#BF360C',
    bgGradient: 'from-[#FCF1EE] to-[#F7DCD5]',
    pH: '4.5 – 5.8 (Acidic)',
    texture: 'Coarse / Gravelly Clay',
    moistureRetention: 'Low to Moderate (45%)',
    suitableCrops: ['Tea', 'Coffee', 'Cashew', 'Rubber'],
    description: 'Formed under high rainfall and high temperature conditions. Requires lime application to balance acidity.',
    recommendedFertilizer: 'Rock Phosphate + Agricultural Lime',
  },
  {
    id: 'mountain',
    name: 'Mountain Forest Soil',
    category: 'Himalayan & Hill Ranges',
    color: '#2E7D32',
    bgGradient: 'from-[#F0F7F2] to-[#DDF0E2]',
    pH: '5.0 – 6.5 (Acidic to Neutral)',
    texture: 'Humus-Rich Loam',
    moistureRetention: 'High (80%)',
    suitableCrops: ['Apples', 'Spices', 'Tea', 'Saffron'],
    description: 'Rich in organic matter and humus accumulated from forest litter. Excellent structure for horticulture.',
    recommendedFertilizer: 'Vermicompost + Bio-fertilizers',
  },
  {
    id: 'desert',
    name: 'Arid Desert Soil',
    category: 'Arid North-West Plains',
    color: '#E65100',
    bgGradient: 'from-[#FFF8F0] to-[#FFE8D1]',
    pH: '7.5 – 8.8 (Alkaline)',
    texture: 'Coarse Sand / Saline',
    moistureRetention: 'Low (25%)',
    suitableCrops: ['Bajra', 'Mustard', 'Barley', 'Guar'],
    description: 'Low organic matter and high soluble salt concentration. Responds exceptionally well to drip irrigation.',
    recommendedFertilizer: 'Gypsum + Drip NPK Liquid Blend',
  },
];

interface MagneticCardProps {
  soil: SoilType;
  isSelected: boolean;
  onSelect: (soil: SoilType) => void;
}

function MagneticCard({ soil, isSelected, onSelect }: MagneticCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for magnetic spring cursor tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 18, stiffness: 220 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(soil)}
      className={`relative w-[280px] sm:w-[320px] shrink-0 p-5 rounded-[24px] border transition-shadow cursor-pointer select-none bg-gradient-to-br ${soil.bgGradient} ${
        isSelected
          ? 'border-[#168A45] shadow-[0_8px_30px_rgba(22,138,69,0.18)] scale-[1.02]'
          : 'border-[#E1E7E3] hover:border-[#168A45]/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
      }`}
    >
      {/* Selected Indicator Badge */}
      {isSelected && (
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-[#168A45] text-white text-[11px] font-bold rounded-full shadow-xs">
          <CheckCircle2 size={13} />
          <span>Selected</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-xs shrink-0"
          style={{ backgroundColor: soil.color }}
        >
          <Layers size={20} />
        </div>
        <div>
          <span className="text-[10px] font-bold text-[#647474] uppercase tracking-wider block">{soil.category}</span>
          <h3 className="text-[16px] font-bold text-[#102A2A] leading-tight">{soil.name}</h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-[12px] text-[#52645D] leading-relaxed mb-4 line-clamp-2 font-medium">
        {soil.description}
      </p>

      {/* Metadata Pill Specs */}
      <div className="space-y-2 pt-3 border-t border-black/5 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-[#647474] font-semibold">pH Level:</span>
          <span className="font-bold text-[#102A2A]">{soil.pH}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#647474] font-semibold">Moisture Retention:</span>
          <span className="font-bold text-[#168A45] flex items-center gap-1">
            <Droplets size={12} />
            {soil.moistureRetention}
          </span>
        </div>
      </div>

      {/* Suitable Crops Badges */}
      <div className="mt-4 pt-3 border-t border-black/5 flex flex-wrap gap-1.5">
        {soil.suitableCrops.map((crop) => (
          <span key={crop} className="px-2 py-0.5 bg-white/80 border border-black/10 rounded-full text-[10px] font-bold text-[#102A2A]">
            {crop}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function MagneticCarousel() {
  const [selectedSoil, setSelectedSoil] = useState<SoilType>(soilTypesData[0]);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-white border border-[#E1E7E3] rounded-[28px] p-6 shadow-[0_4px_25px_rgba(7,92,50,0.05)] mb-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="text-[#168A45]" size={20} />
            <h2 className="text-[20px] sm:text-[24px] font-bold text-[#102A2A]">
              Soil Type Selector (Magnetic Carousel)
            </h2>
          </div>
          <p className="text-[13px] font-medium text-[#647474]">
            Hover & magnetic-drag to explore soil classifications for your farm fields.
          </p>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={scrollLeft}
            className="w-9 h-9 rounded-full bg-[#F5F9F6] border border-[#E1E7E3] flex items-center justify-center text-[#102A2A] hover:bg-[#EFF8F1] hover:text-[#168A45] transition-colors cursor-pointer"
            aria-label="Scroll Left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            className="w-9 h-9 rounded-full bg-[#F5F9F6] border border-[#E1E7E3] flex items-center justify-center text-[#102A2A] hover:bg-[#EFF8F1] hover:text-[#168A45] transition-colors cursor-pointer"
            aria-label="Scroll Right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Magnetic Cards Horizontal Scroll Container */}
      <div 
        ref={carouselRef}
        className="flex items-center gap-4 overflow-x-auto hide-scrollbar py-3 px-1 scroll-smooth"
      >
        {soilTypesData.map((soil) => (
          <MagneticCard
            key={soil.id}
            soil={soil}
            isSelected={selectedSoil.id === soil.id}
            onSelect={(s) => setSelectedSoil(s)}
          />
        ))}
      </div>

      {/* Selected Soil Detailed Recommendation Drawer Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSoil.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="mt-6 p-5 rounded-[20px] bg-[#EFF8F1] border border-[#C4E7D0] flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
        >
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm mt-0.5"
              style={{ backgroundColor: selectedSoil.color }}
            >
              <Layers size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-[16px] font-bold text-[#102A2A]">Active Selected: {selectedSoil.name}</h4>
                <span className="px-2 py-0.5 bg-white text-[#168A45] text-[10px] font-bold rounded-full border border-[#C4E7D0]">
                  {selectedSoil.pH}
                </span>
              </div>
              <p className="text-[13px] text-[#52645D] leading-relaxed max-w-2xl">
                {selectedSoil.description} Recommended for <strong>{selectedSoil.suitableCrops.join(', ')}</strong>.
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#C4E7D0] shrink-0 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#168A45] uppercase tracking-wider mb-1">
              <Info size={13} />
              <span>Recommended Fertilizer Blend</span>
            </div>
            <p className="text-[13px] font-bold text-[#102A2A]">{selectedSoil.recommendedFertilizer}</p>
          </div>
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
