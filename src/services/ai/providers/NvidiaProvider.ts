import type { AIProvider, AIStreamParams, AICompleteParams, AIResponse, StreamChunk } from '../types';
import { AIError } from '../types';
import { env } from '@/core/config/env';
import { buildContextualPrompt } from '@/prompts/mentalWellnessPrompt';
import { PerfTracker } from '@/utils/chat-performance';
import { Platform } from 'react-native';

// ── Shared SSE line parser (no closure issues) ────────────────────────

let _globalChunk = 0;
function nextChunkId(): () => number {
  const start = ++_globalChunk;
  let i = 0;
  return () => start + (i++);
}

function* parseSSELine(line: string, id: () => number): Generator<StreamChunk> {
  const t = line.trim();
  if (!t) return;
  if (t === 'data: [DONE]') {
    yield { id: `c${id()}`, contentDelta: '', done: true };
    return;
  }
  const body = t.startsWith('data:') ? t.slice(5).trim() : t;
  if (!body || body === '[DONE]') return;
  try {
    const p = JSON.parse(body);
    const d = p?.choices?.[0]?.delta?.content || p?.choices?.[0]?.text || p?.content;
    if (typeof d === 'string' && d) yield { id: `c${id()}`, contentDelta: d };
    if (p?.choices?.[0]?.finish_reason === 'stop' || p?.done === true) {
      yield { id: `c${id()}`, contentDelta: '', done: true };
    }
  } catch {}
}

export class NvidiaProvider implements AIProvider {
  readonly name = 'nvidia-nim';

