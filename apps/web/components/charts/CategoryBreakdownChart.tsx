'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useCategoryBreakdown } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { PieChart as PieChartIcon } from 'lucide-react';
import { formatMoney } from '@/lib/utils';

const COLORS = ['#c9a227', '#f43f5e', '#22c55e', '#2A5DFF', '#f59e0b', '#a855f7', '#0ea5e9', '#64748b'];

export function CategoryBreakdownChart() {
  const { data, isLoading } = useCategoryBreakdown();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !data || data.length === 0 ? (
          <EmptyState icon={PieChartIcon} title="No spending yet" description="Add an expense to see your category breakdown." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                dataKey="totalMinor"
                nameKey="categoryName"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.map((entry, i) => (
                  <Cell key={entry.categoryId} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatMoney(value)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
