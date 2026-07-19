'use client';

import { useQuery } from '@tanstack/react-query';
import * as Progress from '@radix-ui/react-progress';
import { Target } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/shared/skeleton';
import { formatMoney } from '@/lib/utils';

interface Goal {
  id: string;
  name: string;
  targetMinor: number;
  currentMinor: number;
  percentComplete: number;
  targetDate: string | null;
}

function useGoals() {
  return useQuery({ queryKey: ['goals'], queryFn: () => apiClient.get<Goal[]>('/goals') });
}

export default function GoalsPage() {
  const { data, isLoading } = useGoals();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Savings Goals</h1>
        <p className="text-sm text-ink-400">Track progress toward what you&apos;re saving for.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState icon={Target} title="No savings goals yet" description="Create a goal via the API to start tracking progress." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((goal) => (
            <Card key={goal.id}>
              <CardContent className="p-5">
                <p className="font-medium">{goal.name}</p>
                {goal.targetDate && (
                  <p className="text-xs text-ink-400">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
                )}
                <Progress.Root className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                  <Progress.Indicator
                    className="h-full rounded-full bg-brass-500 transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${100 - goal.percentComplete}%)` }}
                  />
                </Progress.Root>
                <div className="mt-2 flex justify-between text-xs text-ink-400">
                  <span>{formatMoney(goal.currentMinor)} saved</span>
                  <span>{formatMoney(goal.targetMinor)} goal</span>
                </div>
                <p className="mt-1 font-display text-sm font-medium text-brass-600 dark:text-brass-400">
                  {goal.percentComplete}% complete
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
