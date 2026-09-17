import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const scenarios = JSON.parse(await readFile(new URL('./scenarios.json', import.meta.url)));
const server = spawn(process.execPath, ['src/server.mjs'], { cwd: new URL('..', import.meta.url), stdio: 'ignore' });

async function waitForServer() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:8787/');
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('NIGHTGLASS server did not start');
}

test.after(() => server.kill());

test('serves the boring demo page', async () => {
  await waitForServer();
  const response = await fetch('http://127.0.0.1:8787/');
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /NIGHTGLASS/);
  assert.match(html, /Classify receipt/);
});

test('classifies every reviewed scenario through the HTTP demo', async () => {
  await waitForServer();
  for (const scenario of scenarios) {
    const response = await fetch('http://127.0.0.1:8787/classify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(scenario),
    });
    assert.equal(response.status, 200, scenario.id);
    const result = await response.json();
    assert.equal(result.label, scenario.expected, scenario.id);
    assert.ok(result.signals.length > 0, scenario.id);
  }
});

test('rejects malformed receipts', async () => {
  await waitForServer();
  const response = await fetch('http://127.0.0.1:8787/classify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ evidence: 'missing claim' }),
  });
  assert.equal(response.status, 400);
});
