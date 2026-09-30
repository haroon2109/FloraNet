"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Globe, Radio, Sparkles, MapPin, ArrowRight, Activity, Droplets } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/apiConfig';

interface AgroHub {
  id: string;
  name: string;
  corridor: string;
  country: string;
  crop: string;
  lat: number;
  lng: number;
  bgColor: string;
}

/** Real agro-corridor benchmark coordinates — stats are fetched LIVE per hub. */
const agroHubs: AgroHub[] = [
  {
    id: 'deccan',
    name: 'Deccan Plateau Corridor',
    corridor: 'South Asian Semi-Arid Zone',
    country: 'India (Pune Valley)',
    crop: 'Maize, Sugarcane & Pulses',
    lat: 18.5204,
    lng: 73.8567,
    bgColor: '#168A45',
  },
  {
    id: 'cerrado',
    name: 'Cerrado Agro-Corridor',
    corridor: 'Tropical Savanna Zone',
    country: 'Brazil (Mato Grosso)',
    crop: 'Soybean, Cotton & Corn',
    lat: -12.6819,
    lng: -56.9211,
    bgColor: '#D97706',
  },
  {
    id: 'highveld',
    name: 'Highveld Agro-Corridor',
    corridor: 'Subtropical Grassland Zone',
    country: 'South Africa (Free State)',
    crop: 'Maize, Wheat & Sorghum',
    lat: -28.4541,
    lng: 26.7968,
    bgColor: '#1A73E8',
  },
  {
    id: 'voronezh',
    name: 'Chernozem Black Earth',
    corridor: 'Eurasian Steppe Belt',
    country: 'Russia (Voronezh)',
    crop: 'Winter Wheat & Sunflower',
    lat: 51.6755,
    lng: 39.2089,
    bgColor: '#8D6E63',
  },
  {
    id: 'heilongjiang',
    name: 'Northern Black Soils',
    corridor: 'Northeast Plain Granary',
    country: 'China (Heilongjiang)',
    crop: 'Japonica Rice & Soybeans',
    lat: 45.75,
    lng: 126.65,
    bgColor: '#2E7D32',
  },
];

