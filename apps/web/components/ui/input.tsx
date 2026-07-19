import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400',
        'dark:border-ink-600 dark:bg-ink-800 dark:text-ink-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
