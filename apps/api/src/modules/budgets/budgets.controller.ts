import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { UpsertBudgetDto } from './dto/upsert-budget.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'List budgets for a month, with computed spend/remaining' })
  @ApiQuery({ name: 'periodStart', example: '2026-07-01' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query('periodStart') periodStart?: string) {
    const period = periodStart ? new Date(periodStart) : this.currentMonthStart();
    return this.budgetsService.findAllForPeriod(user.id, period);
  }

  @Post()
  @ApiOperation({ summary: 'Create or update a category budget for a month' })
  upsert(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertBudgetDto) {
    return this.budgetsService.upsert(user.id, dto);
  }

  private currentMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}
