/**
 * AI Service — Main Entry Point
 *
 * Provides a provider-agnostic interface for AI interactions.
 * The active provider can be swapped without changing application code.
 */

import type { AIProvider, AIResponse, AIStreamParams, AICompleteParams, AIMessage, StreamChunk } from './types';
import { AIError } from './types';
import { NvidiaProvider } from './providers/NvidiaProvider';
import { EdgeRuntimeProvider } from './providers/EdgeRuntimeProvider';
import { env } from '@/core/config/env';

export { AIError };

let activeProvider: AIProvider | null = null;

function getProvider(): AIProvider {
  if (!activeProvider) {
    // Route through the server-side AI Runtime by default. Fall back to the
    // direct NVIDIA provider when the edge runtime is unreachable (e.g. the
    // native Expo app has no API server mounted at apiBaseUrl).
    const useEdge = env.useEdgeRuntime !== false;
    activeProvider = useEdge ? new EdgeRuntimeProvider() : new NvidiaProvider();
  }
  return activeProvider;
}

/**
 * Wraps the primary provider with a transparent fallback to the direct NVIDIA
 * provider. The server-side AI Runtime is preferred (keys stay server-side,
 * RAG + memory), but if its endpoint is unreachable — which is the normal case
 * when running the native Expo app without a Vite/API dev server — we don't
 * want the user to see a raw HTML 200 error. We fail over to calling NVIDIA
 * directly so the chat always returns live.
 */
class FallbackProvider implements AIProvider {
  readonly name = 'fallback';

  private async *streamWithFallback(params: AIStreamParams): AsyncGenerator<StreamChunk> {
    const primary = getProvider();
    try {
      yield* primary.streamChat(params);
      return;
    } catch (err) {
      // Only fall back for the edge runtime; never swallow a real NVIDIA error.
      if (primary.name !== 'edge-runtime') throw err;
      console.warn('[AI] Edge runtime unreachable, falling back to direct NVIDIA:', (err as Error)?.message);
      yield* new NvidiaProvider().streamChat(params);
    }
  }

  async *streamChat(params: AIStreamParams): AsyncGenerator<StreamChunk> {
    yield* this.streamWithFallback(params);
  }

  async generateResponse(params: AICompleteParams): Promise<AIResponse> {
    const primary = getProvider();
    try {
      return await primary.generateResponse(params);
    } catch (err) {
      if (primary.name !== 'edge-runtime') throw err;
      console.warn('[AI] Edge runtime unreachable, falling back to direct NVIDIA:', (err as Error)?.message);
      return new NvidiaProvider().generateResponse(params);
    }
  }
}

const fallbackProvider = new FallbackProvider();

/**
 * Probe the server-side AI Runtime once at startup to confirm the app is on the
 * edge path (which carries real-time web access + RAG + memory) rather than the
 * direct-NVIDIA fallback. The edge function streams chunks that include
 * `capabilities` and `toolsUsed`, so we read the first chunk to report status.
 *
 * This is observability only — it never changes streaming behavior. The result
 * is cached after the first call.
 */
let probeResult: { live: boolean; capabilities: string[]; tools: string[]; error?: string } | null = null;

export async function probeEdgeRuntime(uid = 'probe'): Promise<{
  live: boolean;
  capabilities: string[];
  tools: string[];
  error?: string;
}> {
  if (probeResult) return probeResult;

  const apiBase = env.apiBaseUrl;
  const url = apiBase.endsWith('/') ? `${apiBase}ai/chat` : `${apiBase}/ai/chat`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-uid': uid },
      body: JSON.stringify({ text: 'ping', uid, history: [], mode: 'standard' }),
    });

    if (!res.ok || !res.body) {
      probeResult = {
        live: false,
        capabilities: [],
        tools: [],
        error: `status ${res.status}`,
      };
      console.warn(`[AI] Edge runtime probe failed (${res.status}) — chat will use direct NVIDIA fallback.`);
      return probeResult;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buf = '';
    let firstChunk: any = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split(/\r?\n/);
      buf = lines.pop() ?? '';
      for (const line of lines) {
        const t = line.trim();
        if (!t) continue;
        try {
          const parsed = JSON.parse(t);
          if (parsed.capabilities || parsed.toolsUsed) {
            firstChunk = parsed;
            break;
          }
        } catch {}
      }
      if (firstChunk) break;
    }
    // Drain the rest so the connection closes cleanly.
    try {
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
    } catch {}

    probeResult = {
      live: true,
      capabilities: firstChunk?.capabilities ?? [],
      tools: firstChunk?.toolsUsed ?? [],
    };
    console.log(
      `[AI] Edge runtime LIVE — capabilities: ${probeResult.capabilities.join(',') || '-'} tools: ${probeResult.tools.join(',') || '-'}`,
    );
    return probeResult;
  } catch (err) {
    probeResult = {
      live: false,
      capabilities: [],
      tools: [],
      error: (err as Error)?.message,
    };
    console.warn('[AI] Edge runtime probe error — chat will use direct NVIDIA fallback:', (err as Error)?.message);
    return probeResult;
  }
}

/**
 * Set a custom AI provider (useful for testing or switching providers).
 */
export function setProvider(provider: AIProvider): void {
  activeProvider = provider;
}

/**
 * Get the current AI provider name.
 */
export function getProviderName(): string {
  return getProvider().name;
}

/**
 * Stream a chat response from the AI provider.
 */
export async function* streamChat(params: AIStreamParams): AsyncGenerator<StreamChunk> {
  yield* fallbackProvider.streamChat(params);
}

/**
 * Generate a complete (non-streaming) response.
 */
export async function generateResponse(params: AICompleteParams): Promise<AIResponse> {
  return fallbackProvider.generateResponse(params);
}

/**
 * Convert an array of AIMessages to the text + history format.
 */
export function messagesToParams(
  messages: AIMessage[],
  uid: string,
  signal?: AbortSignal
): AIStreamParams {
  const last = messages[messages.length - 1];
  const text = last?.content ?? '';
  const history = messages
    .slice(0, -1)
    .filter((m): m is { role: 'user' | 'assistant'; content: string } =>
      m.role === 'user' || m.role === 'assistant'
    )
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  return { text, uid, history, signal };
}
