import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  /** Generates a monthly report by reusing the same aggregation service as the dashboard. */
  async getMonthlyReport(userId: string, yearMonth: string) {
    const [year, month] = yearMonth.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const [summary, categoryBreakdown, budgets, transactionCount] = await Promise.all([
      this.analytics.getSummary(userId, monthStart),
      this.analytics.getCategoryBreakdown(userId, monthStart, monthEnd),
      this.prisma.budget.findMany({ where: { userId, periodStart: monthStart }, include: { category: true } }),
      this.prisma.transaction.count({ where: { userId, deletedAt: null, occurredOn: { gte: monthStart, lte: monthEnd } } }),
    ]);

    return {
      period: yearMonth,
      summary,
      categoryBreakdown,
      budgets,
      transactionCount,
      generatedAt: new Date().toISOString(),
    };
  }
}
