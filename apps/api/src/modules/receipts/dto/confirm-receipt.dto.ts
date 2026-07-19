import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

/** Lets the user edit any extracted field before it becomes a real transaction. */
export class ConfirmReceiptDto {
  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  amountMinor: number;

  @ApiProperty({ example: '2026-07-15' })
  @IsDateString()
  occurredOn: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  merchant?: string;
}
