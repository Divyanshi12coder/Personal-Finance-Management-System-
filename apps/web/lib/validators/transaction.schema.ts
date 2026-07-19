import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce.number().positive('Amount must be greater than zero.'),
  categoryId: z.string().uuid('Select a category.'),
  occurredOn: z.string().min(1, 'Date is required.'),
  merchant: z.string().max(120).optional().or(z.literal('')),
  note: z.string().max(500).optional().or(z.literal('')),
});
export type TransactionInput = z.infer<typeof transactionSchema>;
