# NIGHTGLASS

NIGHTGLASS tests whether a small classifier that we own can judge if an agent result is supported by its evidence.

The first version is intentionally simple. It uses a local classifier and a five-example receipt set. TypeSafe is an optional reference only. The owned path never calls TypeSafe.

## Run the owned benchmark

```sh
cd /Users/jcoeyman/cloudflare/nightglass
npm run benchmark
```

The command writes `receipts/owned-baseline.json`. The receipt records the examples, expected labels, predictions, confidence, and signals.

## Labels

- `verified`: direct evidence supports the claim.
- `incomplete`: the claim has no direct proof.
- `contradictory`: the evidence conflicts with the claim.
- `projected`: the result describes planned work.
- `needs_review`: authority, safety, or destructive-action details are unresolved.

## Boundary

The local classifier is a baseline, not a trusted security boundary. A failed or uncertain result must not authorize a destructive action.

## Open the demo

```sh
cd /Users/jcoeyman/cloudflare/nightglass
npm start
```

Open `http://localhost:8787`, paste a claim and its evidence, and select **Classify receipt**. This path uses only the owned classifier. It works with no TypeSafe token.

## Reference comparison

The Jev comparison is deliberately separate and makes five API calls:

```sh
node src/jev-reference.mjs --refresh
```

It writes `receipts/jev-reference.json`. Without `--refresh`, the command replays the cached reference receipt and makes no API call. Do not run it against production data. The token is loaded from the macOS Keychain and is never written to the repository.

After both runs, create the comparison receipt:

```sh
node src/compare.mjs
```

This writes `receipts/comparison.json`, including the threshold result and every disagreement.

The first baseline scored 2/5. After making the evidence checks explicit, the revised baseline scores 5/5 on this fixed set. This does not prove general accuracy. The set is too small and the classifier was tuned against it. The next experiment must add unseen receipts before we claim success.

## Behavior suite

The reviewed behavior contract has 40 cases across verified, incomplete, contradictory, projected, needs-review, and boundary behavior. Run the complete HTTP end-to-end suite with:

```sh
npm test
```

The suite starts the real demo server, checks the page, sends every case through `/classify`, and checks malformed input. The adversarial review is in `test/ADVERSARIAL-REVIEW.md`.
