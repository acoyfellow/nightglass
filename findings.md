# NIGHTGLASS findings

## Iteration 1

The owned rule baseline scored 2/5 (0.40) on the five-example fixed set. Jev scored 5/5 (1.00) on the same examples after five API calls.

The baseline failed because it treats words such as `but`, `delete`, and `HTTP 500` as isolated signals. It does not understand which statement is the claim and which statement is the evidence. It also let a contradiction pattern hide the missing-proof and review cases.

This is a useful negative result. A small list of keywords is not enough. The next owned version must model claim/evidence relationships explicitly. Jev remains an offline comparison only.

The 0.80 target is not met. The claim is unproven.
