import { Injectable } from '@nestjs/common';
import { Prisma, Transaction } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateTransactionInput,
  ITransactionRepository,
  PaginatedResult,
  TransactionFilter,
} from './interfaces/transaction-repository.interface';

export const TRANSACTION_REPOSITORY = 'TRANSACTION_REPOSITORY';

@Injectable()
export class TransactionsRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(filter: TransactionFilter, page: number, limit: number): Promise<PaginatedResult<Transaction>> {
    const where = this.buildWhere(filter);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: { occurredOn: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  findById(id: string, userId: string): Promise<Transaction | null> {
    return this.prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
      include: { category: true },
    });
  }

  create(input: CreateTransactionInput): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: {
        userId: input.userId,
        categoryId: input.categoryId,
        type: input.type,
        amountMinor: input.amountMinor,
        currency: input.currency,
        occurredOn: input.occurredOn,
        merchant: input.merchant,
        note: input.note,
        source: input.source ?? 'MANUAL',
      },
      include: { category: true },
    });
  }

  async update(id: string, userId: string, data: Partial<CreateTransactionInput>): Promise<Transaction> {
    // Ownership is verified before mutating — Prisma's unique `where`
    // clause can't be scoped by userId directly, so we check first.
    const existing = await this.prisma.transaction.findFirst({ where: { id, userId, deletedAt: null } });
    if (!existing) {
      throw new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'n/a',
      });
    }

    return this.prisma.transaction.update({
      where: { id },
      data: {
        categoryId: data.categoryId,
        type: data.type,
        amountMinor: data.amountMinor,
        occurredOn: data.occurredOn,
        merchant: data.merchant,
        note: data.note,
      },
      include: { category: true },
    });
  }

  async softDelete(id: string, userId: string): Promise<void> {
    await this.prisma.transaction.updateMany({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  }

  private buildWhere(filter: TransactionFilter): Prisma.TransactionWhereInput {
    const where: Prisma.TransactionWhereInput = {
      userId: filter.userId,
      deletedAt: null,
    };
    if (filter.type) where.type = filter.type;
    if (filter.categoryId) where.categoryId = filter.categoryId;
    if (filter.dateFrom || filter.dateTo) {
      where.occurredOn = {
        ...(filter.dateFrom ? { gte: filter.dateFrom } : {}),
        ...(filter.dateTo ? { lte: filter.dateTo } : {}),
      };
    }
    if (filter.search) {
      where.OR = [
        { merchant: { contains: filter.search, mode: 'insensitive' } },
        { note: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    return where;
  }
}
