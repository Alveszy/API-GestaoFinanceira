import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// Define os dados necessários para criar uma categoria.
export class CreateCategoryDto {

  // Define o nome da categoria e limita o tamanho do texto.
  @ApiProperty()
  @IsString()
  @MaxLength(80)
  name!: string;

  // Define se a categoria será de receita ou despesa.
  @ApiProperty({ enum: ['income', 'expense'] })
  @IsIn(['income', 'expense'])
  kind!: 'income' | 'expense';

  // Permite informar uma cor opcional para a categoria.
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;
}