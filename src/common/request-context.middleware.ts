import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Tenta pegar um ID enviado pelo cliente
    const candidate =
      req.header('Correlation-ID') ||
      req.header('X-Request-ID');

    // Valida o ID recebido; se não for válido, gera um novo
    const id =
      candidate && /^[\w\.-]{1,128}$/.test(candidate)
        ? candidate
        : randomUUID();

    // Guarda o ID dentro da requisição
    (req as any).correlationId = id;

    // Envia o mesmo ID na resposta
    res.setHeader('Correlation-ID', id);

    // Marca o momento em que a requisição começou
    const start = Date.now();

    // Executa quando a resposta terminar
    res.on('finish', () => {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'info',
          requestId: id,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Date.now() - start,
        }),
      );
    });

    // Passa a requisição para o próximo middleware/controller
    next();
  }
}