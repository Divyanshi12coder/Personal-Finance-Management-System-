import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { FinancialContextBuilder } from './financial-context.builder';
import { AiCoachCacheService } from './cache/ai-coach-cache.service';
import { ILlmProvider, LLM_PROVIDER } from './llm.provider';
import { AI_COACH_SYSTEM_PROMPT, buildCoachPrompt } from './prompt-templates/coach.prompt';

@Injectable()
export class AiCoachService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contextBuilder: FinancialContextBuilder,
    private readonly cache: AiCoachCacheService,
    @Inject(LLM_PROVIDER) private readonly llm: ILlmProvider,
  ) {}

  async listConversations(userId: string) {
    return this.prisma.aiConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
  }

  async getConversation(userId: string, conversationId: string) {
    const conversation = await this.prisma.aiConversation.findFirst({
      where: { id: conversationId, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conversation) throw new NotFoundException({ code: 'CONVERSATION_NOT_FOUND', message: 'Conversation not found.' });
    return conversation;
  }

  async startConversation(userId: string) {
    return this.prisma.aiConversation.create({ data: { userId } });
  }

  /**
   * The core RAG pipeline:
   *  1. Build a structured financial snapshot (SQL aggregates, not raw rows).
   *  2. Check the response cache (keyed by question + snapshot hash).
   *  3. On a miss, call the LLM with the snapshot as grounding context.
   *  4. Persist both the user's question and the assistant's answer,
   *     storing the exact snapshot used — so every answer is auditable.
   */
  async ask(userId: string, conversationId: string, question: string) {
    const conversation = await this.prisma.aiConversation.findFirst({ where: { id: conversationId, userId } });
    if (!conversation) throw new NotFoundException({ code: 'CONVERSATION_NOT_FOUND', message: 'Conversation not found.' });

    await this.prisma.aiMessage.create({
      data: { conversationId, role: 'USER', content: question },
    });

    const context = await this.contextBuilder.build(userId);
    const cacheKey = this.cache.buildKey(userId, question, context);

    let answer = await this.cache.get(cacheKey);
    if (!answer) {
      answer = await this.llm.complete({
        system: AI_COACH_SYSTEM_PROMPT,
        prompt: buildCoachPrompt(question, context),
      });
      await this.cache.set(cacheKey, answer);
    }

    const assistantMessage = await this.prisma.aiMessage.create({
      data: { conversationId, role: 'ASSISTANT', content: answer, contextSnapshot: context as never },
    });

    // First question in a fresh conversation becomes its title.
    if ((await this.prisma.aiMessage.count({ where: { conversationId } })) === 2) {
      await this.prisma.aiConversation.update({
        where: { id: conversationId },
        data: { title: question.slice(0, 60), updatedAt: new Date() },
      });
    } else {
      await this.prisma.aiConversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
    }

    return assistantMessage;
  }
}
