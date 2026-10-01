import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Inicializa o AuthGuard usando a estratégia JWT
  constructor() {
    super();
  }

  // Verifica se o usuário pode acessar a rota
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  // Trata o resultado da autenticação
  handleRequest(err: any, user: any) {
    // Se houver erro ou nenhum usuário autenticado, bloqueia o acesso
    if (err || !user) {
      throw err || new UnauthorizedException('Não autenticado.');
    }

    // Se estiver autenticado, permite o acesso e retorna o usuário
    return user;
  }
}