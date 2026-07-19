import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly/:yearMonth')
  @ApiOperation({ summary: 'Get a generated monthly report, e.g. /reports/monthly/2026-07' })
  getMonthly(@CurrentUser() user: AuthenticatedUser, @Param('yearMonth') yearMonth: string) {
    return this.reportsService.getMonthlyReport(user.id, yearMonth);
  }
}
