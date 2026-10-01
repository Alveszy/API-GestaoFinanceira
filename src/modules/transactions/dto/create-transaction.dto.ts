import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// Define os dados que podem ser recebidos ao criar uma transação.
export class CreateTransactionDto {

  // Define que a transação pode ser uma receita ou uma despesa.
  @ApiProperty({ enum: ['income', 'expense'] })
  @IsIn(['income', 'expense'])
  kind!: 'income' | 'expense';

  // Define o valor e limita a quantidade de casas decimais e o valor máximo.
  @ApiProperty({ minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999999999)
  amount!: number;

  // Define a descrição da transação e limita seu tamanho.
  @ApiProperty()
  @IsString()
  @MaxLength(180)
  description!: string;

  // Exige que o ID da conta seja um UUID válido.
  @ApiProperty()
  @IsUUID()
  accountId!: string;

  // Permite uma categoria opcional, mas exige que seu ID seja um UUID válido.
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  // Exige uma data válida para informar quando a transação aconteceu.
  @ApiProperty({ example: '2026-09-26' })
  @IsDateString()
  occurredAt!: string;

  // Permite definir o status da transação, usando "completed" como padrão.
  @ApiPropertyOptional({
    enum: ['completed', 'pending'],
    default: 'completed',
  })
  @IsOptional()
  @IsIn(['completed', 'pending'])
  status?: 'completed' | 'pending';
}
