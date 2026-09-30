"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function River3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera Setup - Elevated Isometric Perspective
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF0F7F2);
    scene.fog = new THREE.FogExp2(0xF0F7F2, 0.008);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 32, 48);
    camera.lookAt(0, 2, -5);

    // 2. WebGL Renderer with High Quality Shadows & Antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Premium Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFFBEB, 1.4);
    sunLight.position.set(40, 50, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const skyLight = new THREE.HemisphereLight(0xE0F2FE, 0x168A45, 0.5);
    scene.add(skyLight);

    // 4. Layered Terraced Green Field Landscape
    const landscapeGroup = new THREE.Group();
    scene.add(landscapeGroup);

    // Ground Base
    const groundGeo = new THREE.PlaneGeometry(160, 120, 48, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x15803D,
      roughness: 0.85,
      metalness: 0.05,
    });
    const mainGround = new THREE.Mesh(groundGeo, groundMat);
    mainGround.rotation.x = -Math.PI / 2;
    mainGround.position.y = -0.5;
    mainGround.receiveShadow = true;
    landscapeGroup.add(mainGround);

    // Curved Terraced Step Platforms
    const terraceTones = [0x168A45, 0x087A45, 0x22C55E, 0x15803D, 0x166534, 0x4ADE80];
    for (let t = 0; t < 8; t++) {
      const radius = 22 + t * 4.5;
      const stepGeo = new THREE.CylinderGeometry(radius, radius + 3, 1.6, 32, 1, false, 0, Math.PI * 1.35);
      const stepMat = new THREE.MeshStandardMaterial({
        color: terraceTones[t % terraceTones.length],
        roughness: 0.7,
        metalness: 0.05,
        flatShading: true,
      });
      const stepMesh = new THREE.Mesh(stepGeo, stepMat);
      stepMesh.position.set(-8 + t * 2.5, t * 1.1, -12 - t * 3.5);
      stepMesh.rotation.y = 0.35 + t * 0.08;
      stepMesh.receiveShadow = true;
      stepMesh.castShadow = true;
      landscapeGroup.add(stepMesh);
    }

    // Majestic Background Mountains
    const mtnMat = new THREE.MeshStandardMaterial({
      color: 0x7E8C99,
      roughness: 0.95,
      metalness: 0.0,
      flatShading: true,
    });
    for (let m = 0; m < 5; m++) {
      const mtnGeo = new THREE.ConeGeometry(18 + m * 4, 22 + m * 3, 6);
      const mtn = new THREE.Mesh(mtnGeo, mtnMat);
      mtn.position.set(-42 + m * 22, 9, -40 - (m % 2) * 8);
      mtn.castShadow = true;
      landscapeGroup.add(mtn);
    }

    // 5. REAL-TIME FLOWING CRYSTAL BLUE RIVER (Plane Ribbon with Water Shader Ripple Animation)
    const riverWidth = 7;
    const riverSegments = 120;
    const riverGeo = new THREE.PlaneGeometry(riverWidth, 140, 16, riverSegments);
    
    // Deform plane along a smooth S-curve
    const posAttr = riverGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const yVal = posAttr.getY(i); // lengthwise along plane
      const curveOffset = Math.sin(yVal * 0.06) * 12 + Math.cos(yVal * 0.03) * 6;
      posAttr.setX(i, posAttr.getX(i) + curveOffset);
    }
    riverGeo.computeVertexNormals();

    // Procedural Flowing Liquid Water Texture Canvas
    const waterCanvas = document.createElement('canvas');
    waterCanvas.width = 512;
    waterCanvas.height = 512;
    const wCtx = waterCanvas.getContext('2d')!;

    // Create water gradient with foam highlights
    const wGrad = wCtx.createLinearGradient(0, 0, 512, 512);
    wGrad.addColorStop(0, '#0284C7');
    wGrad.addColorStop(0.3, '#38BDF8');
    wGrad.addColorStop(0.6, '#0369A1');
    wGrad.addColorStop(1, '#0284C7');
    wCtx.fillStyle = wGrad;
    wCtx.fillRect(0, 0, 512, 512);

    // Draw caustic water lines
    wCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    wCtx.lineWidth = 4;
    for (let l = 0; l < 16; l++) {
      wCtx.beginPath();
      wCtx.moveTo(0, l * 32);
      wCtx.bezierCurveTo(128, l * 32 + 20, 384, l * 32 - 20, 512, l * 32);
      wCtx.stroke();
    }

    const waterTexture = new THREE.CanvasTexture(waterCanvas);
    waterTexture.wrapS = THREE.RepeatWrapping;
    waterTexture.wrapT = THREE.RepeatWrapping;
    waterTexture.repeat.set(1, 4);

    const riverMat = new THREE.MeshStandardMaterial({
      map: waterTexture,
      color: 0x38BDF8,
      roughness: 0.1,
      metalness: 0.7,
      transparent: true,
      opacity: 0.92,
    });

    const riverMesh = new THREE.Mesh(riverGeo, riverMat);
    riverMesh.rotation.x = -Math.PI / 2;
    riverMesh.position.set(-6, 0.4, -10);
    riverMesh.receiveShadow = true;
    scene.add(riverMesh);

    // Sandy Riverbank Borders
    const bankGeo = new THREE.PlaneGeometry(riverWidth + 2.5, 140, 16, riverSegments);
    const bankPos = bankGeo.attributes.position;
    for (let i = 0; i < bankPos.count; i++) {
      const yVal = bankPos.getY(i);
      const curveOffset = Math.sin(yVal * 0.06) * 12 + Math.cos(yVal * 0.03) * 6;
      bankPos.setX(i, bankPos.getX(i) + curveOffset);
    }
    bankGeo.computeVertexNormals();

    const bankMat = new THREE.MeshStandardMaterial({ color: 0xA17657, roughness: 0.9 });
    const bankMesh = new THREE.Mesh(bankGeo, bankMat);
    bankMesh.rotation.x = -Math.PI / 2;
    bankMesh.position.set(-6, 0.25, -10);
    scene.add(bankMesh);

    // 6. ELEGANT 3D FLOCKING BIRDS IN FLIGHT (Smooth Wing Flap Animation)
    const birdGroup = new THREE.Group();
    const birdData: { meshGroup: THREE.Group; leftWing: THREE.Mesh; rightWing: THREE.Mesh; flapSpeed: number; offset: number; flightSpeed: number }[] = [];

    const birdMaterial = new THREE.MeshStandardMaterial({ color: 0x102A20, roughness: 0.2 });

    for (let b = 0; b < 9; b++) {
      const singleBirdGroup = new THREE.Group();

      // Bird Torso
      const torsoGeo = new THREE.ConeGeometry(0.22, 1.1, 5);
      const torso = new THREE.Mesh(torsoGeo, birdMaterial);
      torso.rotation.x = Math.PI / 2;
      singleBirdGroup.add(torso);

      // Left Wing
      const leftWingGeo = new THREE.BoxGeometry(1.4, 0.04, 0.45);
      leftWingGeo.translate(-0.7, 0, 0);
      const leftWing = new THREE.Mesh(leftWingGeo, birdMaterial);
      leftWing.position.set(-0.1, 0, 0);
      singleBirdGroup.add(leftWing);

      // Right Wing
      const rightWingGeo = new THREE.BoxGeometry(1.4, 0.04, 0.45);
      rightWingGeo.translate(0.7, 0, 0);
      const rightWing = new THREE.Mesh(rightWingGeo, birdMaterial);
      rightWing.position.set(0.1, 0, 0);
      singleBirdGroup.add(rightWing);

      // Scatter initial positions in sky formation
      const startX = -25 + (b % 3) * 8 + Math.random() * 4;
      const startY = 18 + Math.floor(b / 3) * 3 + Math.random() * 2;
      const startZ = -10 - (b % 3) * 6;

      singleBirdGroup.position.set(startX, startY, startZ);
      singleBirdGroup.rotation.y = -Math.PI / 5 + (Math.random() * 0.15);

      birdGroup.add(singleBirdGroup);
      birdData.push({
        meshGroup: singleBirdGroup,
        leftWing,
        rightWing,
        flapSpeed: 7 + Math.random() * 3,
        offset: b * 0.7,
        flightSpeed: 0.12 + Math.random() * 0.04,
      });
    }

    scene.add(birdGroup);

    // 7. Lush 3D Trees Scattered on Terraces
    const treeGroup = new THREE.Group();
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4A3525, roughness: 0.9 });
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x087A45, roughness: 0.5, flatShading: true });

    const treePositions = [
      [12, 5, -15], [16, 6, -8], [8, 4, 5], [20, 8, -20],
      [-22, 3, -12], [-26, 4, -2], [-18, 2, 8], [15, 7, -25]
    ];

    treePositions.forEach(([x, y, z]) => {
      const tree = new THREE.Group();
      tree.position.set(x, y, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 2.4, 8), trunkMaterial);
      trunk.position.y = 1.2;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliage = new THREE.Mesh(new THREE.SphereGeometry(1.8, 7, 7), foliageMaterial);
      foliage.position.y = 3.2;
      foliage.castShadow = true;
      tree.add(foliage);

      treeGroup.add(tree);
    });

    scene.add(treeGroup);

    // 8. Interactive Mouse Parallax
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 6;
      targetY = -y * 3.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Smooth Real-Time Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Dynamic Flowing Water Texture Animation
      waterTexture.offset.y = -elapsedTime * 0.25;
      waterTexture.offset.x = Math.sin(elapsedTime * 0.6) * 0.03;

      // Real-Time Flocking Birds Animation
      birdData.forEach((b) => {
        // Wing Flapping motion
        const wingAngle = Math.sin(elapsedTime * b.flapSpeed + b.offset) * 0.55;
        b.leftWing.rotation.z = wingAngle;
        b.rightWing.rotation.z = -wingAngle;

        // Continuous Flight Trajectory Across Valley Sky
        b.meshGroup.position.x += b.flightSpeed;
        b.meshGroup.position.z -= b.flightSpeed * 0.5;
        b.meshGroup.position.y += Math.sin(elapsedTime * 1.5 + b.offset) * 0.015;

        // Reset Flight Path Seamlessly
        if (b.meshGroup.position.x > 38) {
          b.meshGroup.position.x = -38;
          b.meshGroup.position.z = -15 - Math.random() * 10;
        }
      });

      // Smooth Camera Mouse Parallax
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (32 + targetY - camera.position.y) * 0.05;
      camera.lookAt(0, 2, -5);

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
