'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/empty-state';
import { MessageBubble } from '@/components/ai-coach/MessageBubble';
import { SuggestedPrompts } from '@/components/ai-coach/SuggestedPrompts';
import {
  useConversations,
  useConversation,
  useStartConversation,
  useAskCoach,
} from '@/hooks/useAiCoach';
import { cn } from '@/lib/utils';

export default function AiCoachPage() {
  const { data: conversations } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const { data: conversation, isLoading: loadingConversation } = useConversation(activeId);
  const startConversation = useStartConversation();
  const askCoach = useAskCoach(activeId);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversation?.messages?.length]);

  const handleNewConversation = async () => {
    const conv = await startConversation.mutateAsync();
    setActiveId(conv.id);
  };

  const handleSend = async (question: string) => {
    if (!question.trim()) return;
    let convId = activeId;
    if (!convId) {
      const conv = await startConversation.mutateAsync();
      convId = conv.id;
      setActiveId(convId);
    }
    setInput('');
    await askCoach.mutateAsync(question);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversation list */}
      <aside className="hidden w-64 shrink-0 flex-col gap-2 md:flex">
        <Button variant="secondary" size="sm" onClick={handleNewConversation}>
          + New conversation
        </Button>
        <div className="flex flex-col gap-1 overflow-y-auto">
          {conversations?.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                'truncate rounded-lg px-3 py-2 text-left text-sm',
                activeId === c.id
                  ? 'bg-brass-500/10 text-brass-600 dark:text-brass-400'
                  : 'text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800',
              )}
            >
              {c.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Chat window */}
      <div className="flex flex-1 flex-col rounded-xl border border-ink-200/60 bg-white dark:border-ink-700 dark:bg-ink-900">
        <div className="border-b border-ink-200/60 p-4 dark:border-ink-700">
          <h1 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-brass-500" /> AI Financial Coach
          </h1>
          <p className="text-xs text-ink-400">Answers are grounded in your real transaction history — not generic advice.</p>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {!activeId || !conversation?.messages?.length ? (
            <EmptyState
              icon={Sparkles}
              title="Ask me anything about your money"
              description="I'll explain the why behind your spending using your actual transactions."
              action={<SuggestedPrompts onSelect={handleSend} />}
            />
          ) : loadingConversation ? (
            <p className="text-sm text-ink-400">Loading conversation…</p>
          ) : (
            conversation.messages.map((m) => <MessageBubble key={m.id} message={m} />)
          )}
          {askCoach.isPending && (
            <div className="flex items-center gap-2 text-sm text-ink-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking through your numbers…
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2 border-t border-ink-200/60 p-4 dark:border-ink-700"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Why did I spend more this month?"
            aria-label="Ask the AI coach a question"
          />
          <Button type="submit" size="md" disabled={askCoach.isPending || !input.trim()} aria-label="Send question">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
