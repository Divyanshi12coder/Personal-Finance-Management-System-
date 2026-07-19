'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { transactionSchema, TransactionInput } from '@/lib/validators/transaction.schema';
import { useCategories, useCreateTransaction } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<TransactionInput>;
}

/** Create/edit form for a transaction. Also used to confirm receipt-scan drafts (via defaultValues). */
export function TransactionFormSheet({ open, onOpenChange, defaultValues }: Props) {
  const { data: categories } = useCategories();
  const createTransaction = useCreateTransaction();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: 'EXPENSE', occurredOn: new Date().toISOString().slice(0, 10), ...defaultValues },
  });

  const type = watch('type');
  const filteredCategories = categories?.filter((c) => c.type === type) ?? [];

  const onSubmit = async (values: TransactionInput) => {
    await createTransaction.mutateAsync({
      type: values.type,
      amountMinor: Math.round(values.amount * 100),
      categoryId: values.categoryId,
      occurredOn: values.occurredOn,
      merchant: values.merchant || undefined,
      note: values.note || undefined,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl dark:bg-ink-900">
          <div className="mb-6 flex items-center justify-between">
            <Dialog.Title className="font-display text-lg font-semibold">Add Transaction</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="rounded-lg p-1.5 hover:bg-ink-100 dark:hover:bg-ink-800">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-2">
              {(['EXPENSE', 'INCOME'] as const).map((t) => (
                <label
                  key={t}
                  className="flex-1 cursor-pointer rounded-lg border border-ink-200 p-2 text-center text-sm has-[:checked]:border-brass-500 has-[:checked]:bg-brass-500/10 dark:border-ink-700"
                >
                  <input type="radio" value={t} className="sr-only" {...register('type')} />
                  {t === 'EXPENSE' ? 'Expense' : 'Income'}
                </label>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" {...register('amount')} aria-invalid={!!errors.amount} />
              {errors.amount && <p className="text-xs text-signal-rose">{errors.amount.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                {...register('categoryId')}
                className="h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm dark:border-ink-600 dark:bg-ink-800"
              >
                <option value="">Select a category</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-xs text-signal-rose">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="occurredOn">Date</Label>
              <Input id="occurredOn" type="date" {...register('occurredOn')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="merchant">Merchant (optional)</Label>
              <Input id="merchant" {...register('merchant')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note">Note (optional)</Label>
              <Input id="note" {...register('note')} />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save transaction'}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
