import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { classifyReceipt } from './classifier.mjs';

const receipts = JSON.parse(await readFile(new URL('../data/receipts.json', import.meta.url)));
const results = receipts.map((receipt) => ({
  id: receipt.id,
  expected: receipt.label,
  owned: classifyReceipt(receipt),
}));
const correct = results.filter(({ expected, owned }) => expected === owned.label).length;
const report = {
  experiment: 'NIGHTGLASS',
  model: 'owned-rule-baseline',
  total: results.length,
  correct,
  accuracy: correct / results.length,
  results,
};
await mkdir(new URL('../receipts/', import.meta.url), { recursive: true });
await writeFile(new URL('../receipts/owned-baseline.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
