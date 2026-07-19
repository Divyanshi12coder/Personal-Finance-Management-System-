import { KpiCardRow } from '@/components/charts/KpiCardRow';
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import { IncomeVsExpenseChart } from '@/components/charts/IncomeVsExpenseChart';
import { SavingsProgressChart } from '@/components/charts/SavingsProgressChart';
import { ErrorBoundary } from '@/components/shared/error-boundary';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-ink-400">Your financial picture at a glance.</p>
      </div>

      <ErrorBoundary>
        <KpiCardRow />
      </ErrorBoundary>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ErrorBoundary>
          <MonthlyTrendChart />
        </ErrorBoundary>
        <ErrorBoundary>
          <CategoryBreakdownChart />
        </ErrorBoundary>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ErrorBoundary>
          <IncomeVsExpenseChart />
        </ErrorBoundary>
        <ErrorBoundary>
          <SavingsProgressChart />
        </ErrorBoundary>
      </div>
    </div>
  );
}
