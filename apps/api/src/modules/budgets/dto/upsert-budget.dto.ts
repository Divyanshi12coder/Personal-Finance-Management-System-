import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsPositive, IsUUID } from 'class-validator';

export class UpsertBudgetDto {
  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 1000000, description: 'Monthly limit in minor units' })
  @IsInt()
  @IsPositive()
  limitMinor: number;

  @ApiProperty({ example: '2026-07-01', description: 'First day of the budgeted month' })
  @IsDateString()
  periodStart: string;
}
