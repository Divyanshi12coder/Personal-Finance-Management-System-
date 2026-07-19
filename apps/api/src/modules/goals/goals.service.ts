import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { ContributeGoalDto } from './dto/contribute-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const goals = await this.prisma.savingsGoal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return goals.map((g) => ({
      ...g,
      percentComplete: g.targetMinor > 0 ? Math.min(100, Math.round((g.currentMinor / g.targetMinor) * 100)) : 0,
    }));
  }

  create(userId: string, dto: CreateGoalDto) {
    return this.prisma.savingsGoal.create({
      data: {
        userId,
        name: dto.name,
        targetMinor: dto.targetMinor,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      },
    });
  }

  async contribute(userId: string, goalId: string, dto: ContributeGoalDto) {
    const goal = await this.prisma.savingsGoal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException({ code: 'GOAL_NOT_FOUND', message: 'Savings goal not found.' });
    if (goal.userId !== userId) throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Not your goal.' });

    return this.prisma.$transaction(async (tx) => {
      await tx.goalContribution.create({
        data: { goalId, amountMinor: dto.amountMinor, contributedOn: new Date(dto.contributedOn) },
      });
      return tx.savingsGoal.update({
        where: { id: goalId },
        data: { currentMinor: { increment: dto.amountMinor } },
      });
    });
  }
}
