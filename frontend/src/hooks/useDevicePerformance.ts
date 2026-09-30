"use client";

import { useState, useEffect } from 'react';

export interface DevicePerformanceProfile {
  isMobile: boolean;
  isLowPower: boolean;
  prefersReducedMotion: boolean;
  webglSupported: boolean;
  dpr: number;
}

export function useDevicePerformance(): DevicePerformanceProfile {
  const [profile, setProfile] = useState<DevicePerformanceProfile>({
    isMobile: false,
    isLowPower: false,
    prefersReducedMotion: false,
    webglSupported: true,
    dpr: 1,
  });

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const isLowPower = hardwareConcurrency <= 4 || isMobile;

    let webglSupported = true;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      webglSupported = !!gl;
    } catch {
      webglSupported = false;
    }

    const dpr = isLowPower ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    setProfile({
      isMobile,
      isLowPower,
      prefersReducedMotion,
      webglSupported,
      dpr,
    });
  }, []);

  return profile;
}
