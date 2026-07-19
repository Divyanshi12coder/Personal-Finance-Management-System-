import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Summary {
  income: number;
  expense: number;
  net: number;
  incomeDeltaPercent: number;
  expenseDeltaPercent: number;
  netDeltaPercent: number;
}

export interface MonthlyPoint {
  month: string;
  incomeMinor: number;
  expenseMinor: number;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  totalMinor: number;
  percentOfTotal: number;
}

export function useSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => apiClient.get<Summary>('/analytics/summary'),
  });
}

export function useMonthlyTrend(months = 6) {
  return useQuery({
    queryKey: ['analytics', 'monthly-trend', months],
    queryFn: () => apiClient.get<MonthlyPoint[]>(`/analytics/monthly-trend?months=${months}`),
  });
}

export function useCategoryBreakdown() {
  return useQuery({
    queryKey: ['analytics', 'category-breakdown'],
    queryFn: () => apiClient.get<CategoryBreakdownItem[]>('/analytics/category-breakdown'),
  });
}
