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

function gatewayError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export async function classifyWithGateway(receipt, env) {
  if (!env.AI || !env.AI_GATEWAY_ID) {
    throw gatewayError('AI Gateway binding and gateway id are required', 'AI_GATEWAY_CREDIT_REQUIRED');
  }
  try {
    const response = await env.AI.run(
      'typesafe/jev',
      {
        state: `Claim: ${receipt.claim}\nEvidence: ${receipt.evidence}`,
        questions,
      },
      { gateway: { id: env.AI_GATEWAY_ID } },
    );
    if (!response?.result?.answers?.label) {
      throw gatewayError('AI Gateway returned no Jev answer', 'AI_GATEWAY_ERROR');
    }
    return { gateway: env.AI_GATEWAY_ID, keySource: response.gatewayMetadata?.keySource, ...response.result };
  } catch (error) {
    if (error.code) throw error;
    const message = String(error);
    throw gatewayError(message, /2049|credential|credit|402|401/i.test(message) ? 'AI_GATEWAY_CREDIT_REQUIRED' : 'AI_GATEWAY_ERROR');
  }
}
