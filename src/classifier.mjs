const contradictionPattern = /http\s+5\d\d|returned an error|failed|failure|conflicts with/i;
const proofPattern = /exited with code 0|(?:smoke test|live request|get request) returned http 2\d\d|second query confirmed|captured smoke test/i;
const projectionPattern = /will |planned|plan to|todo|not yet|future/i;
const reviewPattern = /delete|deletions|not confirmed|owner|permission|safe to run/i;

export function classifyReceipt(receipt) {
  const claim = receipt.claim.toLowerCase();
  const evidence = receipt.evidence.toLowerCase();
  const text = `${claim} ${evidence}`;
  const hasDirectProof = proofPattern.test(evidence);
  const hasConflict = contradictionPattern.test(evidence);

  if (hasConflict) {
    return { label: 'contradictory', confidence: 0.92, signals: ['evidence reports a failed or conflicting result'] };
  }
  if (projectionPattern.test(text)) {
    return { label: 'projected', confidence: 0.86, signals: ['future-tense or planned work'] };
  }
  if (reviewPattern.test(text) && !hasDirectProof) {
    return { label: 'needs_review', confidence: 0.78, signals: ['authority or destructive-action uncertainty'] };
  }
  if (hasDirectProof) {
    return { label: 'verified', confidence: 0.88, signals: ['direct execution evidence'] };
  }
  return { label: 'incomplete', confidence: 0.8, signals: ['claim lacks direct execution evidence'] };
}
