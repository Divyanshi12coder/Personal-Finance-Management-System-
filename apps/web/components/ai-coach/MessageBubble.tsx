import { Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AiMessage } from '@/hooks/useAiCoach';

export function MessageBubble({ message }: { message: AiMessage }) {
  const isAssistant = message.role === 'ASSISTANT';
  return (
    <div className={cn('flex gap-3', isAssistant ? 'flex-row' : 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isAssistant ? 'bg-brass-500/15 text-brass-600 dark:text-brass-400' : 'bg-ink-800 text-ink-50',
        )}
        aria-hidden="true"
      >
        {isAssistant ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
          isAssistant
            ? 'bg-white text-ink-900 border border-ink-200/60 dark:bg-ink-800 dark:text-ink-50 dark:border-ink-700'
            : 'bg-brass-500 text-ink-950',
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
