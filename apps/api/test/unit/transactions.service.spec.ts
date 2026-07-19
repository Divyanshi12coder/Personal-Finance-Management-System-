import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TransactionsService } from '../../src/modules/transactions/transactions.service';
import { TRANSACTION_REPOSITORY } from '../../src/modules/transactions/transactions.repository';
import { PrismaService } from '../../src/database/prisma.service';
import { ITransactionRepository } from '../../src/modules/transactions/interfaces/transaction-repository.interface';

/**
 * This is the payoff of the repository-pattern abstraction: the service's
 * business logic (category-type validation, ownership checks, pagination
 * shaping) is tested with a fully in-memory mock repository — no database,
 * no Prisma, no Docker. Fast, deterministic, isolated unit tests.
 */
describe('TransactionsService', () => {
  let service: TransactionsService;
  let mockRepo: jest.Mocked<ITransactionRepository>;
  let mockPrisma: { category: { findFirst: jest.Mock }; user: { findUniqueOrThrow: jest.Mock } };

  const userId = 'user-1';

  beforeEach(async () => {
    mockRepo = {
      findMany: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    mockPrisma = {
      category: { findFirst: jest.fn() },
      user: { findUniqueOrThrow: jest.fn().mockResolvedValue({ id: userId, currency: 'INR' }) },
    };

    const module = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: TRANSACTION_REPOSITORY, useValue: mockRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(TransactionsService);
  });

  describe('create', () => {
    it('creates an EXPENSE transaction when the category type matches', async () => {
      mockPrisma.category.findFirst.mockResolvedValue({ id: 'cat-1', type: 'EXPENSE', name: 'Dining' });
      mockRepo.create.mockResolvedValue({ id: 'tx-1' } as never);

      const result = await service.create(userId, {
        type: 'EXPENSE',
        amountMinor: 50000,
        categoryId: 'cat-1',
        occurredOn: '2026-07-15',
      } as never);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId, categoryId: 'cat-1', amountMinor: 50000, currency: 'INR' }),
      );
      expect(result).toEqual({ id: 'tx-1' });
    });

    it('rejects when the category type does not match the transaction type', async () => {
      mockPrisma.category.findFirst.mockResolvedValue({ id: 'cat-1', type: 'INCOME', name: 'Salary' });

      await expect(
        service.create(userId, {
          type: 'EXPENSE',
          amountMinor: 50000,
          categoryId: 'cat-1',
          occurredOn: '2026-07-15',
        } as never),
      ).rejects.toThrow(ForbiddenException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the category does not exist or is not owned by the user', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.create(userId, {
          type: 'EXPENSE',
          amountMinor: 50000,
          categoryId: 'missing-cat',
          occurredOn: '2026-07-15',
        } as never),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when the transaction does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.findOne(userId, 'missing-id')).rejects.toThrow(NotFoundException);
    });

    it('returns the transaction when found', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'tx-1', userId } as never);
      const result = await service.findOne(userId, 'tx-1');
      expect(result).toEqual({ id: 'tx-1', userId });
    });
  });

  describe('findAll', () => {
    it('shapes the repository result into a paginated response with meta', async () => {
      mockRepo.findMany.mockResolvedValue({ items: [{ id: 'tx-1' }] as never, total: 45, page: 2, limit: 20 });

      const result = await service.findAll(userId, { page: 2, limit: 20 } as never);

      expect(result.meta).toEqual({ total: 45, page: 2, limit: 20, totalPages: 3 });
      expect(result.data).toHaveLength(1);
    });
  });
});
