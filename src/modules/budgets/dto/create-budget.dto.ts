import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// Define os dados que podem ser recebidos ao criar um orçamento.
export class CreateBudgetDto {

  // Define o mês do orçamento no formato YYYY-MM.
  @ApiProperty({ example: '2026-09' })
  @IsString()
  @Length(7, 7)
  month!: string;

  // Define o limite do orçamento e suas regras de valor.
  @ApiProperty({ minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999999999)
  limitAmount!: number;

  // Permite informar uma categoria opcional usando um UUID.
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  // Permite um nome opcional para o orçamento, limitado a 120 caracteres.
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}