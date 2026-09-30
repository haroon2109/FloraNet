import { ChatTurn, Message } from '@/types/ai';
import { chatLanguageName } from '@/lib/speech';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7880';

export interface ChatOptions {
  persona?: 'precision' | 'regenerative' | 'sage';
  country?: string;
  crop?: string;
  /** Farmer's language — sent as a display name the model can follow. */
  language?: string;
  /** Prior turns of this conversation, oldest first (conversation memory). */
  history?: ChatTurn[];
  /** Crops previously grown on this farm, most recent last. */
  cropHistory?: string[];
}

export const aiService = {
  /**
   * Connects to the FastAPI RAG & Multi-Persona Agronomy Advisory Engine.
   * The backend generates real output with a local open-source LLM (Ollama)
   * grounded in the verified ICAR / Embrapa / ARC / CAAS / VNIIEA corpus.
   * When the backend or the local model is unavailable, an explicit error
   * message is returned — NEVER a canned advisory with fabricated telemetry.
   */
  async sendMessage(prompt: string, options?: ChatOptions): Promise<Message> {
    const persona = options?.persona || 'precision';
    const country = options?.country || 'India';
    const crop = options?.crop || 'Maize';

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const controller = new AbortController();
      // Local 4B model + RAG retrieval routinely takes longer than 15s on CPU;
      // aborting first would hide a working backend behind a fake offline error.
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const res = await fetch(`${BACKEND_URL}/api/v1/farm/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt,
          persona,
          country,
          crop,
          language: chatLanguageName(options?.language),
          // Conversation memory — without it "how much per litre?" loses its
          // antecedent and retrieval returns generic passages.
          history: options?.history || [],
          crop_history: options?.cropHistory || [],
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          id: data.id || `ai-${Date.now()}`,
          role: 'assistant',
          content: data.content,
          timestamp: data.timestamp || timeString,
          language: data.language,
          turnsInContext: data.turns_in_context,
          sources: Array.isArray(data.sources) ? data.sources : [],
        };
      }

      // Backend responded with an error (e.g. 503 when the local LLM is down)
      let detail = '';
      try {
        const err = await res.json();
        detail = err?.detail ? ` — ${err.detail}` : '';
      } catch { /* ignore parse errors */ }

      return {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `Live AI advisory is currently unavailable (HTTP ${res.status}${detail}). No substitute advice is shown — please ensure the local Ollama model server is running, or try again later.`,
        timestamp: timeString,
      };
    } catch {
      return {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content:
          'Live AI advisory is currently unreachable (backend offline or timed out). FloraNet does not fabricate advice in offline mode — please retry once the connection is restored.',
        timestamp: timeString,
      };
    }
  },
};
