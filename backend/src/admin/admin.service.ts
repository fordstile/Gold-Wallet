import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingPayouts() {
    const payouts = await this.prisma.payout.findMany({
      where: { status: 'pending' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return payouts.map(payout => ({
      ...payout,
      amountKes: Number(payout.amountKes),
    }));
  }

  async getAllPayouts() {
    const payouts = await this.prisma.payout.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return payouts.map(payout => ({
      ...payout,
      amountKes: Number(payout.amountKes),
    }));
  }

  async approvePayout(payoutId: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id: payoutId },
      include: {
        user: true,
      },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    if (payout.status !== 'pending') {
      throw new BadRequestException('Payout is not pending');
    }

    // Find the corresponding ledger entry
    const ledger = await this.prisma.ledger.findFirst({
      where: {
        userId: payout.userId,
        type: 'sell',
        status: 'pending',
        totalKes: payout.amountKes,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!ledger) {
      throw new NotFoundException('Ledger entry not found');
    }

    const grams = Number(ledger.grams);
    const poolId = ledger.poolId;

    // Complete the sell transaction
    await this.prisma.$transaction(async (tx) => {
      // Mark payout as completed
      await tx.payout.update({
        where: { id: payoutId },
        data: { 
          status: 'completed',
          mpesaTransactionId: `MANUAL_${Date.now()}`, // Manual approval
          notes: 'Approved by admin',
        },
      });

      // Mark ledger as completed
      await tx.ledger.update({
        where: { id: ledger.id },
        data: { status: 'completed' },
      });

      // Update user balance (remove locked and total gold)
      await tx.userBalance.update({
        where: { userId: payout.userId },
        data: {
          grams: { decrement: grams },
          lockedGrams: { decrement: grams },
        },
      });

      // Return gold to pool if poolId exists
      if (poolId) {
        await tx.pool.update({
          where: { id: poolId },
          data: { availableGrams: { increment: grams } },
        });
      }
    });

    return {
      success: true,
      message: 'Payout approved and processed successfully',
      payout: {
        id: payout.id,
        amountKes: Number(payout.amountKes),
        phone: payout.phone,
        user: payout.user.email,
      },
    };
  }

  async rejectPayout(payoutId: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id: payoutId },
      include: {
        user: true,
      },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    if (payout.status !== 'pending') {
      throw new BadRequestException('Payout is not pending');
    }

    // Find the corresponding ledger entry
    const ledger = await this.prisma.ledger.findFirst({
      where: {
        userId: payout.userId,
        type: 'sell',
        status: 'pending',
        totalKes: payout.amountKes,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!ledger) {
      throw new NotFoundException('Ledger entry not found');
    }

    const grams = Number(ledger.grams);

    // Reject and unlock user's gold
    await this.prisma.$transaction(async (tx) => {
      // Mark payout as failed
      await tx.payout.update({
        where: { id: payoutId },
        data: { 
          status: 'failed',
          notes: 'Rejected by admin',
        },
      });

      // Mark ledger as failed
      await tx.ledger.update({
        where: { id: ledger.id },
        data: { status: 'failed' },
      });

      // Unlock user's gold (return to available balance)
      await tx.userBalance.update({
        where: { userId: payout.userId },
        data: {
          lockedGrams: { decrement: grams },
        },
      });
    });

    return {
      success: true,
      message: 'Payout rejected and gold unlocked',
      payout: {
        id: payout.id,
        amountKes: Number(payout.amountKes),
        phone: payout.phone,
        user: payout.user.email,
      },
    };
  }

  async getAllTransactions() {
    const transactions = await this.prisma.ledger.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        pool: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return transactions.map(tx => ({
      ...tx,
      grams: Number(tx.grams),
      pricePerGram: Number(tx.pricePerGram),
      totalKes: Number(tx.totalKes),
    }));
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        isAdmin: true,
        kycStatus: true,
        createdAt: true,
        balance: {
          select: {
            grams: true,
            lockedGrams: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => ({
      ...user,
      balance: user.balance ? {
        grams: Number(user.balance.grams),
        lockedGrams: Number(user.balance.lockedGrams),
      } : null,
    }));
  }
}

