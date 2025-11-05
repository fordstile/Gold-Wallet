import { Module } from '@nestjs/common';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { PrismaService } from '../prisma/prisma.service';
import { MpesaModule } from '../mpesa/mpesa.module';

@Module({
  imports: [MpesaModule],
  controllers: [TradeController],
  providers: [TradeService, PrismaService],
})
export class TradeModule {}
