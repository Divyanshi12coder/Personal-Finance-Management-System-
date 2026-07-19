import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amountMinor: number;
  currency: string;
  merchant?: string;
  note?: string;
  occurredOn: string;
  category: Category;
}

interface TransactionsResponse {
  data: Transaction[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useTransactions(filters: Record<string, string | number | undefined> = {}) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== '') as [string, string][],
  ).toString();

  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => apiClient.get<TransactionsResponse>(`/transactions${params ? `?${params}` : ''}`),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get<Category[]>('/categories'),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      type: 'INCOME' | 'EXPENSE';
      amountMinor: number;
      categoryId: string;
      occurredOn: string;
      merchant?: string;
      note?: string;
    }) => apiClient.post<Transaction>('/transactions', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
