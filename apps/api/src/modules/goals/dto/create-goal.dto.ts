import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({ example: 'Emergency Fund' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 15000000 })
  @IsInt()
  @IsPositive()
  targetMinor: number;

  @ApiProperty({ required: false, example: '2027-01-01' })
  @IsOptional()
  @IsDateString()
  targetDate?: string;
}
