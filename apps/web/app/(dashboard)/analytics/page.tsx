import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import { IncomeVsExpenseChart } from '@/components/charts/IncomeVsExpenseChart';
import { SavingsProgressChart } from '@/components/charts/SavingsProgressChart';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-ink-400">A deeper look at how your money moves over time.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MonthlyTrendChart />
        <CategoryBreakdownChart />
        <IncomeVsExpenseChart />
        <SavingsProgressChart />
      </div>
    </div>
  );
}
