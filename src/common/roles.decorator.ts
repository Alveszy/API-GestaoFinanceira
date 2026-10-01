import { SetMetadata } from '@nestjs/common';

// Define quais roles podem existir no sistema
export type Role = 'admin' | 'cliente';

// Nome usado para identificar os metadados das roles
export const ROLES_KEY = 'roles';

// Decorator usado para definir quais roles podem acessar uma rota
export const Roles = (...roles: Role[]) => {
  return SetMetadata(ROLES_KEY, roles);
};