export const config = {
    runtime: 'edge',
};

type Role = 'user' | 'assistant' | 'system';

type ChatHistoryMessage = {
    role: Exclude<Role, 'system'>;
    content: string;
};

type ChatRequest = {
    text: string;
    conversationId?: string;
    sessionId?: string;
    uid?: string;
    history?: ChatHistoryMessage[];
};

type StreamChunk = {
    id: string;
    contentDelta: string;
    done?: boolean;
};

function jsonResponse(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

function safeText(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

function getUidFromRequest(request: Request, body: ChatRequest): string | null {
    const uidHeader = request.headers.get('x-uid');
    if (uidHeader && uidHeader.trim().length > 0) return uidHeader.trim();
    // Minimal fallback (legacy codebase uses x-uid; keep strict-ish)
    const uidBody = body?.uid;
    if (uidBody && typeof uidBody === 'string' && uidBody.trim().length > 0) return uidBody.trim();
    return null;
}

async function* toFetchStream(stream: ReadableStream<Uint8Array | Uint8Array<ArrayBuffer>>): AsyncGenerator<StreamChunk> {
    const typedStream = stream as ReadableStream<Uint8Array>;
    stream = typedStream;

    const reader = stream.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let done = false;

    while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() ?? '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                const withoutPrefix = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;

                let isJsonHandled = false;
                if (withoutPrefix.startsWith('{') || withoutPrefix.startsWith('[')) {
                    try {
                        const parsed = JSON.parse(withoutPrefix);
                        isJsonHandled = true;

                        const delta =
                            (typeof parsed?.choices?.[0]?.delta?.content === 'string' && parsed.choices[0].delta.content) ||
                            (typeof parsed?.choices?.[0]?.text === 'string' && parsed.choices[0].text) ||
                            (typeof parsed?.content === 'string' && parsed.content);

                        if (typeof delta === 'string' && delta.length > 0) {
                            yield { id: crypto.randomUUID(), contentDelta: delta };
                        }

                        if (parsed?.choices?.[0]?.finish_reason === 'stop' || parsed?.done === true) {
                            return;
                        }
                    } catch {
                        // Not JSON; fall through.
                    }
                }

                if (!isJsonHandled && withoutPrefix.length > 0) {
                    yield { id: crypto.randomUUID(), contentDelta: withoutPrefix };
                }
            }
        }
    }

    yield { id: crypto.randomUUID(), contentDelta: '', done: true };
}

export default async function handler(request: Request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-uid',
            },
        });
    }

    if (request.method !== 'POST') {
        return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    let body: ChatRequest;
    try {
        body = (await request.json()) as ChatRequest;
    } catch {
        return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const text = safeText(body?.text).trim();
    if (!text) return jsonResponse({ error: 'Missing text' }, 400);

    const uid = getUidFromRequest(request, body);
    if (!uid) {
        return jsonResponse({ error: 'Missing uid. Provide x-uid header.' }, 401);
    }

    const history = Array.isArray(body.history) ? body.history : [];

    // Minimal system prompt (single source of truth remains server-side).
    // Profile/tone retrieval from Firestore/auth is not available in this repo yet,
    // so we keep current server prompt while keeping request contract forward-compatible.
    const system = 'You are Velness, a compassionate mental wellness companion. Do not diagnose. Follow safety protocol.';

    const messages: Array<{ role: Role; content: string }> = [
        { role: 'system', content: system },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: text },
    ];

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
        return jsonResponse({ error: 'NVIDIA_API_KEY is not configured on the server.' }, 500);
    }

    const targetUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
    const model = process.env.VITE_NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b';

    const upstreamResp = await fetch(targetUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.6,
            top_p: 0.95,
            reasoning_budget: 16384,
            max_tokens: 16384,
            chat_template_kwargs: { enable_thinking: true },
            stream: true,
        }),
    });

    if (!upstreamResp.ok || !upstreamResp.body) {
        const errText = await upstreamResp.text().catch(() => '');
        return jsonResponse({ error: 'NVIDIA request failed', details: errText }, 502);
    }

    const upstreamBody = upstreamResp.body as ReadableStream<Uint8Array>;
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            try {
                for await (const chunk of toFetchStream(upstreamBody)) {
                    controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'));
                    if (chunk.done) break;
                }
                controller.close();
            } catch (e) {
                controller.error(e);
            }
        },
    });

    return new Response(stream, {
        status: 200,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
        },
    });
}
