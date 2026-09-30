import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; import { IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
export class CreateTransactionDto {
  @ApiProperty({ enum: ['income','expense'] }) @IsIn(['income','expense']) kind: 'income'|'expense';
  @ApiProperty({ minimum: 0.01 }) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) @Max(999999999999) amount: number;
  @ApiProperty() @IsString() @MaxLength(180) description: string;
  @ApiProperty() @IsUUID() accountId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() categoryId?: string;
  @ApiProperty({ example: '2026-09-26' }) @IsDateString() occurredAt: string;
  @ApiPropertyOptional({ enum: ['completed','pending'], default: 'completed' }) @IsOptional() @IsIn(['completed','pending']) status?: 'completed'|'pending';
}
