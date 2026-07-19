import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TRANSACTION_REPOSITORY } from './transactions.repository';
import { ITransactionRepository } from './interfaces/transaction-repository.interface';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly repo: ITransactionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(userId: string, query: QueryTransactionsDto) {
    const result = await this.repo.findMany(
      {
        userId,
        type: query.type,
        categoryId: query.categoryId,
        dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
        search: query.search,
      },
      query.page,
      query.limit,
    );

    return {
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const tx = await this.repo.findById(id, userId);
    if (!tx) throw new NotFoundException({ code: 'TRANSACTION_NOT_FOUND', message: 'Transaction not found.' });
    return tx;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    await this.assertCategoryUsable(userId, dto.categoryId, dto.type);

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    return this.repo.create({
      userId,
      categoryId: dto.categoryId,
      type: dto.type,
      amountMinor: dto.amountMinor,
      currency: user.currency,
      occurredOn: new Date(dto.occurredOn),
      merchant: dto.merchant,
      note: dto.note,
      source: 'MANUAL',
    });
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    if (dto.categoryId && dto.type) {
      await this.assertCategoryUsable(userId, dto.categoryId, dto.type);
    }
    return this.repo.update(id, userId, {
      categoryId: dto.categoryId,
      type: dto.type,
      amountMinor: dto.amountMinor,
      occurredOn: dto.occurredOn ? new Date(dto.occurredOn) : undefined,
      merchant: dto.merchant,
      note: dto.note,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // ensures existence + ownership, throws 404 otherwise
    await this.repo.softDelete(id, userId);
    return { message: 'Transaction deleted.' };
  }

  /** A category must belong to the user (or be a system category) and match the transaction type. */
  private async assertCategoryUsable(userId: string, categoryId: string, type: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, OR: [{ userId }, { userId: null }] },
    });
    if (!category) throw new NotFoundException({ code: 'CATEGORY_NOT_FOUND', message: 'Category not found.' });
    if (category.type !== type) {
      throw new ForbiddenException({
        code: 'CATEGORY_TYPE_MISMATCH',
        message: `Category "${category.name}" cannot be used for ${type} transactions.`,
      });
    }
  }
}
