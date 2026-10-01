import { ApiProperty } from '@nestjs/swagger';

import {
  IsEmail,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginDto {

  @ApiProperty()
  @IsEmail() // Valida o formato do e-mail.
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8) // Exige no mínimo 8 caracteres.
  password!: string;
}