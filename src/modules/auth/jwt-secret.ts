import { ConfigService } from '@nestjs/config';

const developmentSecret = 'local-development-secret-change-this-32chars';
const exampleSecret = 'change-this-to-a-random-secret-at-least-32-characters';

export function jwtSecret(config: ConfigService): string {
  const secret = config.get<string>('JWT_SECRET');
  if (
    config.get('NODE_ENV') === 'production' &&
    (!secret || secret.trim().length < 32 || secret === developmentSecret || secret === exampleSecret)
  ) {
    throw new Error('Configure um JWT_SECRET próprio de pelo menos 32 caracteres.');
  }
  return secret || developmentSecret;
}
