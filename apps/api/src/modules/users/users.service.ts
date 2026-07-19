import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const { passwordHash: _passwordHash, ...user } = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const { passwordHash: _passwordHash, ...user } = await this.prisma.user.update({ where: { id }, data: dto });
    return user;
  }
}
