import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';

import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {

  constructor(private auth: AuthService) {}

  @Post('register')
  // Limita a 5 requisições por minuto nessa rota.
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Criar conta de cliente' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  // Evita muitas tentativas de login em pouco tempo.
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Obter token JWT' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('admin/bootstrap')
  // Exige JWT válido e depois verifica se o usuário possui a role correta.
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  // Somente usuários com a role "admin" podem acessar.
  @Roles('admin')
  @ApiOperation({ summary: 'Verificar acesso administrativo' })
  bootstrap() {
    return {
      message: 'Administrador autenticado.',
    };
  }

  @Get('admin/users')
  // Protege a rota contra usuários não autenticados e não administradores.
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({
    summary: 'Listar usuários (somente administrador)',
  })
  listUsers() {
    return this.auth.listUsers();
  }
}