import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateAccountDto {

  @ApiProperty() // Exibe o campo no Swagger.
  @IsString() // Garante que seja texto.
  @MaxLength(100) // Limita o nome a 100 caracteres.
  name!: string;

  @ApiProperty({
    enum: ['checking', 'savings', 'cash', 'credit'],
  }) // Mostra as opções disponíveis no Swagger.
  @IsIn(['checking', 'savings', 'cash', 'credit']) // Aceita somente esses tipos.
  type!: string;

  @ApiPropertyOptional({ default: 'BRL' }) // Campo opcional com BRL como padrão.
  @IsOptional() // Permite que o campo não seja enviado.
  @IsString()
  @Length(3, 3) // Exige exatamente 3 caracteres.
  currency?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }) // Permite no máximo 2 casas decimais.
  @Min(-999999999) // Define o menor valor permitido.
  @Max(999999999) // Define o maior valor permitido.
  openingBalance?: number;
}