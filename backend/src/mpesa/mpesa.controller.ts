import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { MpesaService } from './mpesa.service';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@Controller('mpesa')
export class MpesaController {
  constructor(
    private readonly mpesaService: MpesaService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * M-Pesa callback endpoint (called by Safaricom)
   * This endpoint receives payment confirmations
   */
  @Post('callback')
  async handleCallback(@Body() callbackData: any) {
    console.log('📞 M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

    try {
      const validation = this.mpesaService.validateCallback(callbackData);

      if (validation.isValid) {
        console.log('✅ Payment successful:', validation);

        // Extract merchant request ID or checkout request ID to find the transaction
        const checkoutRequestId = callbackData.Body?.stkCallback?.CheckoutRequestID;
        const merchantRequestId = callbackData.Body?.stkCallback?.MerchantRequestID;

        // Find the pending ledger entry by reference
        // We stored the checkoutRequestId or merchantRequestId in the reference field
        const ledger = await this.prisma.ledger.findFirst({
          where: {
            OR: [
              { reference: { contains: checkoutRequestId } },
              { reference: { contains: merchantRequestId } },
            ],
            status: 'pending',
          },
          orderBy: { createdAt: 'desc' },
        });

        if (ledger) {
          console.log('📝 Found ledger entry:', ledger.id);

          const userId = ledger.userId;
          const grams = Number(ledger.grams);

          // Complete the buy transaction
          await this.prisma.$transaction(async (tx) => {
            // Mark ledger as completed with M-Pesa receipt number
            await tx.ledger.update({
              where: { id: ledger.id },
              data: { 
                status: 'completed',
                reference: `${ledger.reference}_${validation.mpesaReceiptNumber}`,
              },
            });

            // Credit user balance
            await tx.userBalance.upsert({
              where: { userId },
              update: {
                grams: { increment: grams },
              },
              create: {
                userId,
                grams,
                lockedGrams: 0,
              },
            });
          });

          console.log('✅ Transaction completed for user:', userId);
        } else {
          console.warn('⚠️ No matching ledger entry found');
        }
      } else {
        console.log('❌ Payment failed or cancelled:', validation);

        // Find and mark the transaction as failed
        const checkoutRequestId = callbackData.Body?.stkCallback?.CheckoutRequestID;
        const merchantRequestId = callbackData.Body?.stkCallback?.MerchantRequestID;

        const ledger = await this.prisma.ledger.findFirst({
          where: {
            OR: [
              { reference: { contains: checkoutRequestId } },
              { reference: { contains: merchantRequestId } },
            ],
            status: 'pending',
          },
          orderBy: { createdAt: 'desc' },
        });

        if (ledger) {
          // Mark as failed and return gold to pool
          await this.prisma.$transaction(async (tx) => {
            await tx.ledger.update({
              where: { id: ledger.id },
              data: { status: 'failed' },
            });

            // Return gold to pool
            if (ledger.poolId) {
              await tx.pool.update({
                where: { id: ledger.poolId },
                data: { availableGrams: { increment: Number(ledger.grams) } },
              });
            }
          });
        }
      }

      // Always return success to M-Pesa (so they don't retry)
      return { ResultCode: 0, ResultDesc: 'Accepted' };
    } catch (error) {
      console.error('❌ Error processing M-Pesa callback:', error);
      // Still return success to prevent retries
      return { ResultCode: 0, ResultDesc: 'Accepted' };
    }
  }

  /**
   * Test STK Push (for development)
   */
  @Post('test-stk')
  @UseGuards(AuthGuard('jwt'))
  async testSTKPush(@Body() data: { phoneNumber: string; amount: number }) {
    return this.mpesaService.initiateSTKPush({
      phoneNumber: data.phoneNumber,
      amount: data.amount,
      accountReference: 'TEST_' + Date.now(),
      transactionDesc: 'Test Payment',
    });
  }

  /**
   * Query transaction status
   */
  @Get('status/:checkoutRequestId')
  @UseGuards(AuthGuard('jwt'))
  async queryStatus(@Param('checkoutRequestId') checkoutRequestId: string) {
    return this.mpesaService.querySTKPushStatus(checkoutRequestId);
  }
}


