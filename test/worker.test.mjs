import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';

const receipt = {
  claim: 'The endpoint is healthy.',
  evidence: 'The smoke test returned HTTP 500.',
};

test('returns the owned decision without a Jev binding', async () => {
  const response = await worker.fetch(new Request('https://nightglass.test/classify', {
    method: 'POST',
    body: JSON.stringify(receipt),
    headers: { 'content-type': 'application/json' },
  }), {});
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    classifier: 'nightglass-owned-v0',
    owned: {
      label: 'contradictory',
      confidence: 0.92,
      signals: ['evidence reports a failed or conflicting result'],
    },
  });
});

test('requires AI Gateway credit for comparison mode', async () => {
  const response = await worker.fetch(new Request('https://nightglass.test/classify?mode=comparison', {
    method: 'POST',
    body: JSON.stringify(receipt),
    headers: { 'content-type': 'application/json' },
  }), {});
  assert.equal(response.status, 402);
  assert.deepEqual(await response.json(), {
    error: 'AI_GATEWAY_CREDIT_REQUIRED',
    owned: {
      label: 'contradictory',
      confidence: 0.92,
      signals: ['evidence reports a failed or conflicting result'],
    },
    comparison: { model: 'typesafe/jev', complete: false },
  });
});

test('returns a validation error for malformed input', async () => {
  const response = await worker.fetch(new Request('https://nightglass.test/classify', {
    method: 'POST',
    body: JSON.stringify({ evidence: 'missing claim' }),
    headers: { 'content-type': 'application/json' },
  }), {});
  assert.equal(response.status, 400);
});
