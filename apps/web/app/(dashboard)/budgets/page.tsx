'use client';

import { useQuery } from '@tanstack/react-query';
import * as Progress from '@radix-ui/react-progress';
import { PiggyBank, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/shared/skeleton';
import { cn, formatMoney } from '@/lib/utils';

interface BudgetWithProgress {
  id: string;
  limitMinor: number;
  spentMinor: number;
  remainingMinor: number;
  percentUsed: number;
  isOverBudget: boolean;
  category: { name: string };
}

function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => apiClient.get<BudgetWithProgress[]>('/budgets'),
  });
}

export default function BudgetsPage() {
  const { data, isLoading } = useBudgets();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Budgets</h1>
        <p className="text-sm text-ink-400">Track spend against each category&apos;s monthly limit.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No budgets set yet"
          description="Set a monthly limit per category from the API (or the budgets creation form) to see progress here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((budget) => (
            <Card key={budget.id}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium">{budget.category.name}</p>
                  {budget.isOverBudget && <AlertTriangle className="h-4 w-4 text-signal-amber" aria-label="Over budget" />}
                </div>
                <Progress.Root className="relative h-2.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                  <Progress.Indicator
                    className={cn(
                      'h-full rounded-full transition-transform duration-500 ease-out',
                      budget.isOverBudget ? 'bg-signal-rose' : 'bg-brass-500',
                    )}
                    style={{ transform: `translateX(-${100 - Math.min(100, budget.percentUsed)}%)` }}
                  />
                </Progress.Root>
                <div className="mt-2 flex justify-between text-xs text-ink-400">
                  <span>{formatMoney(budget.spentMinor)} spent</span>
                  <span>{formatMoney(budget.limitMinor)} limit</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
