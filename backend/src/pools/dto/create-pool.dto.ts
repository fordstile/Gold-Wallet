import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreatePoolDto {
  @IsString()
  @IsNotEmpty({ message: 'Pool name is required' })
  name: string;

  @IsNumber()
  @Min(0.000001, { message: 'Total grams must be greater than 0' })
  totalGrams: number;

  @IsString()
  @IsNotEmpty({ message: 'Purity is required (e.g., 24k, 22k)' })
  purity: string;
}

