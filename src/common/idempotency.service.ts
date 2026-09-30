import { BadRequestException, ConflictException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import Redis from 'ioredis';
import { createHash } from 'crypto';

@Injectable()
export class IdempotencyService {
  private readonly redis = new Redis({ host: process.env.REDIS_HOST || 'localhost', port: Number(process.env.REDIS_PORT || 6379), password: process.env.REDIS_PASSWORD || undefined, lazyConnect: true, maxRetriesPerRequest: 1 });
  async execute<T>(scope: string, key: string | undefined, operation: () => Promise<T>, payload?: unknown): Promise<T> {
    if (!key || key.length > 128 || !/^[\w.-]+$/.test(key)) throw new BadRequestException('Informe um Idempotency-Key válido (1 a 128 caracteres).');
    try {
      await this.redis.connect().catch(() => undefined);
      const redisKey = `idempotency:${scope}:${key}`;
      const fingerprint = createHash('sha256').update(JSON.stringify(payload ?? null)).digest('hex');
      const processing = JSON.stringify({ state: 'processing', fingerprint });
      const claim = await this.redis.set(redisKey, processing, 'EX', 86400, 'NX');
      if (claim !== 'OK') {
        const prior = await this.redis.get(redisKey);
        if (prior) {
          const record = JSON.parse(prior);
          if (record.fingerprint !== fingerprint) throw new ConflictException('Esta chave já foi utilizada com dados diferentes.');
          if (record.state === 'processing') throw new ConflictException('Esta chave de idempotência já está sendo processada.');
          return record.response as T;
        }
        throw new ConflictException('A chave de idempotência já foi utilizada.');
      }
      try { const result = await operation(); await this.redis.set(redisKey, JSON.stringify({ state: 'completed', fingerprint, response: result }), 'EX', 86400); return result; }
      catch (error) { await this.redis.del(redisKey); throw error; }
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) throw error;
      throw new ServiceUnavailableException('Serviço de idempotência indisponível; tente novamente.');
    }
  }
}
