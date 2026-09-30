"use client";

import React, { useEffect } from 'react';
import { FarmProvider, useFarm } from '@/context/farmContext';
import { ToastProvider } from '@/context/toastContext';
import GlobalCommandPalette from '@/components/ui/GlobalCommandPalette';
import { htmlLangFor, isRTLLanguage } from '@/lib/uiLanguage';

/**
 * Keeps the document element in sync with the farmer's chosen language so
 * screen readers, browser translation and text direction follow the landing
 * page (or in-app) language switch on EVERY screen — not just the landing.
 */
function DocumentLanguage() {
  const { userProfile } = useFarm();

  useEffect(() => {
    const root = document.documentElement;
    root.lang = htmlLangFor(userProfile?.language);
    root.dir = isRTLLanguage(userProfile?.language) ? 'rtl' : 'ltr';
  }, [userProfile?.language]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // NOTE: Service worker registration is handled exclusively by
  // ServiceWorkerRegister (see components/pwa). Registering here too caused
  // double registration and let a stale worker survive framework rebuilds.

  return (
    <ToastProvider>
      <FarmProvider>
        <DocumentLanguage />
        {children}
        <GlobalCommandPalette />
      </FarmProvider>
    </ToastProvider>
  );
}
