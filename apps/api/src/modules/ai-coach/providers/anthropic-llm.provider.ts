import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { ILlmProvider } from '../llm.provider';

@Injectable()
export class AnthropicLlmProvider implements ILlmProvider {
  private readonly logger = new Logger(AnthropicLlmProvider.name);
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.client = new Anthropic({ apiKey: this.config.get<string>('ANTHROPIC_API_KEY') });
    this.model = this.config.get<string>('AI_COACH_MODEL') ?? 'claude-sonnet-4-6';
  }

  async complete({ system, prompt, maxTokens = 700 }: { system: string; prompt: string; maxTokens?: number }): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: prompt }],
      });
      const textBlock = response.content.find((b) => b.type === 'text');
      return textBlock && 'text' in textBlock ? textBlock.text : '';
    } catch (err) {
      this.logger.error('Anthropic API call failed', err as Error);
      throw err;
    }
  }
}
