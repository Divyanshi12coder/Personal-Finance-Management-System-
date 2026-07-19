import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface MonthlyPoint {
  month: string; // "2026-07"
  incomeMinor: number;
  expenseMinor: number;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  totalMinor: number;
  percentOfTotal: number;
}

/**
 * All aggregation logic lives here so it has exactly one implementation,
 * reused by three consumers: the dashboard REST endpoints, the monthly
 * report generator, and the AI Coach's FinancialContextBuilder. This is
 * deliberate — the AI never re-derives numbers independently; it always
 * calls into the same trusted aggregation code the UI charts use.
 */
@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string, monthStart: Date) {
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    const prevMonthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1);
    const prevMonthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth(), 0);

    const [current, previous] = await Promise.all([
      this.sumByType(userId, monthStart, monthEnd),
      this.sumByType(userId, prevMonthStart, prevMonthEnd),
    ]);

    const netCurrent = current.income - current.expense;
    const netPrevious = previous.income - previous.expense;

    return {
      income: current.income,
      expense: current.expense,
      net: netCurrent,
      incomeDeltaPercent: this.percentDelta(previous.income, current.income),
      expenseDeltaPercent: this.percentDelta(previous.expense, current.expense),
      netDeltaPercent: this.percentDelta(netPrevious, netCurrent),
    };
  }

  async getMonthlyTrend(userId: string, months = 6): Promise<MonthlyPoint[]> {
    const now = new Date();
    const points: MonthlyPoint[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const { income, expense } = await this.sumByType(userId, start, end);
      points.push({
        month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
        incomeMinor: income,
        expenseMinor: expense,
      });
    }
    return points;
  }

  async getCategoryBreakdown(userId: string, monthStart: Date, monthEnd: Date): Promise<CategoryBreakdownItem[]> {
    const rows = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'EXPENSE', deletedAt: null, occurredOn: { gte: monthStart, lte: monthEnd } },
      _sum: { amountMinor: true },
    });

    const total = rows.reduce((sum, r) => sum + (r._sum.amountMinor ?? 0), 0);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: rows.map((r) => r.categoryId) } },
    });
    const nameMap = new Map(categories.map((c) => [c.id, c.name]));

    return rows
      .map((r) => ({
        categoryId: r.categoryId,
        categoryName: nameMap.get(r.categoryId) ?? 'Unknown',
        totalMinor: r._sum.amountMinor ?? 0,
        percentOfTotal: total > 0 ? Math.round(((r._sum.amountMinor ?? 0) / total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.totalMinor - a.totalMinor);
  }

  private async sumByType(userId: string, from: Date, to: Date) {
    const rows = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { userId, deletedAt: null, occurredOn: { gte: from, lte: to } },
      _sum: { amountMinor: true },
    });
    const income = rows.find((r) => r.type === 'INCOME')?._sum.amountMinor ?? 0;
    const expense = rows.find((r) => r.type === 'EXPENSE')?._sum.amountMinor ?? 0;
    return { income, expense };
  }

  private percentDelta(previous: number, current: number): number {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
  }
}
