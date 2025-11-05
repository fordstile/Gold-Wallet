import { IsNumber, Min } from 'class-validator';

export class TopUpPoolDto {
  @IsNumber()
  @Min(0.000001, { message: 'Added grams must be greater than 0' })
  addedGrams: number;
}

