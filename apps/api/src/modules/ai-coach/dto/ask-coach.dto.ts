import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class AskCoachDto {
  @ApiProperty({ example: 'Why did I spend more this month compared to last month?' })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  question: string;
}
