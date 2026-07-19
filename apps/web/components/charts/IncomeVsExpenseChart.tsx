'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMonthlyTrend } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/shared/skeleton';
import { formatMoney } from '@/lib/utils';

export function IncomeVsExpenseChart() {
  const { data, isLoading } = useMonthlyTrend(6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expense</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.map((d) => ({ ...d, income: d.incomeMinor / 100, expense: d.expenseMinor / 100 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={(value: number) => formatMoney(value * 100)} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
