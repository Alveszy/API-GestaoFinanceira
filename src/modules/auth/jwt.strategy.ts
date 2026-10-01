import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(config: ConfigService) {
    super({
      // Pega o JWT do cabeçalho Authorization: Bearer <token>.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Não permite utilizar um token que já expirou.
      ignoreExpiration: false,

      // Usa a chave secreta para validar o JWT.
      secretOrKey:
        config.get('JWT_SECRET') ||
        'local-development-secret-change-this-32chars',
    });
  }

  // Executado depois que o token é validado.
  validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}