  async *streamChat(params: AIStreamParams): AsyncGenerator<StreamChunk> {
    const perf = new PerfTracker(params.uid);
    perf.mark('send');

    const apiKey = env.nvidiaApiKey;
    if (!apiKey) {
      throw new AIError('NVIDIA API key not configured', 500, 'Set VITE_NVIDIA_API_KEY in your .env');
    }

    const targetUrl = `${env.nvidiaBaseUrl}/chat/completions`;
    const model = env.nvidiaModel || 'nvidia/nemotron-3-ultra-550b-a55b';

    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: buildContextualPrompt({
        userName: params.memoryContext?.userName,
        timeOfDay: params.memoryContext?.timeOfDay as any,
        returningUser: params.memoryContext?.returningUser,
        previousMood: params.memoryContext?.previousMood,
        preferredTone: params.memoryContext?.preferredTone as any,
      }) },
      ...(params.history || []).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: params.text },
    ];

    const requestBody = JSON.stringify({
      model,
      messages,
      temperature: 0.6,
      top_p: 0.95,
      max_tokens: 4096,
      stream: true,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };

    perf.mark('request_start');

    // ── Try fetch + ReadableStream (web only) ────────────────────
    console.log(`[NvidiaProvider] Checking stream support. Platform.OS: ${Platform.OS}`);
    if (Platform.OS === 'web' && globalThis.fetch && typeof globalThis.ReadableStream !== 'undefined') {
      console.log('[NvidiaProvider] Using Web Fetch API for streaming');
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: requestBody,
        signal: params.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new AIError('AI request failed', res.status, errText);
      }

      if (res.body && typeof res.body.getReader === 'function') {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        const id = nextChunkId();
        let hasFirstToken = false;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split(/\r?\n/);
          buf = lines.pop() ?? '';
          for (const line of lines) {
            for (const c of parseSSELine(line, id)) {
              if (c.contentDelta && !hasFirstToken) { hasFirstToken = true; perf.mark('first_token'); }
              yield c;
              if (c.done) { perf.report(); return; }
            }
          }
        }
        if (buf.trim()) {
          for (const c of parseSSELine(buf, id)) {
            if (c.contentDelta && !hasFirstToken) perf.mark('first_token');
            yield c;
            if (c.done) { perf.report(); return; }
          }
        }
        perf.mark('complete');
        perf.report();
        return;
      }
      // body null — fall through to XHR
    }

    // ── XHR streaming (React Native) ─────────────────────────────

    yield* this.streamViaXHR(targetUrl, headers, requestBody, params.signal, perf);
  }

  private async *streamViaXHR(
    url: string,
    headers: Record<string, string>,
    body: string,
    signal: AbortSignal | undefined,
    perf: PerfTracker | undefined,
  ): AsyncGenerator<StreamChunk> {
    type Evt = { kind: 'data'; text: string } | { kind: 'end' } | { kind: 'error'; err: Error };

    let pending: Evt[] = [];
    let waiter: ((e: Evt) => void) | null = null;
    let done = false;
    let streamError: Error | null = null;

    const push = (e: Evt) => {
      if (waiter) { waiter(e); waiter = null; }
      else pending.push(e);
    };

    console.log('[NvidiaProvider] Starting XHR streaming request to:', url);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    
    const requestHeaders = {
      ...headers,
      'Accept': 'text/event-stream',
    };
    for (const [k, v] of Object.entries(requestHeaders)) xhr.setRequestHeader(k, v);
    xhr.responseType = 'text';

    let lastIdx = 0;

    xhr.onprogress = () => {
      const text = xhr.responseText.slice(lastIdx);
      lastIdx = xhr.responseText.length;
      console.log(`[NvidiaProvider] XHR progress: received ${text.length} chars (total: ${xhr.responseText.length})`);
      if (text) push({ kind: 'data', text });
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      done = true;
      perf?.mark('complete');
      console.log(`[NvidiaProvider] XHR completed with status: ${xhr.status}`);
      if (xhr.status >= 200 && xhr.status < 300) {
        push({ kind: 'end' });
      } else {
        console.error(`[NvidiaProvider] XHR failed: status = ${xhr.status}, response = ${xhr.responseText}`);
        streamError = new AIError('AI request failed', xhr.status, xhr.responseText);
        push({ kind: 'error', err: streamError });
      }
    };

    xhr.onerror = () => {
      done = true;
      console.error('[NvidiaProvider] XHR network error occurred');
      streamError = new Error('Network request failed');
      push({ kind: 'error', err: streamError });
    };

    xhr.send(body);

    const cleanup: (() => void)[] = [];

    if (signal) {
      const onAbort = () => { xhr.abort(); done = true; const abortErr = new Error('Aborted'); abortErr.name = 'AbortError'; push({ kind: 'error', err: abortErr }); };
      signal.addEventListener('abort', onAbort);
      cleanup.push(() => signal.removeEventListener('abort', onAbort));
    }

    const id = nextChunkId();
    let buf = '';
    let hasFirstToken = false;

    try {
      while (!done || pending.length > 0) {
        let evt: Evt;
        if (pending.length > 0) evt = pending.shift()!;
        else if (done) break;
        else evt = await new Promise<Evt>((r) => { waiter = r; });

        if (evt.kind === 'error') throw evt.err;
        if (evt.kind === 'end') break;

        buf += evt.text;
        const lines = buf.split(/\r?\n/);
        buf = lines.pop() ?? '';

        for (const line of lines) {
          for (const c of parseSSELine(line, id)) {
            if (c.contentDelta && !hasFirstToken) { hasFirstToken = true; perf?.mark('first_token'); }
            yield c;
            if (c.done) { perf?.report(); return; }
          }
        }
      }

      if (buf.trim()) {
        for (const c of parseSSELine(buf, id)) {
          if (c.contentDelta && !hasFirstToken) perf?.mark('first_token');
          yield c;
          if (c.done) { perf?.report(); return; }
        }
      }
    } finally {
      for (const c of cleanup) c();
    }

    perf?.report();
  }

  async generateResponse(params: AICompleteParams): Promise<AIResponse> {
    let content = '';
    for await (const chunk of this.streamChat(params)) {
      content += chunk.contentDelta;
    }
    return { content };
  }
}

export default NvidiaProvider;
