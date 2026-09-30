import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
export class RegisterDto {
  @ApiProperty() @IsString() @MaxLength(120) name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) @MaxLength(72) password: string;
}
