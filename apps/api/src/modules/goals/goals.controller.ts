import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { ContributeGoalDto } from './dto/contribute-goal.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('goals')
@ApiBearerAuth()
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.goalsService.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(user.id, dto);
  }

  @Post(':id/contributions')
  contribute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ContributeGoalDto,
  ) {
    return this.goalsService.contribute(user.id, id, dto);
  }
}
