import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AiCoachService } from './ai-coach.service';
import { AskCoachDto } from './dto/ask-coach.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('ai-coach')
@ApiBearerAuth()
@Controller('ai-coach')
export class AiCoachController {
  constructor(private readonly aiCoachService: AiCoachService) {}

  @Get('conversations')
  listConversations(@CurrentUser() user: AuthenticatedUser) {
    return this.aiCoachService.listConversations(user.id);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Start a new AI Coach conversation' })
  startConversation(@CurrentUser() user: AuthenticatedUser) {
    return this.aiCoachService.startConversation(user.id);
  }

  @Get('conversations/:id')
  getConversation(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.aiCoachService.getConversation(user.id, id);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Ask the AI Coach a question, grounded in the user\'s real transaction data' })
  // Stricter rate limit than the app default — LLM calls cost real money.
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  ask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AskCoachDto,
  ) {
    return this.aiCoachService.ask(user.id, id, dto.question);
  }
}
