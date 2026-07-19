'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Target,
  BarChart3,
  Sparkles,
  FileText,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budgets', label: 'Budgets', icon: PiggyBank },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/ai-coach', label: 'AI Coach', icon: Sparkles },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="hidden w-60 shrink-0 flex-col border-r border-ink-200/60 bg-white p-4 dark:border-ink-700 dark:bg-ink-900 md:flex"
    >
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass-500 font-display text-sm font-bold text-ink-950">
          F
        </span>
        <span className="font-display text-lg font-semibold">FinPilot AI</span>
      </Link>

      <ul className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-brass-500/10 text-brass-600 dark:text-brass-400'
                    : 'text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
