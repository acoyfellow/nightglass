import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const cachedUrl = new URL('../receipts/jev-reference.json', import.meta.url);
if (!process.argv.includes('--refresh')) {
  try {
    console.log(await readFile(cachedUrl, 'utf8'));
    process.exit(0);
  } catch {}
}
const token = execFileSync('security', ['find-generic-password', '-a', process.env.USER, '-s', 'typesafe.ai', '-w'], { encoding: 'utf8' }).trim();
const receipts = JSON.parse(await readFile(new URL('../data/receipts.json', import.meta.url)));
const results = [];

for (const receipt of receipts) {
  const response = await fetch('https://api.typesafe.ai/v1/systemone', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      state: `Claim: ${receipt.claim}\nEvidence: ${receipt.evidence}`,
      model: 'jev-latest',
      questions: {
        label: {
          type: 'choice',
          instructions: 'What is the strongest evidence status of this agent result?',
          criteria: {
            verified: 'Direct evidence supports the claim.',
            incomplete: 'The claim lacks enough direct evidence.',
            contradictory: 'The evidence conflicts with the claim.',
            projected: 'The result describes planned or future work.',
            needs_review: 'Safety, authority, or destructive-action details need human review.',
          },
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`TypeSafe returned HTTP ${response.status}`);
  const body = await response.json();
  results.push({ id: receipt.id, expected: receipt.label, jev: body.answers.label });
}

const correct = results.filter(({ expected, jev }) => expected === jev.choice).length;
const report = { experiment: 'NIGHTGLASS', model: 'jev-latest', total: results.length, correct, accuracy: correct / results.length, results };
await mkdir(new URL('../receipts/', import.meta.url), { recursive: true });
await writeFile(new URL('../receipts/jev-reference.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