// Custom Earth Shader for Photorealistic Specular & Night Glow
const EarthShader = {
  uniforms: {
    uTime: { value: 0 },
    uSunDirection: { value: new THREE.Vector3(1, 0.5, 1).normalize() },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform vec3 uSunDirection;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      float sunIntensity = max(dot(vNormal, uSunDirection), 0.0);
      vec3 dayColor = vec3(0.04, 0.22, 0.14); // Deep Agro Emerald
      vec3 nightColor = vec3(0.01, 0.04, 0.03); // Deep Space Night
      vec3 landColor = mix(nightColor, dayColor, sunIntensity * 0.85 + 0.15);

      // Atmosphere rim light effect
      vec3 viewDir = normalize(-vWorldPosition);
      float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
      vec3 rimGlow = vec3(0.2, 0.8, 0.5) * pow(rim, 3.0);

      gl_FragColor = vec4(landColor + rimGlow, 1.0);
    }
  `,
};

interface HubLiveStats {
  soc_percent?: number;
  moisture_pct?: number | null;
  loading: boolean;
  available: boolean;
}

const EMPTY_STATS: HubLiveStats = { loading: false, available: false };

export default function DigitalGlobe3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedHub, setSelectedHub] = useState<AgroHub>(agroHubs[0]);
  const [hubStats, setHubStats] = useState<Record<string, HubLiveStats>>({});

  // Fetch REAL soil stats (SoilGrids SOC + Open-Meteo moisture) for a hub.
  useEffect(() => {
    const cached = hubStats[selectedHub.id];
    if (cached && !cached.loading) return;
    let mounted = true;
    setHubStats((prev) => ({ ...prev, [selectedHub.id]: { ...prev[selectedHub.id], loading: true } }));
    fetch(`${getApiBaseUrl()}/api/v1/soil/live?lat=${selectedHub.lat}&lng=${selectedHub.lng}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!mounted) return;
        const sg = data?.soilgrids || {};
        setHubStats((prev) => ({
          ...prev,
          [selectedHub.id]: {
            loading: false,
            available: true,
            soc_percent: sg.soc_percent,
            moisture_pct: data?.layers?.['0_1cm']?.moisture_pct ?? null,
          },
        }));
      })
      .catch(() => {
        if (!mounted) return;
        setHubStats((prev) => ({ ...prev, [selectedHub.id]: EMPTY_STATS }));
      });
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHub.id]);

  const stats = hubStats[selectedHub.id];
  const statsLoading = stats?.loading === true;

  // Camera Target lerp vectors
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 24));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Lat/Lng to Vector3 conversion on unit sphere (radius R)
  const latLngToVector3 = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  const focusHub = (hub: AgroHub) => {
    setSelectedHub(hub);
    const posOnSphere = latLngToVector3(hub.lat, hub.lng, 6.2);
    // Position camera slightly offset from the hub point
    targetCamPos.current = posOnSphere.clone().multiplyScalar(2.6);
    targetLookAt.current = posOnSphere;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 24);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Photorealistic Earth Sphere with Procedural Shader
    const globeGroup = new THREE.Group();

    const earthGeo = new THREE.SphereGeometry(6, 64, 64);
    const earthMat = new THREE.ShaderMaterial({
      vertexShader: EarthShader.vertexShader,
      fragmentShader: EarthShader.fragmentShader,
      uniforms: THREE.UniformsUtils.clone(EarthShader.uniforms),
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // Grid Lines Layer
    const wireGeo = new THREE.SphereGeometry(6.05, 36, 36);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x168A45,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // Outer Glowing Atmosphere Mesh
    const atmosGeo = new THREE.SphereGeometry(6.35, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x4ADE80,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);

    // 3. Procedural Bezier Arcs Connecting BRICS Agro-Corridors
    const arcsGroup = new THREE.Group();
    const arcConnections = [
      [agroHubs[0], agroHubs[1]], // India -> Brazil
      [agroHubs[0], agroHubs[2]], // India -> South Africa
      [agroHubs[0], agroHubs[4]], // India -> China
      [agroHubs[0], agroHubs[3]], // India -> Russia
    ];

    arcConnections.forEach(([start, end]) => {
      const vStart = latLngToVector3(start.lat, start.lng, 6.05);
      const vEnd = latLngToVector3(end.lat, end.lng, 6.05);

      // Midpoint pulled outward for arc height curve
      const vMid = vStart.clone().add(vEnd).multiplyScalar(0.5).normalize().multiplyScalar(9.5);

      const curve = new THREE.QuadraticBezierCurve3(vStart, vMid, vEnd);
      const points = curve.getPoints(50);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0x38BDF8,
        transparent: true,
        opacity: 0.6,
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcsGroup.add(arcLine);
    });
    globeGroup.add(arcsGroup);

    // 4. Agro-Hub Marker Pins
    const pinGroup = new THREE.Group();
    agroHubs.forEach((hub) => {
      const pos = latLngToVector3(hub.lat, hub.lng, 6.12);

      const pinGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: hub.id === selectedHub.id ? 0x4ADE80 : 0x38BDF8 });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.name = hub.id;
      pinGroup.add(pinMesh);

      // Pulse Ring
      const rGeo = new THREE.RingGeometry(0.35, 0.45, 16);
      const rMat = new THREE.MeshBasicMaterial({ color: 0x4ADE80, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.position.copy(pos);
      rMesh.lookAt(0, 0, 0);
      pinGroup.add(rMesh);
    });
    globeGroup.add(pinGroup);

    scene.add(globeGroup);

    // 5. Raycasting Pointer Interactions
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(pinGroup.children);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const found = agroHubs.find((h) => h.id === hit.name);
        if (found) {
          focusHub(found);
        }
      }
    };

    container.addEventListener('click', handleClick);

    // 6. Animation Loop with Camera Easing
    let animId: number;
    let clock = new THREE.Clock();
    let currentLookAt = new THREE.Vector3(0, 0, 0);

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Slow idle globe rotation
      globeGroup.rotation.y = elapsed * 0.08;

      // Smooth Camera Easing to Selected Hub Lat/Lng Vector
      camera.position.x += (targetCamPos.current.x - camera.position.x) * 0.06;
      camera.position.y += (targetCamPos.current.y - camera.position.y) * 0.06;
      camera.position.z += (targetCamPos.current.z - camera.position.z) * 0.06;

      currentLookAt.x += (targetLookAt.current.x - currentLookAt.x) * 0.06;
      currentLookAt.y += (targetLookAt.current.y - currentLookAt.y) * 0.06;
      currentLookAt.z += (targetLookAt.current.z - currentLookAt.z) * 0.06;
      camera.lookAt(currentLookAt);

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
  }, [selectedHub]);

  return (
    <div className="relative w-full h-[480px] bg-[#071912] rounded-[28px] border border-[#168A45]/30 overflow-hidden shadow-2xl p-6 flex flex-col justify-between">
      
      {/* Top Bar Overlay */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#168A45]/20 border border-[#168A45]/40 backdrop-blur-md">
          <Globe size={16} className="text-[#4ADE80] animate-pulse" />
          <span className="text-[12px] font-bold text-white tracking-wide uppercase">
            A. BRICS "Agro-Earth" Globe (Hero & Policy View)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#4ADE80] bg-black/40 px-3 py-1 rounded-full border border-white/10">
          <Radio size={14} className="text-[#4ADE80]" />
          <span>Bezier Corridor Arcs Active (IND–BRA–ZAF–CHN–RUS)</span>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-pointer" />

      {/* Bottom Hub Satellite Telemetry Panel */}
      <div className="z-10 bg-black/75 backdrop-blur-md border border-[#168A45]/40 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Hub Title Info */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-md"
            style={{ backgroundColor: selectedHub.bgColor }}
          >
            <MapPin size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#4ADE80] uppercase tracking-wider">
                {selectedHub.corridor}
              </span>
              <span className="px-2 py-0.5 bg-white/10 text-[10px] font-bold text-white rounded-full">
                {selectedHub.country}
              </span>
            </div>
            <h3 className="text-[16px] font-bold text-white leading-tight">{selectedHub.name}</h3>
          </div>
        </div>

        {/* Live Satellite Metrics — real SoilGrids SOC + Open-Meteo moisture */}
        <div className="grid grid-cols-3 gap-3 text-[11px] w-full md:w-auto">
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
            <span className="text-white/60 font-semibold block">Sentinel-2 Scene</span>
            <span className="text-[14px] font-bold text-[#4ADE80]">10m Multispectral</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
            <span className="text-white/60 font-semibold block">Soil Organic Carbon</span>
            <span className="text-[14px] font-bold text-white">
              {stats?.soc_percent != null ? `${stats.soc_percent}%` : statsLoading ? '…' : '—'}
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
            <span className="text-white/60 font-semibold block">Soil Moisture (0-1cm)</span>
            <span className="text-[14px] font-bold text-[#38BDF8]">
              {stats?.moisture_pct != null ? `${stats.moisture_pct}%` : statsLoading ? '…' : '—'}
            </span>
          </div>
        </div>

        {/* Hub Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar max-w-full">
          {agroHubs.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => focusHub(h)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedHub.id === h.id
                  ? 'bg-[#168A45] text-white shadow-md'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {h.country.split(' ')[0]}
            </button>
          ))}
        </div>

      </div>

    </div>
  );
}
