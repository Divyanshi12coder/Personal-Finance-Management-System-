import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns system defaults + this user's custom categories, merged. */
  findAllForUser(userId: string) {
    return this.prisma.category.findMany({
      where: { OR: [{ userId }, { userId: null }] },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { ...dto, userId, isSystem: false },
    });
  }
}
