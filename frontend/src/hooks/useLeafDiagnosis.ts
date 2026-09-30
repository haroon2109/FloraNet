"use client";

import React, { useState, useCallback } from 'react';
import { getApiBaseUrl } from '@/lib/apiConfig';
import { useFarm } from '@/context/farmContext';

export interface LiveHotspot {
  id: string;
  site: string;
  disease: string;
  severity: 'Healthy' | 'Warning' | 'Critical';
  confidence: number;
  treatment: string;
}

/**
 * useLeafDiagnosis — the ONLY path from a leaf photo to 3D hotspot pins.
 *
 * Upload → POST /api/v1/doctor/diagnose (Celery task) → poll
 * GET /api/v1/tasks/{task_id} → map the Gemini DiagnosisResponse onto hotspot
 * pins. No canned HOTSPOTS, no fake confidence — pending/error states are
 * explicit and nothing renders until the live result arrives.
 */
export function useLeafDiagnosis() {
  const { userProfile } = useFarm();
  const [hotspots, setHotspots] = useState<LiveHotspot[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setHotspots([]);
    setError(null);
  }, []);

  const diagnose = useCallback(async (file: File): Promise<LiveHotspot[]> => {
    setIsScanning(true);
    setError(null);
    setHotspots([]);
    try {
      const coords = userProfile.defaultCoordinates
        ? `${userProfile.defaultCoordinates.lat},${userProfile.defaultCoordinates.lng}`
        : '';
      const form = new FormData();
      form.append('image', file);
      form.append(
        'query',
        `Diagnose crop disease or deficiency in this leaf sample (${userProfile.primaryCrop || 'unknown crop'}, ${userProfile.country || 'unknown country'}). Return site, severity and treatment per lesion.`
      );
      form.append('coordinates', coords);

      const res = await fetch(`${getApiBaseUrl()}/api/v1/doctor/diagnose`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        let detail = '';
        try {
          const err = await res.json();
          detail = err?.detail ? ` — ${JSON.stringify(err.detail)}` : '';
        } catch { /* ignore parse errors */ }
        throw new Error(`Diagnose request rejected (HTTP ${res.status}${detail}).`);
      }
      const { task_id } = await res.json();
      if (!task_id) throw new Error('Backend did not return a task id.');

      const base = getApiBaseUrl();
      let result: any = null;
      for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise((r) => setTimeout(r, 2000));
        const poll = await fetch(`${base}/api/v1/tasks/${encodeURIComponent(task_id)}`);
        if (!poll.ok) continue;
        const body = await poll.json();
        if (body?.status === 'SUCCESS' && body?.result) { result = body.result; break; }
        if (body?.status === 'FAILURE') throw new Error(typeof body?.result === 'string' ? body.result : 'Diagnosis task failed');
      }
      if (!result) throw new Error('Diagnosis timed out — the worker may be offline (Redis/Celery required).');

      const confidence = Math.round((result.confidence_score ?? 0) * 100);
      const pins: LiveHotspot[] = [
        {
          id: 'live-h1',
          site: 'Uploaded Leaf',
          disease: result.disease_identification || 'Unknown condition',
          severity: 'Warning',
          confidence,
          treatment:
            (result.organic_remedies?.[0]?.name ? `${result.organic_remedies[0].name}: ${result.organic_remedies[0].description}` : null) ||
            result.additional_notes ||
            'Follow the full prescription in the Plant Doctor report.',
        },
      ];
      setHotspots(pins);
      return pins;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Live diagnosis unavailable.';
      setError(`${msg} No substitute diagnosis is shown.`);
      return [];
    } finally {
      setIsScanning(false);
    }
  }, [userProfile.defaultCoordinates, userProfile.primaryCrop, userProfile.country]);

  return { hotspots, diagnose, isScanning, error, reset };
}
