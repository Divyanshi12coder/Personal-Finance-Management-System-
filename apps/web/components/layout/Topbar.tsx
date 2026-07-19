'use client';

import { useAuthStore } from '@/stores/auth-store';
import { ThemeToggle } from './ThemeToggle';

export function Topbar() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="flex h-16 items-center justify-between border-b border-ink-200/60 bg-white px-6 dark:border-ink-700 dark:bg-ink-900">
      <div>
        <p className="font-display text-sm text-ink-400">Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}</p>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-800 font-display text-sm text-ink-50 dark:bg-brass-500 dark:text-ink-950">
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
      </div>
    </header>
  );
}
