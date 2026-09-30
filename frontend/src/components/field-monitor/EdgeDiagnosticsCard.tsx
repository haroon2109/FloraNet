"use client";

import React, { useRef, useState } from 'react';
import {
  Camera,
  Mic,
  MapPin,
  CloudOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Square,
  FileText,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { useToast } from '@/context/toastContext';
import { getApiBaseUrl } from '@/lib/apiConfig';
import { whisperLanguageForProfile } from '@/lib/edgeLanguage';
import { chatLanguageName, createDictation, isSpeechRecognitionSupported, speechLocaleFor, speakText, stopSpeaking } from '@/lib/speech';
import { queuePendingCapture, CAPTURES_CHANGED_EVENT } from '@/lib/offlineDb';

/**
 * Edge Diagnostics Card — every action performs a real backend round-trip.
 *
 *  - Take Leaf Photo  → captures/opens a photo and POSTs it to
 *                       POST /api/v1/doctor/diagnose, then polls the task.
 *  - Record Voice Note→ records the microphone and POSTs to
 *                       POST /api/v1/audio/transcribe (local faster-whisper).
 *  - Sync Now         → pings the backend to verify real connectivity.
 *
 * No simulated results: states render live output or explicit errors.
 */

export interface LiveDiagnosis {
  disease_identification?: string;
  confidence_score?: number;
  severity?: string;
  organic_remedies?: Array<{ name: string; description: string; type?: string }>;
  additional_notes?: string;
  error?: string;
}

export interface EdgeDiagnosticsCardProps {
  /** Fires with the real backend diagnosis so the page can render/share it. */
  onDiagnosis?: (diagnosis: LiveDiagnosis) => void;
  /** Fires when a capture could not be uploaded and was queued for replay. */
  onQueued?: () => void;
}

/** Convert a captured Blob into a base64 data URL for offline persistence. */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** True when a failure was caused by connectivity, not by the request itself. */
function isNetworkFailure(err: unknown): boolean {
  return err instanceof TypeError || (typeof navigator !== 'undefined' && !navigator.onLine);
}

export default function EdgeDiagnosticsCard({ onDiagnosis, onQueued }: EdgeDiagnosticsCardProps = {}) {
  const { userProfile } = useFarm();
  const { showToast } = useToast();

  const [capturedSample, setCapturedSample] = useState<boolean>(false);
  const [diagStatus, setDiagStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [diagnosis, setDiagnosis] = useState<LiveDiagnosis | null>(null);
  const [diagError, setDiagError] = useState<string | null>(null);

  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'recording' | 'processing' | 'done' | 'error'>('idle');
  const [transcript, setTranscript] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const [isOffline, setIsOffline] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [synced, setSynced] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const dictationRef = useRef<ReturnType<typeof createDictation>>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [useWhisperFallback, setUseWhisperFallback] = useState(false);

  /**
   * Persist a capture to the offline queue so it is diagnosed/transcribed
   * automatically once connectivity returns. Nothing is uploaded here.
   */
  const stashCapture = async (kind: 'photo' | 'voice', blob: Blob, name: string) => {
    try {
      const coords = userProfile.defaultCoordinates
        ? `${userProfile.defaultCoordinates.lat},${userProfile.defaultCoordinates.lng}`
        : '';
      await queuePendingCapture({
        kind,
        name,
        mime: blob.type || (kind === 'voice' ? 'audio/webm' : 'image/jpeg'),
        dataB64: await blobToDataUrl(blob),
        coords,
        language: whisperLanguageForProfile(userProfile.country, userProfile.language),
        crop: userProfile.primaryCrop || '',
        country: userProfile.country || '',
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(CAPTURES_CHANGED_EVENT));
      }
      onQueued?.();
      showToast(
        kind === 'photo'
          ? 'Leaf photo saved offline — it will be diagnosed automatically when you reconnect.'
          : 'Voice note saved offline — it will be transcribed automatically when you reconnect.',
        'warning',
      );
    } catch {
      showToast('Could not store this capture locally (browser storage unavailable).', 'error');
    }
  };

  const pollTask = async (taskId: string): Promise<LiveDiagnosis> => {
    const base = getApiBaseUrl();
    for (let attempt = 0; attempt < 40; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));
      const res = await fetch(`${base}/api/v1/tasks/${encodeURIComponent(taskId)}`);
      if (!res.ok) continue;
      const body = await res.json();
      if (body?.status === 'SUCCESS' && body?.result) return body.result as LiveDiagnosis;
      if (body?.status === 'FAILURE') {
        throw new Error(typeof body?.result === 'string' ? body.result : 'Diagnosis task failed');
      }
    }
    throw new Error('Diagnosis timed out — the local model server may be busy.');
  };

  const handlePhotoSelected = async (file: File) => {
    setCapturedSample(true);
    setDiagnosis(null);
    setDiagError(null);

    // Already offline → escalate to the replay queue instead of failing.
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setDiagStatus('idle');
      await stashCapture('photo', file, file.name || 'leaf-photo.jpg');
      return;
    }

    setDiagStatus('processing');
    try {
      const coords = userProfile.defaultCoordinates
        ? `${userProfile.defaultCoordinates.lat},${userProfile.defaultCoordinates.lng}`
        : '';
      const form = new FormData();
      form.append('image', file);
      // The model follows a display name ("Hindi"), not a stored code ("hi").
      form.append('query', `Diagnose crop disease or deficiency in this leaf sample (${userProfile.primaryCrop || 'unknown crop'}, ${userProfile.country || 'unknown country'}). Reply in ${chatLanguageName(userProfile.language)}.`);
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
      const result = await pollTask(task_id);
      setDiagnosis(result);
      setDiagStatus('done');
      onDiagnosis?.(result);
      if (result?.disease_identification) {
        showToast(`Detected: ${result.disease_identification}`, 'info');
      }
    } catch (err) {
      // Connectivity loss mid-flight → queue the exact file for replay.
      if (isNetworkFailure(err)) {
        setDiagStatus('idle');
        await stashCapture('photo', file, file.name || 'leaf-photo.jpg');
        return;
      }
      setDiagError(err instanceof Error ? err.message : 'Live diagnosis unavailable.');
      setDiagStatus('error');
    }
  };

  const startRecording = async () => {
    if (isSpeechRecognitionSupported() && !useWhisperFallback) {
      setTranscript(null);
      setVoiceError(null);
      const recognition = createDictation(
        speechLocaleFor(userProfile.country, userProfile.language),
        {
          onResult: (result, isFinal) => {
            if (!isFinal) return;
            setTranscript(result.trim());
            setVoiceStatus('done');
          },
          onEnd: () => setVoiceStatus((status) => status === 'recording' ? 'idle' : status),
          onError: (code) => {
            setUseWhisperFallback(true);
            setVoiceError(`Browser speech recognition failed (${code}). Try recording a voice note instead.`);
            setVoiceStatus('error');
          },
        },
        { interimResults: false },
      );
      if (recognition) {
        dictationRef.current = recognition;
        setVoiceStatus('recording');
        setCapturedSample(true);
        try {
          recognition.start();
          return;
        } catch {
          dictationRef.current = null;
          setVoiceStatus('idle');
        }
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        void submitVoiceNote(new Blob(chunksRef.current, { type: 'audio/webm' }));
      };
      mediaRecorder.start();
      setVoiceStatus('recording');
      setCapturedSample(true);
    } catch {
      setVoiceStatus('error');
      setVoiceError('Microphone access was denied — no recording was made.');
    }
  };

  const stopRecording = () => {
    if (dictationRef.current && voiceStatus === 'recording') {
      dictationRef.current.stop();
      dictationRef.current = null;
      return;
    }
    if (mediaRecorderRef.current && voiceStatus === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const readRemediesAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    const remedies = diagnosis?.organic_remedies ?? [];
    const instructions = remedies
      .map((remedy, index) => `Step ${index + 1}. ${remedy.name}. ${remedy.description}`)
      .join('. ');
    const started = speakText(
      `Organic remedy mixing and application instructions. ${instructions}`,
      speechLocaleFor(userProfile.country, userProfile.language),
      {
        onEnd: () => setIsSpeaking(false),
        onFallback: () => showToast('No installed voice for your selected language; using the browser default voice.', 'warning'),
      },
    );
    if (started) setIsSpeaking(true);
    else showToast('Speech playback is not available in this browser.', 'warning');
  };

  const submitVoiceNote = async (blob: Blob) => {
    setTranscript(null);
    setVoiceError(null);

    const ext = blob.type.includes('webm') ? 'webm' : 'ogg';
    const name = `voice-note.${ext}`;

    // Already offline → queue the recording for transcription on reconnect.
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setVoiceStatus('idle');
      await stashCapture('voice', blob, name);
      return;
    }

    setVoiceStatus('processing');
    try {
      const file = new File([blob], name, { type: blob.type || 'audio/webm' });
      const form = new FormData();
      form.append('file', file);
      form.append('language', whisperLanguageForProfile(userProfile.country, userProfile.language));

      const res = await fetch(`${getApiBaseUrl()}/api/v1/audio/transcribe`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        let detail = '';
        try {
          const err = await res.json();
          detail = err?.detail ? ` — ${err.detail}` : '';
        } catch { /* ignore parse errors */ }
        throw new Error(`Transcription unavailable (HTTP ${res.status}${detail}).`);
      }
      const data = await res.json();
      setTranscript(String(data.transcript ?? ''));
      setVoiceStatus('done');
    } catch (err) {
      if (isNetworkFailure(err)) {
        setVoiceStatus('idle');
        await stashCapture('voice', blob, name);
        return;
      }
      setVoiceError(err instanceof Error ? err.message : 'Transcription failed.');
      setVoiceStatus('error');
    }
  };

  // Real connectivity check — pings the backend, never simulates success.
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${getApiBaseUrl()}/`, { signal: controller.signal });
      clearTimeout(timer);
      const ok = res.ok;
      setIsOffline(!ok);
      setSynced(ok);
      showToast(ok ? 'FloraNet backend is reachable' : `Backend responded with HTTP ${res.status}`, ok ? 'success' : 'warning');
    } catch {
      setIsOffline(true);
      setSynced(false);
      showToast('Backend unreachable — working offline', 'warning');
    } finally {
      setIsSyncing(false);
    }
  };

  const connectionState = isOffline ? 'offline' : synced ? 'synced' : 'awaiting';

  return (
    <div className="bg-white border border-[#E1E8E4] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)]">

      {/* Connection Status Strip */}
      <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl mb-4 border ${
        connectionState === 'offline'
          ? 'bg-[#FFF9F2] border-[#FFE9D4] text-[#C2410C]'
          : connectionState === 'synced'
          ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#15803D]'
          : 'bg-[#F0F5F2] border-[#E0EBE4] text-[#111827]'
      }`}>
        <div className="flex items-center gap-2 text-[12.5px] font-bold">
          {connectionState === 'offline' ? <CloudOff size={15} /> : connectionState === 'synced' ? <CheckCircle2 size={15} /> : <Info size={15} />}
          <span>
            {connectionState === 'offline'
              ? 'Offline — backend unreachable'
              : connectionState === 'synced'
              ? 'Connected to FloraNet backend'
              : 'Connectivity not yet verified'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleSync}
          disabled={isSyncing}
          className="text-[11.5px] font-bold px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white border border-current/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
        >
          <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Checking…' : 'Check Connection'}
        </button>
      </div>

      {/* Hidden real file capture (camera on mobile, file picker on desktop) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handlePhotoSelected(file);
          e.target.value = '';
        }}
      />

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-4 bg-[#FAFCFA] hover:bg-[#F3FAF5] border border-[#DCE8DF] hover:border-[#075C32] rounded-xl flex items-center gap-3.5 transition-all group text-left cursor-pointer shadow-2xs"
        >
          <div className="w-11 h-11 bg-white border border-[#DCE8DF] rounded-xl flex items-center justify-center text-[#075C32] group-hover:scale-105 transition-transform shrink-0 shadow-xs">
            <Camera size={20} strokeWidth={2.2} />
          </div>
          <div>
            <span className="text-[13.5px] font-bold text-[#102A20] group-hover:text-[#075C32] block transition-colors">
              Take Leaf Photo
            </span>
            <span className="text-[11.5px] text-[#55695F]">
              Sends a real image to the diagnosis pipeline
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={voiceStatus === 'recording' ? stopRecording : startRecording}
          className={`p-4 bg-[#FAFCFA] hover:bg-[#F3FAF5] border rounded-xl flex items-center gap-3.5 transition-all group text-left cursor-pointer shadow-2xs ${
            voiceStatus === 'recording'
              ? 'border-[#E84A3C] bg-[#FFF5F4]'
              : 'border-[#DCE8DF] hover:border-[#075C32]'
          }`}
        >
          <div className={`w-11 h-11 bg-white border rounded-xl flex items-center justify-center transition-transform shrink-0 shadow-xs group-hover:scale-105 ${
            voiceStatus === 'recording'
              ? 'border-[#FAD2CF] text-[#E84A3C]'
              : 'border-[#DCE8DF] text-[#075C32]'
          }`}>
            {voiceStatus === 'recording' ? <Square size={18} strokeWidth={2.2} /> : <Mic size={20} strokeWidth={2.2} />}
          </div>
          <div>
            <span className="text-[13.5px] font-bold text-[#102A20] block transition-colors">
              {voiceStatus === 'recording' ? 'Stop Recording' : 'Record Voice Note'}
            </span>
            <span className="text-[11.5px] text-[#55695F]">
              {voiceStatus === 'recording'
                ? 'Listening in your selected language… tap to stop'
                : isSpeechRecognitionSupported() && !useWhisperFallback
                  ? 'Browser speech recognition in your selected language'
                  : 'Recorded locally, then transcribed with faster-whisper'}
            </span>
          </div>
        </button>
      </div>

      {/* Voice transcript result */}
      {voiceStatus === 'processing' && (
        <div className="bg-[#F5F8FC] border border-[#D9E4F0] rounded-xl p-4 mb-4 flex items-center gap-3">
          <RefreshCw size={18} className="animate-spin text-[#2C5282]" />
          <span className="text-[12.5px] font-bold text-[#2C5282]">Transcribing locally with faster-whisper…</span>
        </div>
      )}

      {voiceStatus === 'done' && transcript !== null && (
        <div className="bg-[#FAFDFB] border border-[#DCEBE0] rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <FileText size={15} className="text-[#075C32]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#075C32]">Transcript (local Whisper)</span>
          </div>
          <p className="text-[13px] text-[#1E4530] leading-relaxed">
            {transcript || '(No speech detected in the recording.)'}
          </p>
        </div>
      )}

      {voiceStatus === 'error' && voiceError && (
        <div className="bg-[#FFF9F2] border border-[#FFE9D4] rounded-xl p-4 mb-4 flex items-start gap-2.5">
          <AlertTriangle size={17} className="text-[#C2410C] shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-[#9A3412] leading-relaxed">{voiceError}</p>
        </div>
      )}

      {/* Diagnostic Result Card */}
      {capturedSample && (
        <div className="bg-[#FAFDFB] border border-[#DCEBE0] rounded-xl overflow-hidden shadow-xs">
          {diagStatus === 'idle' && (
            <div className="p-5">
              <div className="flex items-start gap-3">
                <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[14px] font-bold text-[#102A20] mb-1">No diagnosis yet — capture a leaf photo</h4>
                  <p className="text-[12.5px] text-[#53645D] leading-relaxed">
                    A real diagnosis runs your captured image through the backend multimodal pipeline
                    (POST /api/v1/doctor/diagnose) grounded in the verified ICAR/Embrapa/ARC/CAAS/VNIIEA corpus.
                    FloraNet does not display sample or fabricated disease results.
                  </p>
                </div>
              </div>
            </div>
          )}

          {diagStatus === 'processing' && (
            <div className="p-5 text-center">
              <RefreshCw size={22} className="mx-auto animate-spin text-[#075C32] mb-2" />
              <p className="text-[13px] font-bold text-[#102A20]">Running live diagnosis… (local vision model, may take a few minutes on CPU)</p>
            </div>
          )}

          {diagStatus === 'error' && (
            <div className="p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[14px] font-bold text-[#102A20] mb-1">Diagnosis pipeline unavailable</h4>
                  <p className="text-[12.5px] text-[#53645D] leading-relaxed">
                    {diagError} No substitute diagnosis is shown.
                  </p>
                </div>
              </div>
            </div>
          )}

          {diagStatus === 'done' && diagnosis && (
            <>
              {/* Alert Header Strip */}
              <div className="bg-[#FEF2F2] border-b border-[#FEE2E2] px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#991B1B]">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span className="text-[12.5px] font-bold">
                    {diagnosis.severity || 'Diagnosis'} — {diagnosis.confidence_score != null ? `${Math.round(diagnosis.confidence_score * 100)}% confidence` : 'local multimodal model'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#991B1B] bg-white px-2 py-0.5 rounded border border-[#FEE2E2]">
                  Live result
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5">
                <h4 className="text-[17px] font-bold text-[#102A20] leading-tight mb-1">
                  {diagnosis.disease_identification || 'No disease identified'}
                </h4>
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#55695F] mb-3">
                  <MapPin size={13} className="text-[#075C32]" />
                  <span>From your captured field sample</span>
                </div>

                {/* Remedies */}
                {(diagnosis.organic_remedies ?? []).length > 0 && (
                  <div className="bg-[#F2F8F4] border border-[#CDE5D5] rounded-xl p-3 mb-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#075C32]">
                        Prescribed Remedies (RAG-grounded)
                      </span>
                      <button
                        type="button"
                        onClick={readRemediesAloud}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#B7D8C2] bg-white text-[#075C32] hover:bg-[#E7F3EA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075C32]"
                        aria-label={isSpeaking ? 'Stop spoken remedy instructions' : 'Hear remedy mixing instructions'}
                        title={isSpeaking ? 'Stop speaking' : 'Hear remedy mixing instructions'}
                      >
                        {isSpeaking ? <VolumeX size={17} /> : <Volume2 size={17} />}
                      </button>
                    </div>
                    {(diagnosis.organic_remedies ?? []).map((r, i) => (
                      <p key={i} className="text-[12px] font-medium text-[#1E4530] leading-relaxed">
                        • {r.name}: {r.description}
                      </p>
                    ))}
                  </div>
                )}

                {diagnosis.additional_notes && (
                  <p className="text-[11.5px] text-[#854D0E] font-medium bg-[#FEFCE8] border border-[#FEF08A] px-3 py-1.5 rounded-lg">
                    {diagnosis.additional_notes}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
