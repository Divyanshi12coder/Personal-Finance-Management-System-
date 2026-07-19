import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsPositive } from 'class-validator';

export class ContributeGoalDto {
  @ApiProperty({ example: 500000 })
  @IsInt()
  @IsPositive()
  amountMinor: number;

  @ApiProperty({ example: '2026-07-15' })
  @IsDateString()
  contributedOn: string;
}
