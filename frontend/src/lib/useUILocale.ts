"use client";

/**
 * Locale for the date badges in every screen header — derived from the SAME
 * profile language the landing page writes, so switching language re-renders
 * dates across the app.
 *
 * Kept in its own module (rather than inside `uiLanguage.ts`) so the shared
 * pure helpers can be imported by `farmContext` without a circular import.
 */
import { useFarm } from '@/context/farmContext';
import { intlLocaleFor } from '@/lib/uiLanguage';

export function useUILocale(): string {
  const { userProfile } = useFarm();
  return intlLocaleFor(userProfile?.language);
}
