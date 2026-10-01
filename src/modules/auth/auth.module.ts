import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { User } from './user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from '../../common/roles.guard';

@Module({
  imports: [
    // Disponibiliza o Repository da entidade User.
    TypeOrmModule.forFeature([User]),

    // Permite usar o Passport para autenticação.
    PassportModule,

    // Configura a criação e validação dos tokens JWT.
    JwtModule.registerAsync({
      inject: [ConfigService],

      // Pega as configurações do JWT nas variáveis de ambiente.
      useFactory: (c: ConfigService) => ({
        secret:
          c.get('JWT_SECRET') ||
          'local-development-secret-change-this-32chars',

        signOptions: {
          expiresIn: c.get('JWT_EXPIRES_IN') || '15m',
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
  ],

  // Permite que outros módulos utilizem JWT e Passport.
  exports: [
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}