import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';
import { PricesService } from './prices.service';
import { CreatePriceDto } from './dto/create-price.dto';

@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  // Public endpoint - anyone can view current prices
  @Get('current')
  async getCurrent() {
    return this.pricesService.getCurrent();
  }

  // Admin only - set new prices
  @Post()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async create(@Body() createPriceDto: CreatePriceDto, @Req() req: any) {
    return this.pricesService.create({
      ...createPriceDto,
      createdBy: req.user.userId,
    });
  }

  // Admin only - view price history
  @Get('history')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getHistory(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.pricesService.getHistory(limitNum);
  }
}

