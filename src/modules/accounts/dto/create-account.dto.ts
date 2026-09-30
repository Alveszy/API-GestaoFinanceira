import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, Length, Max, Min, MaxLength } from 'class-validator';
export class CreateAccountDto {
  @ApiProperty() @IsString() @MaxLength(100) name: string;
  @ApiProperty({ enum: ['checking', 'savings', 'cash', 'credit'] }) @IsIn(['checking', 'savings', 'cash', 'credit']) type: string;
  @ApiPropertyOptional({ default: 'BRL' }) @IsOptional() @IsString() @Length(3, 3) currency?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(-999999999) @Max(999999999) openingBalance?: number;
}
