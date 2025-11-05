import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserController } from './user/user.controller';
import { PrismaService } from './prisma/prisma.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PoolsModule } from './pools/pools.module';
import { PricesModule } from './prices/prices.module';
import { TradeModule } from './trade/trade.module';
import { AdminModule } from './admin/admin.module';
import { MpesaModule } from './mpesa/mpesa.module';

@Module({
  imports: [
    AuthModule,
    PoolsModule,
    PricesModule,
    TradeModule,
    AdminModule,
    MpesaModule,
    // Rate limiting: 10 requests per 60 seconds per IP
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
  controllers: [AppController, UserController],
  providers: [
    AppService, 
    PrismaService,
    // Apply throttler globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
