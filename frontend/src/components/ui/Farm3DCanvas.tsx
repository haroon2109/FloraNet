"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Farm3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF7FAF8);
    scene.fog = new THREE.FogExp2(0xF7FAF8, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 18, 35);
    camera.lookAt(0, 4, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFF7E0, 1.2);
    sunLight.position.set(30, 40, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xEAF6EE, 0.4);
    fillLight.position.set(-20, 20, -10);
    scene.add(fillLight);

    // 4. Ground / Rolling Farm Hills Terrain
    const groundGroup = new THREE.Group();
    scene.add(groundGroup);

    // Main Field Plane
    const groundGeo = new THREE.PlaneGeometry(120, 80, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x168A45,
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    groundGroup.add(ground);

    // Crop Rows (3D parallel raised stripes)
    const cropRowMat = new THREE.MeshStandardMaterial({ color: 0x087A45, roughness: 0.7 });
    for (let i = -25; i <= 25; i += 3.5) {
      const cropRowGeo = new THREE.BoxGeometry(0.8, 0.25, 60);
      const cropRow = new THREE.Mesh(cropRowGeo, cropRowMat);
      cropRow.position.set(i, 0.12, 0);
      cropRow.receiveShadow = true;
      groundGroup.add(cropRow);
    }

    // Distant Rolling Mountain Hills
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x2E6B4B, roughness: 0.9, flatShading: true });
    for (let i = 0; i < 5; i++) {
      const hillGeo = new THREE.ConeGeometry(15 + i * 4, 12 + i * 2, 6);
      const hill = new THREE.Mesh(hillGeo, hillMat);
      hill.position.set(-45 + i * 22, 4, -30 - (i % 2) * 5);
      hill.castShadow = true;
      groundGroup.add(hill);
    }

    // 5. 3D Farmhouse
    const houseGroup = new THREE.Group();
    houseGroup.position.set(-14, 0, -8);

    // Base Walls
    const wallGeo = new THREE.BoxGeometry(6, 4, 5);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 });
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    houseGroup.add(walls);

    // Roof
    const roofGeo = new THREE.ConeGeometry(5.2, 3, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xE84C3D, roughness: 0.4, flatShading: true });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 5.2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    houseGroup.add(roof);

    // Silo (Cylinder next to farmhouse)
    const siloGeo = new THREE.CylinderGeometry(1.5, 1.5, 8, 16);
    const siloMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.3, roughness: 0.3 });
    const silo = new THREE.Mesh(siloGeo, siloMat);
    silo.position.set(5.5, 4, 0);
    silo.castShadow = true;
    houseGroup.add(silo);

    const siloCapGeo = new THREE.SphereGeometry(1.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const siloCap = new THREE.Mesh(siloCapGeo, siloMat);
    siloCap.position.set(5.5, 8, 0);
    houseGroup.add(siloCap);

    scene.add(houseGroup);

    // 6. 3D Windmill with Animated Blades
    const windmillGroup = new THREE.Group();
    windmillGroup.position.set(16, 0, -12);

    const towerGeo = new THREE.CylinderGeometry(0.8, 1.6, 12, 8);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xE2E9E5, roughness: 0.6 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 6;
    tower.castShadow = true;
    windmillGroup.add(tower);

    const bladeHubGroup = new THREE.Group();
    bladeHubGroup.position.set(0, 11.5, 0.9);

    const hubGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x075B3A });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    bladeHubGroup.add(hub);

    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.3 });
    for (let i = 0; i < 4; i++) {
      const bladeGeo = new THREE.BoxGeometry(0.4, 6, 0.08);
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.y = 3;
      blade.rotation.z = (i * Math.PI) / 2;
      bladeHubGroup.add(blade);
    }

    windmillGroup.add(bladeHubGroup);
    scene.add(windmillGroup);

    // 7. 3D Green Tractor
    const tractorGroup = new THREE.Group();
    tractorGroup.position.set(8, 0, 5);

    // Chassis
    const chassisGeo = new THREE.BoxGeometry(3.5, 1.8, 2.2);
    const tractorMat = new THREE.MeshStandardMaterial({ color: 0x168A45, roughness: 0.4 });
    const chassis = new THREE.Mesh(chassisGeo, tractorMat);
    chassis.position.y = 1.4;
    chassis.castShadow = true;
    tractorGroup.add(chassis);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(1.8, 1.6, 1.8);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2, transparent: true, opacity: 0.85 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(-0.6, 2.8, 0);
    cabin.castShadow = true;
    tractorGroup.add(cabin);

    // Big Rear Wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xF5A900 });

    for (const z of [-1.2, 1.2]) {
      const rearWheelGroup = new THREE.Group();
      rearWheelGroup.position.set(-0.8, 1.2, z);

      const rWheelGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 16);
      const rWheel = new THREE.Mesh(rWheelGeo, wheelMat);
      rWheel.rotation.x = Math.PI / 2;
      rearWheelGroup.add(rWheel);

      const rimGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.52, 12);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rearWheelGroup.add(rim);

      tractorGroup.add(rearWheelGroup);
    }

    // Front Small Wheels
    for (const z of [-1.1, 1.1]) {
      const frontWheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 12);
      const fWheel = new THREE.Mesh(frontWheelGeo, wheelMat);
      fWheel.rotation.x = Math.PI / 2;
      fWheel.position.set(1.2, 0.6, z);
      tractorGroup.add(fWheel);
    }

    scene.add(tractorGroup);

    // 8. 3D Trees (Scattered around field)
    const treeGroup = new THREE.Group();
    const treePos = [
      [-22, 0, -5], [-18, 0, 8], [22, 0, -2], [26, 0, 10], [-5, 0, -18], [10, 0, -18]
    ];

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x087A45, roughness: 0.6, flatShading: true });

    treePos.forEach(([x, y, z]) => {
      const singleTree = new THREE.Group();
      singleTree.position.set(x, y, z);

      const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      singleTree.add(trunk);

      const foliageGeo = new THREE.ConeGeometry(2.2, 4.5, 6);
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 4.2;
      foliage.castShadow = true;
      singleTree.add(foliage);

      treeGroup.add(singleTree);
    });

    scene.add(treeGroup);

    // 9. Floating 3D Clouds
    const cloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.1, transparent: true, opacity: 0.9 });

    for (let i = 0; i < 4; i++) {
      const cloud = new THREE.Group();
      cloud.position.set(-30 + i * 20, 16 + (i % 2) * 2, -15 + i * 4);

      for (let j = 0; j < 5; j++) {
        const puffGeo = new THREE.SphereGeometry(2 + Math.random() * 1.5, 8, 8);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set((j - 2) * 1.8, Math.random() * 0.8, (j % 2) * 0.8);
        cloud.add(puff);
      }

      cloudsGroup.add(cloud);
    }

    scene.add(cloudsGroup);

    // 10. Mouse Interaction / Parallax
    let targetX = 0;
    let targetY = 0;
    const mouseX = 0;
    const mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 6;
      targetY = -y * 3;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 11. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 12. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Rotate Windmill Blades
      bladeHubGroup.rotation.z = elapsedTime * 1.5;

      // Drifting Clouds
      cloudsGroup.children.forEach((cloud, idx) => {
        cloud.position.x += 0.015 * (idx + 1) * 0.3;
        if (cloud.position.x > 45) cloud.position.x = -45;
      });

      // Subtle Tractor Drive Wobble
      tractorGroup.position.z = 5 + Math.sin(elapsedTime * 0.8) * 0.5;

      // Mouse Parallax Camera Interpolation
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (18 + targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 3, 0);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing select-none" 
    />
  );
}
