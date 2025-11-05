import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class PoolsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pool.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.pool.findUnique({
      where: { id },
      include: {
        ledgers: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(data: {
    name: string;
    totalGrams: number;
    purity: string;
  }) {
    return this.prisma.pool.create({
      data: {
        id: randomUUID(),
        name: data.name,
        totalGrams: data.totalGrams,
        availableGrams: data.totalGrams, // Initially all available
        purity: data.purity,
        updatedAt: new Date(),
      },
    });
  }

  async topUp(id: string, addedGrams: number) {
    const pool = await this.prisma.pool.findUnique({ where: { id } });
    if (!pool) throw new Error('Pool not found');

    return this.prisma.pool.update({
      where: { id },
      data: {
        totalGrams: { increment: addedGrams },
        availableGrams: { increment: addedGrams },
        updatedAt: new Date(),
      },
    });
  }

  async getStats() {
    const pools = await this.prisma.pool.findMany();
    
    const totalGold = pools.reduce((sum, pool) => sum + Number(pool.totalGrams), 0);
    const availableGold = pools.reduce((sum, pool) => sum + Number(pool.availableGrams), 0);
    const allocatedGold = totalGold - availableGold;

    return {
      totalPools: pools.length,
      totalGold,
      availableGold,
      allocatedGold,
      utilizationRate: totalGold > 0 ? (allocatedGold / totalGold) * 100 : 0,
    };
  }
}

