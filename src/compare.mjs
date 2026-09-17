import { readFile, writeFile } from 'node:fs/promises';

const owned = JSON.parse(await readFile(new URL('../receipts/owned-baseline.json', import.meta.url)));
const jev = JSON.parse(await readFile(new URL('../receipts/jev-reference.json', import.meta.url)));
const jevById = new Map(jev.results.map((item) => [item.id, item.jev]));
const disagreements = owned.results.flatMap((item) => {
  const reference = jevById.get(item.id);
  return reference?.choice === item.owned.label ? [] : [{ id: item.id, owned: item.owned, jev: reference }];
});
const report = {
  experiment: 'NIGHTGLASS',
  threshold: 0.8,
  ownedAccuracy: owned.accuracy,
  jevAccuracy: jev.accuracy,
  meetsThreshold: owned.accuracy >= 0.8,
  disagreements,
};
await writeFile(new URL('../receipts/comparison.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
