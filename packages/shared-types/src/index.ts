/**
 * Shared TypeScript types between the API and web app. Kept as a plain
 * source-referenced workspace package (no build step) for simplicity —
 * the frontend and backend both consume these .ts files directly. As the
 * project grows, this is the natural place to generate types from the
 * OpenAPI spec instead of hand-maintaining them.
 */

export type TransactionType = 'INCOME' | 'EXPENSE';
export type BudgetPeriod = 'MONTHLY';
export type ReceiptStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';
export type MessageRole = 'USER' | 'ASSISTANT';

export interface CategoryDto {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  isSystem: boolean;
}

export interface TransactionDto {
  id: string;
  type: TransactionType;
  amountMinor: number;
  currency: string;
  merchant?: string | null;
  note?: string | null;
  occurredOn: string;
  category: CategoryDto;
}

export interface BudgetWithProgressDto {
  id: string;
  categoryId: string;
  limitMinor: number;
  spentMinor: number;
  remainingMinor: number;
  percentUsed: number;
  isOverBudget: boolean;
}

export interface SavingsGoalDto {
  id: string;
  name: string;
  targetMinor: number;
  currentMinor: number;
  percentComplete: number;
  targetDate: string | null;
}

export interface AnalyticsSummaryDto {
  income: number;
  expense: number;
  net: number;
  incomeDeltaPercent: number;
  expenseDeltaPercent: number;
  netDeltaPercent: number;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorEnvelope {
  success: false;
  error: { code: string; message: string; details?: unknown };
  timestamp: string;
  path: string;
}
