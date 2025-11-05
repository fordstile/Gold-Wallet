import { IsNumber, IsString, Min } from 'class-validator';

export class BuyGoldDto {
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(1, { message: 'Amount must be at least 1 KES' })
  amountKes: number;

  @IsString({ message: 'Phone number is required' })
  phoneNumber: string;
}
