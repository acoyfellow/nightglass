# NIGHTGLASS

NIGHTGLASS checks whether evidence supports an agent claim. It returns one of five labels. The owned classifier is local and deterministic. Jev is an optional comparison service. NIGHTGLASS does not require Jev.

## Use it

Requires Node.js 20 or later.

```sh
git clone https://github.com/acoyfellow/nightglass.git
cd nightglass
npm test
npm start
```

Send a claim and its evidence:

```sh
curl -sS http://localhost:8787/classify \
  -H 'content-type: application/json' \
  --data '{
    "claim": "The endpoint is healthy.",
    "evidence": "The smoke test returned HTTP 500."
  }'
```

NIGHTGLASS returns:

```json
{
  "label": "contradictory",
  "confidence": 0.92,
  "signals": ["evidence reports a failed or conflicting result"]
}
```

You can also open `http://localhost:8787` and use the form.

## Use it from an agent

Call NIGHTGLASS after the agent completes a task and before your system accepts the result.

```text
agent result
    ↓
{ claim, evidence }
    ↓
NIGHTGLASS
    ↓
accept, request proof, reject, wait, or review
```

Example JavaScript:

```js
const response = await fetch("http://localhost:8787/classify", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    claim: agentResult.summary,
    evidence: agentResult.proof,
  }),
});

const decision = await response.json();

switch (decision.label) {
  case "verified":
    accept(agentResult);
    break;
  case "incomplete":
    requestMoreEvidence();
    break;
  case "contradictory":
    reject(agentResult);
    break;
  case "projected":
    keepTaskOpen();
    break;
  case "needs_review":
    sendToHuman();
    break;
}
```

Treat the result as a routing signal. Do not use it as a security boundary or as permission for a destructive action.

## Labels

| Label | Meaning | Suggested action |
|---|---|---|
| `verified` | Direct evidence supports the claim. | Accept the result. |
| `incomplete` | The claim lacks direct proof. | Request evidence. |
| `contradictory` | The evidence conflicts with the claim. | Reject the result. |
| `projected` | The agent describes future work. | Keep the task open. |
| `needs_review` | Authority or safety is unclear. | Ask a human. |

## Use the classifier as a module

```js
import { classifyReceipt } from "./src/classifier.mjs";

const result = classifyReceipt({
  claim: "The tests pass.",
  evidence: "The test command exited with code 0.",
});
```

The input requires two strings: `claim` and `evidence`. The function has no network dependency.

## Run on Cloudflare Workers

```sh
npx wrangler dev
```

The Worker accepts the same `POST /classify` request. The normal path uses only the owned classifier.

To compare the owned result with Jev, configure an AI Gateway and request comparison mode:

```sh
npx wrangler dev --remote --var AI_GATEWAY_ID:my-ax

curl -sS 'http://localhost:8787/classify?mode=comparison' \
  -H 'content-type: application/json' \
  --data '{"claim":"The endpoint is healthy.","evidence":"The smoke test returned HTTP 500."}'
```

Comparison mode calls `typesafe/jev` through the configured Cloudflare AI Gateway. It never replaces the owned result. It fails closed if Jev does not return a result.

## Test and benchmark

```sh
npm test
npm run benchmark
```

The test suite exercises 40 behavior cases through the HTTP API. The benchmark writes a machine-readable receipt. See [`test/ADVERSARIAL-REVIEW.md`](test/ADVERSARIAL-REVIEW.md) for known risks.

NIGHTGLASS is an early baseline. A fixed test set is not proof of general accuracy. Test it with unseen receipts before you use it in a workflow.
