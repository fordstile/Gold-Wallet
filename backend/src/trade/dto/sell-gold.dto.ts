import { IsNumber, IsString, Min } from 'class-validator';

export class SellGoldDto {
  @IsNumber({}, { message: 'Grams must be a number' })
  @Min(0.000001, { message: 'Grams must be at least 0.000001' })
  grams: number;

  @IsString({ message: 'Payout phone is required' })
  payoutPhone: string;
}
