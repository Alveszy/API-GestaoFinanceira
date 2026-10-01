import {
  BadRequestException,
  ConflictException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

import Redis from 'ioredis';
import { createHash } from 'crypto';

@Injectable()
export class IdempotencyService {
  // Cria a conexão com o Redis usando as configurações do ambiente
  private readonly redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });

  async execute<T>(
    scope: string,
    key: string | undefined,
    operation: () => Promise<T>,
    payload?: unknown,
  ): Promise<T> {
    // Verifica se a Idempotency-Key existe e possui um formato válido
    if (
      !key ||
      key.length > 128 ||
      !/^[\w\.-]+$/.test(key)
    ) {
      throw new BadRequestException(
        'Informe um Idempotency-Key válido (1 a 128 caracteres).',
      );
    }

    // Cria uma chave única para armazenar a operação no Redis
    const redisKey = `idempotency:${scope}:${key}`;

    // Cria uma "impressão digital" dos dados enviados
    const fingerprint = createHash('sha256')
      .update(JSON.stringify(payload ?? null))
      .digest('hex');

    try {
      // Conecta ao Redis caso a conexão ainda esteja aguardando
      if (this.redis.status === 'wait') {
        await this.redis.connect();
      }

      // Marca a operação como "em processamento"
      const processing = JSON.stringify({
        state: 'processing',
        fingerprint,
      });

      // NX garante que a chave só seja criada se ainda não existir
      const claim = await this.redis.set(
        redisKey,
        processing,
        'EX',
        86400,
        'NX',
      );

      // Se a chave já existir, verifica o que aconteceu anteriormente
      if (claim !== 'OK') {
        const prior = await this.redis.get(redisKey);

        if (prior) {
          const record = JSON.parse(prior);

          // Impede reutilizar a mesma chave com dados diferentes
          if (record.fingerprint !== fingerprint) {
            throw new ConflictException(
              'Esta chave já foi utilizada com dados diferentes.',
            );
          }

          // Impede duas requisições iguais de serem processadas ao mesmo tempo
          if (record.state === 'processing') {
            throw new ConflictException(
              'Esta chave de idempotência já está sendo processada.',
            );
          }

          // Se já foi concluída, devolve o resultado anterior
          return record.response as T;
        }

        throw new ConflictException(
          'A chave de idempotência já foi utilizada.',
        );
      }
    } catch (error) {
      // Mantém os erros conhecidos
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      // Erros do Redis são convertidos para 503
      throw new ServiceUnavailableException(
        'Serviço de idempotência indisponível; tente novamente.',
      );
    }

    // Executa a operação real da aplicação
    let result: T;

    try {
      result = await operation();
    } catch (error) {
      // Se a operação falhar, libera a chave para uma nova tentativa
      await this.redis.del(redisKey).catch(() => undefined);

      // Mantém o erro original da operação
      throw error;
    }

    try {
      // Salva o resultado para futuras requisições com a mesma chave
      await this.redis.set(
        redisKey,
        JSON.stringify({
          state: 'completed',
          fingerprint,
          response: result,
        }),
        'EX',
        86400,
      );
    } catch (error) {
      // Mantém a chave em processamento para evitar repetir uma operação
      // que pode já ter sido gravada no banco de dados
      throw new ServiceUnavailableException(
        'Serviço de idempotência indisponível; tente novamente.',
      );
    }

    // Retorna o resultado da operação
    return result;
  }
}