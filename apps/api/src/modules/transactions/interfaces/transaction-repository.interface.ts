import { Transaction, TransactionType } from '@prisma/client';

export interface TransactionFilter {
  userId: string;
  type?: TransactionType;
  categoryId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTransactionInput {
  userId: string;
  categoryId: string;
  type: TransactionType;
  amountMinor: number;
  currency: string;
  occurredOn: Date;
  merchant?: string;
  note?: string;
  source?: 'MANUAL' | 'RECEIPT_SCAN';
}

/**
 * Abstraction boundary between the service layer and Prisma. Services
 * depend on this interface, not on PrismaClient directly, so business
 * logic can be unit-tested with a mock repository — no database needed.
 */
export interface ITransactionRepository {
  findMany(filter: TransactionFilter, page: number, limit: number): Promise<PaginatedResult<Transaction>>;
  findById(id: string, userId: string): Promise<Transaction | null>;
  create(input: CreateTransactionInput): Promise<Transaction>;
  update(id: string, userId: string, data: Partial<CreateTransactionInput>): Promise<Transaction>;
  softDelete(id: string, userId: string): Promise<void>;
}
