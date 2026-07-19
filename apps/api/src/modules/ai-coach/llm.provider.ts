/**
 * Provider-agnostic LLM interface. The AI Coach service depends on this
 * interface, not on the Anthropic SDK directly — swapping providers
 * (or adding a second one for A/B testing) means writing one new class,
 * not touching orchestration logic.
 */
export interface ILlmProvider {
  complete(params: { system: string; prompt: string; maxTokens?: number }): Promise<string>;
}

export const LLM_PROVIDER = 'LLM_PROVIDER';
