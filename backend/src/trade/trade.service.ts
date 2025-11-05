import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MpesaService } from '../mpesa/mpesa.service';
import { randomUUID } from 'crypto';

@Injectable()
export class TradeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mpesaService: MpesaService,
  ) {}

  async buyGold(userId: string, amountKes: number, phoneNumber: string) {
    // Get current buy price
    const currentPrice = await this.prisma.price.findFirst({
      orderBy: { effectiveFrom: 'desc' },
    });

    if (!currentPrice) {
      throw new BadRequestException('No current price available');
    }

    const buyPrice = Number(currentPrice.buyPricePerGram);
    const gramsToBuy = amountKes / buyPrice;
    const reference = `buy_${Date.now()}_${randomUUID().slice(0, 8)}`;

    // Find available pool
    const availablePool = await this.prisma.pool.findFirst({
      where: { availableGrams: { gte: gramsToBuy } },
      orderBy: { createdAt: 'asc' },
    });

    if (!availablePool) {
      throw new BadRequestException('Insufficient gold available in pools');
    }

    // Start transaction
    return this.prisma.$transaction(async (tx) => {
      // Reserve gold from pool
      const updatedPool = await tx.pool.update({
        where: { id: availablePool.id },
        data: { availableGrams: { decrement: gramsToBuy } },
      });

      // Create ledger entry
      const ledgerEntry = await tx.ledger.create({
        data: {
          id: randomUUID(),
          userId,
          type: 'buy',
          grams: gramsToBuy,
          pricePerGram: buyPrice,
          totalKes: amountKes,
          poolId: availablePool.id,
          reference,
          status: 'pending',
        },
      });

      // Initiate M-Pesa STK Push
      let stkPushResult;
      try {
        stkPushResult = await this.mpesaService.initiateSTKPush({
          phoneNumber,
          amount: amountKes,
          accountReference: reference,
          transactionDesc: `Buy ${gramsToBuy.toFixed(6)}g gold`,
        });

        // Update ledger with checkout request ID for callback matching
        await tx.ledger.update({
          where: { id: ledgerEntry.id },
          data: { 
            reference: `${reference}_${stkPushResult.checkoutRequestId}`,
          },
        });
      } catch (error) {
        // If STK Push fails, rollback by marking as failed and returning gold to pool
        await tx.ledger.update({
          where: { id: ledgerEntry.id },
          data: { status: 'failed' },
        });

        await tx.pool.update({
          where: { id: availablePool.id },
          data: { availableGrams: { increment: gramsToBuy } },
        });

        throw error;
      }

      return {
        tradeId: ledgerEntry.id,
        grams: gramsToBuy,
        pricePerGram: buyPrice,
        totalKes: amountKes,
        reference,
        checkoutRequestId: stkPushResult.checkoutRequestId,
        status: 'pending',
        message: stkPushResult.customerMessage || 'Check your phone for M-Pesa prompt',
      };
    });
  }

  async sellGold(userId: string, grams: number, payoutPhone: string) {
    // Get current sell price
    const currentPrice = await this.prisma.price.findFirst({
      orderBy: { effectiveFrom: 'desc' },
    });

    if (!currentPrice) {
      throw new BadRequestException('No current price available');
    }

    const sellPrice = Number(currentPrice.sellPricePerGram);
    const amountKes = grams * sellPrice;
    const reference = `sell_${Date.now()}_${randomUUID().slice(0, 8)}`;

    // Check user balance
    const userBalance = await this.prisma.userBalance.findUnique({
      where: { userId },
    });

    if (!userBalance) {
      throw new BadRequestException('User balance not found');
    }

    const availableGrams = Number(userBalance.grams) - Number(userBalance.lockedGrams);
    if (availableGrams < grams) {
      throw new BadRequestException('Insufficient gold balance');
    }

    // Start transaction
    return this.prisma.$transaction(async (tx) => {
      // Lock user's gold
      await tx.userBalance.update({
        where: { userId },
        data: { 
          lockedGrams: { increment: grams }
        },
      });

      // Create ledger entry
      const ledgerEntry = await tx.ledger.create({
        data: {
          id: randomUUID(),
          userId,
          type: 'sell',
          grams,
          pricePerGram: sellPrice,
          totalKes: amountKes,
          reference,
          status: 'pending',
        },
      });

      // Create payout record
      await tx.payout.create({
        data: {
          id: randomUUID(),
          userId,
          amountKes,
          phone: payoutPhone,
          status: 'pending',
        },
      });

      return {
        tradeId: ledgerEntry.id,
        grams,
        pricePerGram: sellPrice,
        totalKes: amountKes,
        reference,
        status: 'pending',
        message: 'Sell request submitted. Payout will be processed within 24 hours.',
      };
    });
  }

  async getTradeStatus(tradeId: string) {
    const trade = await this.prisma.ledger.findUnique({
      where: { id: tradeId },
      include: {
        pool: true,
      },
    });

    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    return trade;
  }

  private async completeBuyTransaction(ledgerId: string, userId: string, grams: number) {
    await this.prisma.$transaction(async (tx) => {
      // Mark ledger as completed
      await tx.ledger.update({
        where: { id: ledgerId },
        data: { status: 'completed' },
      });

      // Credit user balance
      await tx.userBalance.upsert({
        where: { userId },
        update: { 
          grams: { increment: grams }
        },
        create: {
          userId,
          grams,
          lockedGrams: 0,
        },
      });
    });
  }

  async completeSellTransaction(ledgerId: string, userId: string, grams: number, poolId: string) {
    await this.prisma.$transaction(async (tx) => {
      // Mark ledger as completed
      await tx.ledger.update({
        where: { id: ledgerId },
        data: { status: 'completed' },
      });

      // Update user balance (remove locked gold)
      await tx.userBalance.update({
        where: { userId },
        data: { 
          grams: { decrement: grams },
          lockedGrams: { decrement: grams }
        },
      });

      // Return gold to pool
      await tx.pool.update({
        where: { id: poolId },
        data: { availableGrams: { increment: grams } },
      });

      // Mark payout as completed
      const ledger = await tx.ledger.findUnique({ where: { id: ledgerId } });
      if (ledger) {
        await tx.payout.updateMany({
          where: { 
            userId,
            amountKes: ledger.totalKes,
            status: 'pending'
          },
          data: { status: 'completed' },
        });
      }
    });
  }
}
