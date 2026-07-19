import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'S3curePass!23', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  password: string;
}
