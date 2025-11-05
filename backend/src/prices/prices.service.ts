import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class PricesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrent() {
    const latestPrice = await this.prisma.price.findFirst({
      orderBy: { effectiveFrom: 'desc' },
    });

    if (!latestPrice) {
      return null;
    }

    return {
      id: latestPrice.id,
      buyPricePerGram: Number(latestPrice.buyPricePerGram),
      sellPricePerGram: Number(latestPrice.sellPricePerGram),
      spread: Number(latestPrice.buyPricePerGram) - Number(latestPrice.sellPricePerGram),
      spreadPercent: ((Number(latestPrice.buyPricePerGram) - Number(latestPrice.sellPricePerGram)) / Number(latestPrice.buyPricePerGram)) * 100,
      effectiveFrom: latestPrice.effectiveFrom,
      createdBy: latestPrice.createdBy,
      createdAt: latestPrice.createdAt,
    };
  }

  async getHistory(limit: number = 20) {
    return this.prisma.price.findMany({
      orderBy: { effectiveFrom: 'desc' },
      take: limit,
    });
  }

  async create(data: {
    buyPricePerGram: number;
    sellPricePerGram: number;
    createdBy: string;
  }) {
    if (data.sellPricePerGram >= data.buyPricePerGram) {
      throw new Error('Sell price must be less than buy price');
    }

    return this.prisma.price.create({
      data: {
        id: randomUUID(),
        buyPricePerGram: data.buyPricePerGram,
        sellPricePerGram: data.sellPricePerGram,
        createdBy: data.createdBy,
        effectiveFrom: new Date(),
      },
    });
  }
}

