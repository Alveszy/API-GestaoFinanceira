import { ApiProperty } from '@nestjs/swagger';

import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class RegisterDto {

  // Define o campo que será exibido na documentação do Swagger.
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  name!: string;

  // Valida se o valor informado possui formato de e-mail.
  @ApiProperty()
  @IsEmail()
  email!: string;

  // Define as regras de tamanho para a senha.
  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}