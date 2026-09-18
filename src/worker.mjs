import { classifyReceipt } from './classifier.mjs';
import { classifyWithGateway } from './gateway.mjs';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/classify') {
      return new Response('Not found', { status: 404 });
    }
    let receipt;
    try {
      receipt = await request.json();
      if (typeof receipt.claim !== 'string' || typeof receipt.evidence !== 'string') throw new Error('invalid receipt');
    } catch {
      return json({ error: 'Send JSON with claim and evidence.' }, 400);
    }
    const owned = classifyReceipt(receipt);
    if (new URL(request.url).searchParams.get('mode') !== 'comparison') {
      return json({ classifier: 'nightglass-owned-v0', owned });
    }
    try {
      const jev = await classifyWithGateway(receipt, env);
      return json({ classifier: 'nightglass-owned-v0', owned, jev, comparison: { model: 'typesafe/jev', complete: true } });
    } catch (error) {
      const code = error.code || 'AI_GATEWAY_ERROR';
      return json({ error: code, owned, comparison: { model: 'typesafe/jev', complete: false } }, code === 'AI_GATEWAY_CREDIT_REQUIRED' ? 402 : 502);
    }
  },
};
