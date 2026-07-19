import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Dashboard KPIs: income/expense/net + month-over-month deltas' })
  @ApiQuery({ name: 'month', required: false, example: '2026-07-01' })
  getSummary(@CurrentUser() user: AuthenticatedUser, @Query('month') month?: string) {
    return this.analyticsService.getSummary(user.id, month ? new Date(month) : this.currentMonthStart());
  }

  @Get('monthly-trend')
  @ApiOperation({ summary: 'Income vs expense per month, for the trend chart' })
  @ApiQuery({ name: 'months', required: false, example: 6 })
  getMonthlyTrend(@CurrentUser() user: AuthenticatedUser, @Query('months') months?: string) {
    return this.analyticsService.getMonthlyTrend(user.id, months ? Number(months) : 6);
  }

  @Get('category-breakdown')
  @ApiOperation({ summary: 'Expense breakdown by category for a given month' })
  @ApiQuery({ name: 'month', required: false, example: '2026-07-01' })
  getCategoryBreakdown(@CurrentUser() user: AuthenticatedUser, @Query('month') month?: string) {
    const start = month ? new Date(month) : this.currentMonthStart();
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    return this.analyticsService.getCategoryBreakdown(user.id, start, end);
  }

  private currentMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}
