const questions = {
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
};

export async function classifyWithGateway(receipt, env) {
  if (!env.AI_GATEWAY_URL) {
    const error = new Error('AI Gateway credit or configuration is required');
    error.code = 'AI_GATEWAY_CREDIT_REQUIRED';
    throw error;
  }
  const headers = { 'content-type': 'application/json' };
  if (env.AI_GATEWAY_TOKEN) headers.authorization = `Bearer ${env.AI_GATEWAY_TOKEN}`;
  const response = await fetch(env.AI_GATEWAY_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'typesafe/jev',
      state: `Claim: ${receipt.claim}\nEvidence: ${receipt.evidence}`,
      questions,
    }),
  });
  if (!response.ok) {
    const error = new Error(`AI Gateway returned HTTP ${response.status}`);
    error.code = response.status === 402 || response.status === 401 ? 'AI_GATEWAY_CREDIT_REQUIRED' : 'AI_GATEWAY_ERROR';
    throw error;
  }
  return response.json();
}
