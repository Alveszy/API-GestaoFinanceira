import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/roles.guard';
import { Throttle } from '@nestjs/throttler';
import { Roles } from '../../common/roles.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  @Post('register') @Throttle({ default: { limit: 5, ttl: 60000 } }) @ApiOperation({ summary: 'Criar conta de cliente' }) register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Post('login') @Throttle({ default: { limit: 5, ttl: 60000 } }) @ApiOperation({ summary: 'Obter token JWT' }) login(@Body() dto: LoginDto) { return this.auth.login(dto.email, dto.password); }
  @Post('admin/bootstrap') @UseGuards(AuthGuard('jwt'), RolesGuard) @ApiBearerAuth() @Roles('admin') @ApiOperation({ summary: 'Verificar acesso administrativo' }) bootstrap() { return { message: 'Administrador autenticado.' }; }
  @Get('admin/users') @UseGuards(AuthGuard('jwt'), RolesGuard) @ApiBearerAuth() @Roles('admin') @ApiOperation({ summary: 'Listar usuários (somente administrador)' }) listUsers() { return this.auth.listUsers(); }
}
