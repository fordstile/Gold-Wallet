import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@Controller('user')
export class UserController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('balance')
  async balance(@Req() req: any) {
    const userId = req.user.userId;
    const bal = await this.prisma.userBalance.findUnique({ where: { userId } });
    return {
      grams: bal?.grams ?? 0,
      lockedGrams: bal?.lockedGrams ?? 0,
      availableGrams: Number(bal?.grams ?? 0) - Number(bal?.lockedGrams ?? 0),
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('ledger')
  async ledger(@Req() req: any, @Query('limit') limit = '50') {
    const userId = req.user.userId;
    const take = Math.min(parseInt(limit as string, 10) || 50, 100);
    const entries = await this.prisma.ledger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        type: true,
        grams: true,
        pricePerGram: true,
        totalKes: true,
        status: true,
        poolId: true,
        reference: true,
        createdAt: true,
      },
    });
    return entries;
  }
}


