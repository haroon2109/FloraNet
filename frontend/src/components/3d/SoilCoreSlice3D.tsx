"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers, Droplets, Sparkles, Activity, Thermometer, ShieldCheck } from 'lucide-react';

/**
 * Live soil-strata telemetry. Values are fetched from public open APIs:
 *  - Open-Meteo   → soil moisture & temperature (0-1cm / 3-9cm, real model output)
 *  - ISRIC SoilGrids 2.0 → SOC, clay & sand fractions at the farm point
 * Values that no open API provides (mycorrhizal activity, bedrock mineralogy,
 * per-horizon drainage) are rendered as an explicit "not measured" state —
 * never fabricated.
 */
interface SoilDepthReading {
  topsoilMoisture: number | null; // % 0-1cm (Open-Meteo)
  topsoilTemp: number | null; // °C 0cm (Open-Meteo)
  subsoilMoisture: number | null; // % 3-9cm (Open-Meteo)
  subsoilTemp: number | null; // °C 6cm (Open-Meteo)
  socDensity: string | null; // g/kg (SoilGrids 0-5cm)
  clayPct: number | null; // g/kg → % (SoilGrids)
  sandPct: number | null; // g/kg → % (SoilGrids)
  siltPct: number | null; // remainder (SoilGrids)
}

const NOT_MEASURED = '—';

const defaultDepthReading: SoilDepthReading = {
  topsoilMoisture: null,
  topsoilTemp: null,
  subsoilMoisture: null,
  subsoilTemp: null,
  socDensity: null,
  clayPct: null,
  sandPct: null,
  siltPct: null,
};

