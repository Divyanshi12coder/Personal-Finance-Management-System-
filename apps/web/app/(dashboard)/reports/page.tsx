'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/shared/skeleton';
import { formatMoney } from '@/lib/utils';

interface MonthlyReport {
  period: string;
  summary: { income: number; expense: number; net: number };
  categoryBreakdown: { categoryName: string; totalMinor: number; percentOfTotal: number }[];
  transactionCount: number;
}

export default function ReportsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const { data, isLoading } = useQuery({
    queryKey: ['reports', month],
    queryFn: () => apiClient.get<MonthlyReport>(`/reports/monthly/${month}`),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Monthly Report</h1>
          <p className="text-sm text-ink-400">A generated summary of a single month&apos;s activity.</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm dark:border-ink-600 dark:bg-ink-800"
          aria-label="Select report month"
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !data || data.transactionCount === 0 ? (
        <EmptyState icon={FileText} title="No activity this month" description="Nothing was recorded for this period yet." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-ink-400">Income</p>
              <p className="font-display text-xl font-semibold text-signal-green">{formatMoney(data.summary.income)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-ink-400">Expense</p>
              <p className="font-display text-xl font-semibold text-signal-rose">{formatMoney(data.summary.expense)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-ink-400">Net</p>
              <p className="font-display text-xl font-semibold">{formatMoney(data.summary.net)}</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardContent className="p-5">
              <p className="mb-3 text-sm font-medium">Category Breakdown</p>
              <ul className="space-y-2">
                {data.categoryBreakdown.map((c) => (
                  <li key={c.categoryName} className="flex items-center justify-between text-sm">
                    <span>{c.categoryName}</span>
                    <span className="tabular-nums text-ink-400">
                      {formatMoney(c.totalMinor)} ({c.percentOfTotal}%)
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
