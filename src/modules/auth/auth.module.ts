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
@Module({ imports: [TypeOrmModule.forFeature([User]), PassportModule, JwtModule.registerAsync({ inject: [ConfigService], useFactory: (c: ConfigService) => ({ secret: c.get('JWT_SECRET') || 'local-development-secret-change-this-32chars', signOptions: { expiresIn: c.get('JWT_EXPIRES_IN') || '15m' } }) })], controllers: [AuthController], providers: [AuthService, JwtStrategy, RolesGuard], exports: [JwtModule, PassportModule] })
export class AuthModule {}
