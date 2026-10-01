import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

// Decorator usado para acessar o usuário autenticado na requisição
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    // Pega o usuário que foi colocado na requisição pelo sistema de autenticação
    return ctx.switchToHttp().getRequest().user;
  },
);