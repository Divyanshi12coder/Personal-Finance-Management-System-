'use client';

import { useState } from 'react';
import { Plus, Trash2, ArrowLeftRight } from 'lucide-react';
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions';
import { TransactionFormSheet } from '@/components/transactions/TransactionFormSheet';
import { ReceiptUploader } from '@/components/transactions/ReceiptUploader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { formatMoney, cn } from '@/lib/utils';

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const { data, isLoading } = useTransactions({ page, limit: 20 });
  const deleteTransaction = useDeleteTransaction();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Transactions</h1>
          <p className="text-sm text-ink-400">All your income and expenses in one place.</p>
        </div>
        <div className="flex gap-2">
          <ReceiptUploader />
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Add Transaction
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-200/60 bg-white dark:border-ink-700 dark:bg-ink-900">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            className="border-none"
            title="No transactions yet"
            description="Add your first income or expense, or scan a receipt to get started."
            action={<Button onClick={() => setFormOpen(true)}>Add Transaction</Button>}
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-ink-200/60 text-left text-xs uppercase tracking-wide text-ink-400 dark:border-ink-700">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Merchant</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.data.map((tx) => (
                <tr key={tx.id} className="border-b border-ink-200/40 last:border-0 dark:border-ink-800">
                  <td className="px-4 py-3 text-ink-400">{new Date(tx.occurredOn).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{tx.merchant || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs dark:bg-ink-800">{tx.category.name}</span>
                  </td>
                  <td
                    className={cn(
                      'px-4 py-3 text-right font-medium tabular-nums',
                      tx.type === 'INCOME' ? 'text-signal-green' : 'text-signal-rose',
                    )}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}
                    {formatMoney(tx.amountMinor, tx.currency)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      aria-label={`Delete transaction with ${tx.merchant || tx.category.name}`}
                      onClick={() => deleteTransaction.mutate(tx.id)}
                      className="rounded-lg p-1.5 text-ink-400 hover:bg-signal-rose/10 hover:text-signal-rose"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-ink-400">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <TransactionFormSheet open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
