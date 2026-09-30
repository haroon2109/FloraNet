"use client";

import { useEffect } from 'react';

/**
 * Registers the offline service worker (production only) and guarantees any
 * stale legacy registration is replaced by the current /sw.js. When the
 * registration itself fails (e.g. an old SW from a previous deploy is
 * blocking), it unregisters so the app never gets stuck on a poisoned cache.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') {
      return;
    }
    const register = async () => {
      try {
        // Our custom worker lives at /sw.js; the next-pwa generated worker
        // lives at /sw-pwa.js (see next.config.ts) — register both.
        const registrations = await Promise.all([
          navigator.serviceWorker.register('/sw.js'),
          navigator.serviceWorker.register('/sw-pwa.js'),
        ]);
        console.log('[FloraNet PWA] Service Workers registered:', registrations.map((r) => r.scope));
      } catch (error) {
        console.warn('[FloraNet PWA] Service Worker registration failed — cleaning up stale worker:', error);
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));
      }
    };
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);

  return null;
}
