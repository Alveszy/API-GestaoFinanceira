import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector permite acessar os metadados definidos nos decorators
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Busca os cargos permitidos definidos no método ou no controller
    const roles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    // Se nenhuma role foi definida, permite o acesso
    if (!roles?.length) {
      return true;
    }

    // Pega a role do usuário logado e verifica se ela está permitida
    return roles.includes(
      context.switchToHttp().getRequest().user?.role,
    );
  }
}