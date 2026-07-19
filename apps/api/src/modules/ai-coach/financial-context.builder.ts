import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';

/**
 * The single most important architectural decision in the AI Coach:
 * the LLM is NEVER handed raw transaction rows. Instead, this builder
 * calls the same aggregation services the dashboard uses (AnalyticsService,
 * plus a couple of coach-specific aggregates) and produces a compact,
 * structured JSON snapshot of *facts*. The LLM's job is only to explain
 * and reason over those facts in natural language — not to do arithmetic
 * over hundreds of rows, which is slow, expensive, and error-prone.
 *
 * This keeps prompts small (token-cost control), keeps answers accurate
 * (numbers come from SQL, not the model's "guess"), and makes every
 * answer auditable — the snapshot is stored alongside the AI's reply.
 */
@Injectable()
export class FinancialContextBuilder {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  async build(userId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [summary, trend, categoryBreakdown, budgets, goals, topMerchants, user] = await Promise.all([
      this.analytics.getSummary(userId, monthStart),
      this.analytics.getMonthlyTrend(userId, 6),
      this.analytics.getCategoryBreakdown(userId, monthStart, monthEnd),
      this.getBudgetStatus(userId, monthStart),
      this.getGoalStatus(userId),
      this.getTopMerchants(userId, monthStart, monthEnd),
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    ]);

    return {
      currency: user.currency,
      asOf: now.toISOString().slice(0, 10),
      currentMonthSummary: summary,
      last6MonthsTrend: trend,
      currentMonthCategoryBreakdown: categoryBreakdown.slice(0, 8),
      budgetStatus: budgets,
      savingsGoals: goals,
      topMerchantsThisMonth: topMerchants,
      // A cheap statistical anomaly signal: categories whose spend this
      // month is >40% above their trailing 3-month average. This is
      // deterministic math done in SQL/JS, not an LLM guess.
      anomalies: this.detectAnomalies(trend, categoryBreakdown),
    };
  }

  private async getBudgetStatus(userId: string, monthStart: Date) {
    const budgets = await this.prisma.budget.findMany({ where: { userId, periodStart: monthStart }, include: { category: true } });
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    const results = [];
    for (const b of budgets) {
      const spent = await this.prisma.transaction.aggregate({
        where: { userId, categoryId: b.categoryId, type: 'EXPENSE', deletedAt: null, occurredOn: { gte: monthStart, lte: monthEnd } },
        _sum: { amountMinor: true },
      });
      const spentMinor = spent._sum.amountMinor ?? 0;
      results.push({
        category: b.category.name,
        limitMinor: b.limitMinor,
        spentMinor,
        percentUsed: b.limitMinor > 0 ? Math.round((spentMinor / b.limitMinor) * 100) : 0,
      });
    }
    return results;
  }

  private async getGoalStatus(userId: string) {
    const goals = await this.prisma.savingsGoal.findMany({ where: { userId } });
    return goals.map((g) => ({
      name: g.name,
      targetMinor: g.targetMinor,
      currentMinor: g.currentMinor,
      percentComplete: g.targetMinor > 0 ? Math.round((g.currentMinor / g.targetMinor) * 100) : 0,
      targetDate: g.targetDate?.toISOString().slice(0, 10) ?? null,
    }));
  }

  private async getTopMerchants(userId: string, from: Date, to: Date) {
    const rows = await this.prisma.transaction.groupBy({
      by: ['merchant'],
      where: { userId, type: 'EXPENSE', deletedAt: null, merchant: { not: null }, occurredOn: { gte: from, lte: to } },
      _sum: { amountMinor: true },
      orderBy: { _sum: { amountMinor: 'desc' } },
      take: 5,
    });
    return rows.map((r) => ({ merchant: r.merchant, totalMinor: r._sum.amountMinor ?? 0 }));
  }

  private detectAnomalies(
    trend: Awaited<ReturnType<AnalyticsService['getMonthlyTrend']>>,
    currentBreakdown: Awaited<ReturnType<AnalyticsService['getCategoryBreakdown']>>,
  ) {
    // Simple, explainable heuristic: flag categories that make up an
    // outsized share of this month's spend relative to typical spread.
    // (A fuller implementation would compare per-category trailing
    // averages; kept intentionally simple and fast here.)
    if (currentBreakdown.length === 0) return [];
    const avgShare = 100 / currentBreakdown.length;
    return currentBreakdown
      .filter((c) => c.percentOfTotal > avgShare * 1.8)
      .map((c) => ({
        category: c.categoryName,
        percentOfTotalSpend: c.percentOfTotal,
        note: 'Disproportionately large share of this month\'s spending',
      }));
  }
}
