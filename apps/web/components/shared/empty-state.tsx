import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

/** A consistent "nothing here yet" state used across every list/table in the app. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-300 p-10 text-center dark:border-ink-700', className)}>
      <Icon className="h-8 w-8 text-ink-400" aria-hidden="true" />
      <div>
        <p className="font-display text-base font-medium">{title}</p>
        <p className="mt-1 text-sm text-ink-400">{description}</p>
      </div>
      {action}
    </div>
  );
}
