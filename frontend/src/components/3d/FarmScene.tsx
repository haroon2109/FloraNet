"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFarm } from '@/context/farmContext';
import { Sparkles, RotateCcw, Sun, CloudRain } from 'lucide-react';

// Custom Procedural Water GLSL Shader
const WaterShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color(0x38BDF8) },
    uColor2: { value: new THREE.Color(0x0284C7) },
  },
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;
    void main() {
      vUv = uv;
      vec3 pos = position;
      float elevation = sin(pos.x * 0.8 + uTime * 2.0) * 0.15 + cos(pos.z * 0.5 + uTime * 1.5) * 0.15;
      pos.y += elevation;
      vElevation = elevation;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec2 vUv;
    varying float vElevation;
    void main() {
      float mixFactor = (vElevation + 0.3) * 1.8;
      vec3 color = mix(uColor2, uColor1, clamp(mixFactor, 0.0, 1.0));
      gl_FragColor = vec4(color, 0.88);
    }
  `,
};

// Custom Procedural Vegetation Wind Sway GLSL Shader
const VegetationWindShader = {
  uniforms: {
    uTime: { value: 0 },
    uBaseColor: { value: new THREE.Color(0x087A45) },
  },
  vertexShader: `
    uniform float uTime;
    varying vec3 vNormal;
    void main() {
      vNormal = normal;
      vec3 pos = position;
      if (pos.y > 0.1) {
        float sway = sin(uTime * 3.0 + pos.x * 2.0) * 0.12;
        pos.x += sway;
        pos.z += sway * 0.5;
      }
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uBaseColor;
    varying vec3 vNormal;
    void main() {
      float light = dot(vNormal, normalize(vec3(0.5, 1.0, 0.5))) * 0.5 + 0.5;
      gl_FragColor = vec4(uBaseColor * light, 1.0);
    }
  `,
};

export default function FarmScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const {
    fields,
    selectedField,
    hoveredField,
    weatherMode,
    irrigationActive,
    selectField,
    setHoveredField,
    setWeatherMode,
    toggleIrrigation,
  } = useFarm();

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetCamPos = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 36, z: 48 });
  const targetLookAt = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (selectedField) {
      const fieldData = fields.find((f) => f.id === selectedField);
      if (fieldData) {
        targetCamPos.current = {
          x: fieldData.position[0],
          y: 16,
          z: fieldData.position[2] + 20,
        };
        targetLookAt.current = {
          x: fieldData.position[0],
          y: 1,
          z: fieldData.position[2],
        };
        return;
      }
    }

    targetCamPos.current = { x: 0, y: 36, z: 48 };
    targetLookAt.current = { x: 0, y: 0, z: 0 };
  }, [selectedField, fields]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(weatherMode === 'Rain' ? 0x94A3B8 : 0xF7FAF8);
    scene.fog = new THREE.FogExp2(weatherMode === 'Rain' ? 0x64748B : 0xF7FAF8, 0.012);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 36, 48);
    camera.lookAt(0, 0, 0);

    // 2. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, weatherMode === 'Rain' ? 0.45 : 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFFBEB, weatherMode === 'Rain' ? 0.35 : 1.4);
    sunLight.position.set(32, 48, 24);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // 4. Procedural Ground Base Plane
    const groundGeo = new THREE.PlaneGeometry(140, 100, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.9, flatShading: true });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Main Farm Road
    const roadGeo = new THREE.PlaneGeometry(5, 100);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x8D6E63, roughness: 0.95 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.05, 0);
    road.receiveShadow = true;
    scene.add(road);

    // 5. 3D Fields Group with Interactive Raycasting & Vegetation Wind Shaders
    const fieldMeshesGroup = new THREE.Group();
    scene.add(fieldMeshesGroup);

    const vegetationMaterials: THREE.ShaderMaterial[] = [];

    fields.forEach((f) => {
      const fieldGroup = new THREE.Group();
      fieldGroup.position.set(...f.position);

      // Soil Bed Mesh
      const fGeo = new THREE.BoxGeometry(...f.dimensions);
      const fMat = new THREE.MeshStandardMaterial({
        color: f.id === selectedField ? 0x168A45 : f.id === hoveredField ? 0x22C55E : f.statusColor,
        roughness: 0.7,
        metalness: 0.05,
        flatShading: true,
      });
      const fMesh = new THREE.Mesh(fGeo, fMat);
      fMesh.name = f.id;
      fMesh.receiveShadow = true;
      fMesh.castShadow = true;
      fieldGroup.add(fMesh);

      // Crop Rows with Custom Wind Shader Material
      const vegMat = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(VegetationWindShader.uniforms),
        vertexShader: VegetationWindShader.vertexShader,
        fragmentShader: VegetationWindShader.fragmentShader,
      });
      vegetationMaterials.push(vegMat);

      for (let r = -6; r <= 6; r += 2.4) {
        const rowGeo = new THREE.BoxGeometry(0.8, 0.4, f.dimensions[2] - 1.5);
        const rowMesh = new THREE.Mesh(rowGeo, vegMat);
        rowMesh.position.set(r, f.dimensions[1] / 2 + 0.18, 0);
        rowMesh.receiveShadow = true;
        rowMesh.castShadow = true;
        fieldGroup.add(rowMesh);
      }

      // Selection Frame
      if (f.id === selectedField) {
        const frameGeo = new THREE.BoxGeometry(f.dimensions[0] + 0.8, 0.2, f.dimensions[2] + 0.8);
        const frameMat = new THREE.MeshBasicMaterial({ color: 0x168A45, wireframe: true });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.y = f.dimensions[1] / 2 + 0.1;
        fieldGroup.add(frame);
      }

      fieldMeshesGroup.add(fieldGroup);
    });

    // 6. Procedural Flowing Water Canal (GLSL Shader)
    const waterUniforms = THREE.UniformsUtils.clone(WaterShader.uniforms);
    const waterMat = new THREE.ShaderMaterial({
      uniforms: waterUniforms,
      vertexShader: WaterShader.vertexShader,
      fragmentShader: WaterShader.fragmentShader,
      transparent: true,
    });
    const canalGeo = new THREE.PlaneGeometry(3, 60, 32, 32);
    const canal = new THREE.Mesh(canalGeo, waterMat);
    canal.rotation.x = -Math.PI / 2;
    canal.position.set(-2, 0.15, 0);
    scene.add(canal);

    // 7. Farmhouse & Windmill Structures
    const farmStructures = new THREE.Group();
    farmStructures.position.set(0, 0, -32);

    const house = new THREE.Mesh(
      new THREE.BoxGeometry(7, 4.5, 6),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.4 })
    );
    house.position.y = 2.25;
    house.castShadow = true;
    farmStructures.add(house);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(5.8, 3.2, 4),
      new THREE.MeshStandardMaterial({ color: 0xE84C3D, roughness: 0.3, flatShading: true })
    );
    roof.position.y = 5.85;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    farmStructures.add(roof);

    // Windmill
    const windmill = new THREE.Group();
    windmill.position.set(22, 0, -5);
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 2, 14, 8),
      new THREE.MeshStandardMaterial({ color: 0xE2E9E5, roughness: 0.5 })
    );
    tower.position.y = 7;
    tower.castShadow = true;
    windmill.add(tower);

    const bladeHub = new THREE.Group();
    bladeHub.position.set(0, 13.5, 1.1);
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 7, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
      );
      blade.position.y = 3.5;
      blade.rotation.z = (i * Math.PI) / 2;
      bladeHub.add(blade);
    }
    windmill.add(bladeHub);
    farmStructures.add(windmill);
    scene.add(farmStructures);

    // 8. Moving Tractor
    const tractor = new THREE.Group();
    tractor.position.set(0, 0.8, 12);
    const tChassis = new THREE.Mesh(
      new THREE.BoxGeometry(3, 1.6, 2),
      new THREE.MeshStandardMaterial({ color: 0x168A45 })
    );
    tChassis.castShadow = true;
    tractor.add(tChassis);
    scene.add(tractor);

    // 9. Raycasting Pointer Controls
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(fieldMeshesGroup.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.name && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.name) {
          setHoveredField(obj.name);
          return;
        }
      }
      setHoveredField(null);
    };

    const handleClick = () => {
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(fieldMeshesGroup.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.name && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.name) {
          selectField(obj.name);
        }
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Loop with Real-Time GLSL Shader Uniform Updates
    let animId: number;
    let clock = new THREE.Clock();
    let currentLookAt = new THREE.Vector3(0, 0, 0);

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Update Procedural Shader Uniforms
      waterUniforms.uTime.value = elapsed;
      vegetationMaterials.forEach((mat) => {
        mat.uniforms.uTime.value = elapsed;
      });

      bladeHub.rotation.z = elapsed * 1.5;
      tractor.position.z = Math.sin(elapsed * 0.4) * 18;

      camera.position.x += (targetCamPos.current.x - camera.position.x) * 0.05;
      camera.position.y += (targetCamPos.current.y - camera.position.y) * 0.05;
      camera.position.z += (targetCamPos.current.z - camera.position.z) * 0.05;

      currentLookAt.x += (targetLookAt.current.x - currentLookAt.x) * 0.05;
      currentLookAt.y += (targetLookAt.current.y - currentLookAt.y) * 0.05;
      currentLookAt.z += (targetLookAt.current.z - currentLookAt.z) * 0.05;
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [fields, selectedField, hoveredField, weatherMode]);

  const activeFieldData = fields.find((f) => f.id === (hoveredField || selectedField));

  return (
    <div className="relative w-full h-full min-h-[360px] rounded-[24px] overflow-hidden bg-[#F7FAF8]">
      
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-pointer" />

      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => selectField(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-xs border border-[#E1E7E3] hover:border-[#168A45] rounded-xl text-[12px] font-bold text-[#102A20] shadow-xs transition-all cursor-pointer"
        >
          <RotateCcw size={13} className="text-[#168A45]" />
          <span>Reset Camera</span>
        </button>

        <div className="flex items-center bg-white/90 backdrop-blur-xs border border-[#E1E7E3] rounded-xl p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setWeatherMode('Sunny')}
            className={`p-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
              weatherMode === 'Sunny' ? 'bg-[#EFF8F1] text-[#168A45]' : 'text-[#52645D]'
            }`}
          >
            <Sun size={13} />
            <span>Sunny</span>
          </button>
          <button
            type="button"
            onClick={() => setWeatherMode('Rain')}
            className={`p-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
              weatherMode === 'Rain' ? 'bg-[#E0F2FE] text-[#0284C7]' : 'text-[#52645D]'
            }`}
          >
            <CloudRain size={13} />
            <span>Rain</span>
          </button>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-xs border border-[#C4E7D0] rounded-full text-[11px] font-bold text-[#168A45] shadow-xs pointer-events-none">
        <Sparkles size={14} className="text-[#168A45]" />
        <span>Procedural Shader 3D Engine</span>
      </div>

      {activeFieldData && (
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-[#E1E7E3] rounded-2xl p-3.5 shadow-lg w-[260px] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[14px] font-bold text-[#102A20]">{activeFieldData.name}</h4>
            <span
              className="px-2 py-0.5 text-[10px] font-bold rounded-full text-white"
              style={{ backgroundColor: activeFieldData.statusColor }}
            >
              {activeFieldData.crop}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] mb-2.5">
            <div className="bg-[#F8FAF8] p-2 rounded-xl border border-[#EEF2EF]">
              <span className="text-[#889B91] font-semibold block">Health</span>
              <span className="text-[13px] font-bold text-[#102A20]">{activeFieldData.healthScore}/100</span>
            </div>
            <div className="bg-[#F8FAF8] p-2 rounded-xl border border-[#EEF2EF]">
              <span className="text-[#889B91] font-semibold block">Moisture</span>
              <span className="text-[13px] font-bold text-[#102A20]">{activeFieldData.soilMoisture}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#F0F4F1] text-[11px]">
            <span className="text-[#52645D] font-medium">Irrigation: <strong className="text-[#102A20]">{activeFieldData.irrigationStatus}</strong></span>
            <button
              type="button"
              onClick={() => toggleIrrigation(activeFieldData.id)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                irrigationActive[activeFieldData.id]
                  ? 'bg-[#168A45] text-white'
                  : 'bg-[#EFF8F1] text-[#168A45] hover:bg-[#168A45] hover:text-white'
              }`}
            >
              {irrigationActive[activeFieldData.id] ? 'Active 🌊' : 'Irrigate'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
