import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TradeService } from './trade.service';
import { BuyGoldDto } from './dto/buy-gold.dto';
import { SellGoldDto } from './dto/sell-gold.dto';

@Controller('trade')
@UseGuards(AuthGuard('jwt'))
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Post('buy')
  async buyGold(@Body() buyGoldDto: BuyGoldDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.tradeService.buyGold(userId, buyGoldDto.amountKes, buyGoldDto.phoneNumber);
  }

  @Post('sell')
  async sellGold(@Body() sellGoldDto: SellGoldDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.tradeService.sellGold(userId, sellGoldDto.grams, sellGoldDto.payoutPhone);
  }

  @Get(':id')
  async getTradeStatus(@Param('id') id: string) {
    return this.tradeService.getTradeStatus(id);
  }
}
