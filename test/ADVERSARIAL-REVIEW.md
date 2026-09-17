# NIGHTGLASS adversarial review

The suite is intentionally boring. The classifier is not a security boundary.

## Findings and responses

| Finding | Severity | Response |
| --- | --- | --- |
| A word such as `verified` could make a receipt pass without execution evidence. | High | Removed the bare word from the proof signal. Added `boundary-06`. |
| A failed result must win over a success-looking phrase. | High | Check conflict signals before proof signals. Added `boundary-03` and `boundary-09`. |
| Planned work must not become verified work. | High | Check projection before proof. Added the six projected cases and `boundary-07`. |
| Destructive or authority-sensitive work must not become verified because it has a plan. | High | Keep the review label when proof is absent. Added six review cases and `boundary-08`. |
| A malformed request must not receive a classifier result. | Medium | The HTTP route returns 400. Added an end-to-end malformed-input test. |
| The test must exercise the same HTTP path as the demo. | High | The suite starts `src/server.mjs`, calls `/classify`, and checks `/`. |
| A 2xx response must be treated as direct evidence. | Medium | Support live, smoke, and GET requests with 2xx responses. Added `boundary-02`. |
| A 5xx response must remain contradictory. | High | Check HTTP 5xx before proof. Covered by several contradictory cases. |
| A review label should not require the classifier to understand every noun. | Medium | Use explicit authority and destructive-action signals. Keep the result conservative. |
| The fixed suite can still be overfit. | High | Keep the test set visible as a behavior contract and add a separate unseen set before claiming general accuracy. |

## Remaining limits

The cases test a narrow receipt vocabulary. They do not establish accuracy on arbitrary agent traces, natural language, or production data. The next suite should add held-out receipts written after the classifier rules are frozen.
