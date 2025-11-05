import { IsNumber, Min } from 'class-validator';

export class CreatePriceDto {
  @IsNumber()
  @Min(0.01, { message: 'Buy price must be greater than 0' })
  buyPricePerGram: number;

  @IsNumber()
  @Min(0.01, { message: 'Sell price must be greater than 0' })
  sellPricePerGram: number;
}

