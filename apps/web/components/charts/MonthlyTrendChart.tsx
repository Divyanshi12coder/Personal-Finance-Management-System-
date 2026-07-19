'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMonthlyTrend } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/shared/skeleton';
import { formatMoney } from '@/lib/utils';

export function MonthlyTrendChart() {
  const { data, isLoading } = useMonthlyTrend(6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Spending Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.map((d) => ({ ...d, income: d.incomeMinor / 100, expense: d.expenseMinor / 100 }))}>
              <defs>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                formatter={(value: number) => formatMoney(value * 100)}
                contentStyle={{ borderRadius: 8, fontSize: 13 }}
              />
              <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#incomeGradient)" strokeWidth={2} name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="url(#expenseGradient)" strokeWidth={2} name="Expense" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
