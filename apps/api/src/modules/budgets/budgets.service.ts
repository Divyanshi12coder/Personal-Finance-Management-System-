import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertBudgetDto } from './dto/upsert-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForPeriod(userId: string, periodStart: Date) {
    const monthEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);

    const budgets = await this.prisma.budget.findMany({
      where: { userId, periodStart },
      include: { category: true },
    });

    // Compute actual spend per budgeted category in the same period so the
    // frontend gets ready-to-render progress data without a second round trip.
    const spendByCategory = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        deletedAt: null,
        occurredOn: { gte: periodStart, lte: monthEnd },
      },
      _sum: { amountMinor: true },
    });
    const spendMap = new Map(spendByCategory.map((s) => [s.categoryId, s._sum.amountMinor ?? 0]));

    return budgets.map((b) => {
      const spentMinor = spendMap.get(b.categoryId) ?? 0;
      return {
        ...b,
        spentMinor,
        remainingMinor: b.limitMinor - spentMinor,
        percentUsed: b.limitMinor > 0 ? Math.round((spentMinor / b.limitMinor) * 100) : 0,
        isOverBudget: spentMinor > b.limitMinor,
      };
    });
  }

  upsert(userId: string, dto: UpsertBudgetDto) {
    const periodStart = new Date(dto.periodStart);
    return this.prisma.budget.upsert({
      where: { userId_categoryId_periodStart: { userId, categoryId: dto.categoryId, periodStart } },
      update: { limitMinor: dto.limitMinor },
      create: { userId, categoryId: dto.categoryId, limitMinor: dto.limitMinor, periodStart },
      include: { category: true },
    });
  }
}
