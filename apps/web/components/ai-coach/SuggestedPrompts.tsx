const PROMPTS = [
  'Why did I spend more this month?',
  'Which category wastes the most money?',
  'Suggest a realistic budget for me.',
  'How can I save ₹5000 next month?',
  'Compare this month with last month.',
];

export function SuggestedPrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-500 transition-colors hover:border-brass-500 hover:text-brass-600 dark:border-ink-700 dark:text-ink-400 dark:hover:text-brass-400"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
