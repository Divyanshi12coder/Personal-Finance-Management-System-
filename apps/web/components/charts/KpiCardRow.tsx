'use client';

import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/shared/skeleton';
import { useSummary } from '@/hooks/useAnalytics';
import { cn, formatMoney, formatPercent } from '@/lib/utils';

function KpiCard({
  label,
  valueMinor,
  deltaPercent,
  icon: Icon,
  tone,
}: {
  label: string;
  valueMinor: number;
  deltaPercent: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'green' | 'rose' | 'brass';
}) {
  const positive = deltaPercent >= 0;
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-ink-400">{label}</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{formatMoney(valueMinor)}</p>
          <p
            className={cn(
              'mt-1 flex items-center gap-1 text-xs font-medium',
              positive ? 'text-signal-green' : 'text-signal-rose',
            )}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {formatPercent(deltaPercent)} vs last month
          </p>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            tone === 'green' && 'bg-signal-green/10 text-signal-green',
            tone === 'rose' && 'bg-signal-rose/10 text-signal-rose',
            tone === 'brass' && 'bg-brass-500/10 text-brass-600 dark:text-brass-400',
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiCardRow() {
  const { data, isLoading } = useSummary();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <KpiCard label="Income this month" valueMinor={data.income} deltaPercent={data.incomeDeltaPercent} icon={Wallet} tone="green" />
      <KpiCard label="Expense this month" valueMinor={data.expense} deltaPercent={-data.expenseDeltaPercent} icon={TrendingDown} tone="rose" />
      <KpiCard label="Net this month" valueMinor={data.net} deltaPercent={data.netDeltaPercent} icon={PiggyBank} tone="brass" />
    </div>
  );
}
