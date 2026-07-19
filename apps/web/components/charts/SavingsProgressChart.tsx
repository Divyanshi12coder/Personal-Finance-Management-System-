'use client';

import * as Progress from '@radix-ui/react-progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/shared/skeleton';
import { Target } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface Goal {
  id: string;
  name: string;
  targetMinor: number;
  currentMinor: number;
  percentComplete: number;
}

function useGoals() {
  return useQuery({ queryKey: ['goals'], queryFn: () => apiClient.get<Goal[]>('/goals') });
}

export function SavingsProgressChart() {
  const { data, isLoading } = useGoals();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !data || data.length === 0 ? (
          <EmptyState icon={Target} title="No savings goals yet" description="Create a goal to start tracking progress toward it." />
        ) : (
          data.map((goal) => (
            <div key={goal.id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium">{goal.name}</span>
                <span className="text-ink-400">
                  {formatMoney(goal.currentMinor)} / {formatMoney(goal.targetMinor)}
                </span>
              </div>
              <Progress.Root className="relative h-2.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                <Progress.Indicator
                  className="h-full rounded-full bg-brass-500 transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${100 - goal.percentComplete}%)` }}
                />
              </Progress.Root>
              <p className="mt-1 text-xs text-ink-400">{goal.percentComplete}% complete</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