export default function SoilCoreSlice3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isExploded, setIsExploded] = useState<boolean>(true);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0); // 0: Topsoil, 1: Subsoil, 2: Deep Parent Rock
  const [telemetry, setTelemetry] = useState<SoilDepthReading>(defaultDepthReading);

  // Fetch live Open-Meteo & SoilGrids telemetry (real values only; no fallback numbers)
  useEffect(() => {
    let mounted = true;
    async function fetchLiveSoilData() {
      try {
        const [meteoRes, sgRes] = await Promise.all([
          fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&hourly=soil_temperature_0cm,soil_temperature_6cm,soil_moisture_0_to_1cm,soil_moisture_3_to_9cm&forecast_days=1'
          ),
          fetch(
            'https://rest.isric.org/soilgrids/v2.0/properties/query?lon=73.8567&lat=18.5204&property=soc&property=clay&property=sand&depth=0-5cm'
          ),
        ]);

        const next: SoilDepthReading = { ...defaultDepthReading };

        if (meteoRes.ok) {
          const data = await meteoRes.json();
          if (data.hourly) {
            const topM = data.hourly.soil_moisture_0_to_1cm?.[0];
            const subM = data.hourly.soil_moisture_3_to_9cm?.[0];
            const topT = data.hourly.soil_temperature_0cm?.[0];
            const subT = data.hourly.soil_temperature_6cm?.[0];
            if (typeof topM === 'number') next.topsoilMoisture = Math.round(topM * 100);
            if (typeof subM === 'number') next.subsoilMoisture = Math.round(subM * 100);
            if (typeof topT === 'number') next.topsoilTemp = Math.round(topT * 10) / 10;
            if (typeof subT === 'number') next.subsoilTemp = Math.round(subT * 10) / 10;
          }
        }

        if (sgRes.ok) {
          const sg = await sgRes.json();
          const layers: Array<{ name: string; depths: Array<{ values: { mean: number | null } }> }> =
            sg?.properties?.layers ?? [];
          for (const layer of layers) {
            const mean = layer.depths?.[0]?.values?.mean;
            if (mean == null) continue;
            if (layer.name === 'soc') next.socDensity = `${Math.round(mean)} g/kg`;
            if (layer.name === 'clay') next.clayPct = Math.round(mean / 10); // g/kg → %
            if (layer.name === 'sand') next.sandPct = Math.round(mean / 10); // g/kg → %
          }
          if (next.clayPct != null && next.sandPct != null) {
            next.siltPct = Math.max(0, 100 - next.clayPct - next.sandPct);
          }
        }

        if (mounted) setTelemetry(next);
      } catch (err) {
        console.warn('Live soil telemetry unavailable — values will show as “not measured”:', err);
      }
    }

    fetchLiveSoilData();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF7FAF8);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(11, 12, 17);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const amb = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(amb);

    const dir = new THREE.DirectionalLight(0xffffff, 1.3);
    dir.position.set(12, 22, 12);
    dir.castShadow = true;
    scene.add(dir);

    // 3. Extruded Cylindrical Soil Core Strata Group
    const coreGroup = new THREE.Group();

    // Topsoil Layer (0–5cm)
    const topGeo = new THREE.CylinderGeometry(4, 4, 1.5, 32);
    const topWetness = (telemetry.topsoilMoisture ?? 0) / 100;
    const topMat = new THREE.MeshStandardMaterial({
      color: 0x3E2723,
      roughness: 0.9 - topWetness * 0.4,
      metalness: 0.05 + topWetness * 0.2,
      flatShading: true,
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.name = 'topsoil';
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    coreGroup.add(topMesh);

    // Subsoil Layer (5–30cm)
    const subGeo = new THREE.CylinderGeometry(4, 4, 2.8, 32);
    const subMat = new THREE.MeshStandardMaterial({
      color: 0x6D4C41,
      roughness: 0.8,
      flatShading: true,
    });
    const subMesh = new THREE.Mesh(subGeo, subMat);
    subMesh.name = 'subsoil';
    subMesh.castShadow = true;
    subMesh.receiveShadow = true;
    coreGroup.add(subMesh);

    // Deep Bedrock Layer (30cm+)
    const deepGeo = new THREE.CylinderGeometry(4, 4, 2.2, 32);
    const deepMat = new THREE.MeshStandardMaterial({
      color: 0x8D6E63,
      roughness: 0.95,
      flatShading: true,
    });
    const deepMesh = new THREE.Mesh(deepGeo, deepMat);
    deepMesh.name = 'bedrock';
    deepMesh.castShadow = true;
    deepMesh.receiveShadow = true;
    coreGroup.add(deepMesh);

    // 4. Topsoil Live Moisture Particle System (3D Points)
    const particleCount = 60;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rad = Math.random() * 3.6;
      pPositions[i * 3] = Math.cos(angle) * rad;
      pPositions[i * 3 + 1] = Math.random() * 1.8;
      pPositions[i * 3 + 2] = Math.sin(angle) * rad;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x38BDF8,
      size: 0.25,
      transparent: true,
      opacity: 0.8,
    });
    const moistureParticles = new THREE.Points(pGeo, pMat);
    topMesh.add(moistureParticles);

    // 5. Subsoil Fungal Mycorrhizal Network Lines (3D LineSegments)
    const lineCount = 40;
    const linePositions: number[] = [];
    for (let i = 0; i < lineCount; i++) {
      const x1 = (Math.random() - 0.5) * 6;
      const y1 = (Math.random() - 0.5) * 2;
      const z1 = (Math.random() - 0.5) * 6;
      const x2 = x1 + (Math.random() - 0.5) * 1.5;
      const y2 = y1 + (Math.random() - 0.5) * 1.5;
      const z2 = z1 + (Math.random() - 0.5) * 1.5;
      linePositions.push(x1, y1, z1, x2, y2, z2);
    }
    const mycoGeo = new THREE.BufferGeometry();
    mycoGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const mycoMat = new THREE.LineBasicMaterial({ color: 0x4ADE80, transparent: true, opacity: 0.75 });
    const mycoNetwork = new THREE.LineSegments(mycoGeo, mycoMat);
    subMesh.add(mycoNetwork);

    scene.add(coreGroup);

    // Raycaster Interaction
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(coreGroup.children);

      if (intersects.length > 0) {
        const hitName = intersects[0].object.name;
        if (hitName === 'topsoil') setSelectedLayerIndex(0);
        else if (hitName === 'subsoil') setSelectedLayerIndex(1);
        else if (hitName === 'bedrock') setSelectedLayerIndex(2);
      }
    };

    container.addEventListener('click', handleClick);

    // 6. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Vertical "Explode" Strata Separation Animation
      const topTargetY = isExploded ? 2.8 : 1.5;
      const subTargetY = 0;
      const deepTargetY = isExploded ? -2.8 : -1.5;

      topMesh.position.y += (topTargetY - topMesh.position.y) * 0.08;
      subMesh.position.y += (subTargetY - subMesh.position.y) * 0.08;
      deepMesh.position.y += (deepTargetY - deepMesh.position.y) * 0.08;

      // Animate Moisture Particles floating up
      const posArr = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 1] += 0.015;
        if (posArr[i * 3 + 1] > 2.2) {
          posArr[i * 3 + 1] = 0;
        }
      }
      pGeo.attributes.position.needsUpdate = true;

      coreGroup.rotation.y = elapsed * 0.15;
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isExploded, telemetry]);

  return (
    <div className="relative w-full h-[480px] bg-white rounded-[28px] border border-[#E1E7E3] overflow-hidden shadow-sm p-6 flex flex-col justify-between">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF8F1] border border-[#C4E7D0]">
          <Layers size={16} className="text-[#168A45]" />
          <span className="text-[12px] font-bold text-[#168A45] tracking-wide uppercase">
            B. 3D "Digital Soil Core" Strata Inspector
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExploded(!isExploded)}
            className="px-3.5 py-1.5 bg-[#FAFCFA] hover:bg-[#EFF8F1] border border-[#E1E7E3] rounded-xl text-[12px] font-bold text-[#102A20] transition-colors cursor-pointer shadow-xs"
          >
            {isExploded ? 'Compact View' : 'Explode Strata 💥'}
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-pointer" />

      {/* Bottom Live Telemetry & Science Data Card */}
      <div className="z-10 bg-white/95 backdrop-blur-md border border-[#E1E7E3] p-4 rounded-2xl shadow-lg">
        
        {/* Layer Selector Tabs */}
        <div className="flex items-center gap-1.5 mb-3 border-b border-[#EEF2EF] pb-2">
          <button
            type="button"
            onClick={() => setSelectedLayerIndex(0)}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
              selectedLayerIndex === 0 ? 'bg-[#168A45] text-white' : 'text-[#52645D] hover:bg-[#F5F9F6]'
            }`}
          >
            Topsoil (0–5cm) 💧
          </button>
          <button
            type="button"
            onClick={() => setSelectedLayerIndex(1)}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
              selectedLayerIndex === 1 ? 'bg-[#168A45] text-white' : 'text-[#52645D] hover:bg-[#F5F9F6]'
            }`}
          >
            Subsoil (5–30cm) 🍄
          </button>
          <button
            type="button"
            onClick={() => setSelectedLayerIndex(2)}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
              selectedLayerIndex === 2 ? 'bg-[#168A45] text-white' : 'text-[#52645D] hover:bg-[#F5F9F6]'
            }`}
          >
            Bedrock (30cm+)
          </button>
        </div>

        {/* Tab 0: Topsoil Details */}
        {selectedLayerIndex === 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-[15px] font-bold text-[#102A20]">Topsoil Layer (0–5cm)</h4>
              <span className="text-[12px] font-bold text-[#168A45]">Live Open-Meteo Sync</span>
            </div>
            <p className="text-[12px] text-[#52645D] leading-relaxed mb-3">
              Surface horizon featuring live 3D moisture particle dynamics, high organic matter, and active root germination.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-[#FAFCFA] border border-[#E1E7E3] p-2 rounded-xl">
                <span className="text-[#889B91] font-semibold block">Moisture %</span>
                <span className="text-[13px] font-bold text-[#38BDF8]">{telemetry.topsoilMoisture != null ? `${telemetry.topsoilMoisture}%` : NOT_MEASURED}</span>
              </div>
              <div className="bg-[#FAFCFA] border border-[#E1E7E3] p-2 rounded-xl">
                <span className="text-[#889B91] font-semibold block">Temp (°C)</span>
                <span className="text-[13px] font-bold text-[#102A20]">{telemetry.topsoilTemp != null ? `${telemetry.topsoilTemp}°C` : NOT_MEASURED}</span>
              </div>
              <div className="bg-[#FAFCFA] border border-[#E1E7E3] p-2 rounded-xl">
                <span className="text-[#889B91] font-semibold block">NDVI Vigor</span>
                <span className="text-[13px] font-bold text-[#52645D]">Needs raster access</span>
              </div>
              <div className="bg-[#FAFCFA] border border-[#E1E7E3] p-2 rounded-xl">
                <span className="text-[#889B91] font-semibold block">Wetness Shader</span>
                <span className="text-[13px] font-bold text-[#102A20]">Live-driven</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Subsoil Details */}
        {selectedLayerIndex === 1 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-[15px] font-bold text-[#102A20]">Subsoil Layer (5–30cm)</h4>
              <span className="text-[12px] font-bold text-[#4ADE80]">SoilGrids API Hooked</span>
            </div>
            <p className="text-[12px] text-[#52645D] leading-relaxed mb-3">
              Subsurface horizon displaying Soil Organic Carbon (SOC) density, clay/sand/silt ratio, and glowing 3D fungal mycorrhizal network lines.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-[#FAFCFA] border border-[#E1E7E3] p-2 rounded-xl">
                <span className="text-[#889B91] font-semibold block">SOC Density</span>
                <span className="text-[13px] font-bold text-[#168A45]">{telemetry.socDensity ?? NOT_MEASURED}</span>
              </div>
              <div className="bg-[#FAFCFA] border border-[#E1E7E3] p-2 rounded-xl">
                <span className="text-[#889B91] font-semibold block">Clay / Sand / Silt</span>
                <span className="text-[13px] font-bold text-[#102A20]">{telemetry.siltPct != null ? `${telemetry.clayPct}% / ${telemetry.sandPct}% / ${telemetry.siltPct}%` : NOT_MEASURED}</span>
              </div>
              <div className="bg-[#FAFCFA] border border-[#E1E7E3] p-2 rounded-xl">
                <span className="text-[#889B91] font-semibold block">Subsoil Moisture</span>
                <span className="text-[13px] font-bold text-[#38BDF8]">{telemetry.subsoilMoisture != null ? `${telemetry.subsoilMoisture}%` : NOT_MEASURED}</span>
              </div>
              <div className="bg-[#FAFCFA] border border-[#E1E7E3] p-2 rounded-xl">
                <span className="text-[#889B91] font-semibold block">Mycorrhizal Activity</span>
                <span className="text-[13px] font-bold text-[#52645D]">Not measured</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bedrock Details */}
        {selectedLayerIndex === 2 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-[15px] font-bold text-[#102A20]">Bedrock Parent Layer (30cm+)</h4>
              <span className="text-[12px] font-bold text-[#889B91]">Basal Foundation</span>
            </div>
            <p className="text-[12px] text-[#52645D] leading-relaxed mb-3">
              Weathered parent mineral layer providing natural aquifer filtration and structural soil drainage base.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-[#FAFCFA] border border-[#E1E7E3] p-2 rounded-xl">
                <span className="text-[#889B91] font-semibold block">Mineral Content</span>
                <span className="text-[13px] font-bold text-[#52645D]">Requires core sample</span>
              </div>
              <div className="bg-[#FAFCFA] border border-[#E1E7E3] p-2 rounded-xl">
                <span className="text-[#889B91] font-semibold block">pH Level</span>
                <span className="text-[13px] font-bold text-[#52645D]">SoilGrids: 5cm band only</span>
              </div>
              <div className="bg-[#FAFCFA] border border-[#E1E7E3] p-2 rounded-xl">
                <span className="text-[#889B91] font-semibold block">Drainage Rate</span>
                <span className="text-[13px] font-bold text-[#52645D]">Not measured</span>
              </div>
              <div className="bg-[#FAFCFA] border border-[#E1E7E3] p-2 rounded-xl">
                <span className="text-[#889B91] font-semibold block">Subsurface Temp</span>
                <span className="text-[13px] font-bold text-[#102A20]">{telemetry.subsoilTemp != null ? `${telemetry.subsoilTemp}°C` : NOT_MEASURED}</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
