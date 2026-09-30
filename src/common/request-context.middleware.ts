import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const candidate = req.header('Correlation-ID') || req.header('X-Request-ID');
    const id = candidate && /^[\w.-]{1,128}$/.test(candidate) ? candidate : randomUUID();
    (req as any).correlationId = id;
    res.setHeader('Correlation-ID', id);
    const start = Date.now();
    res.on('finish', () => console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'info', requestId: id, method: req.method, path: req.originalUrl, statusCode: res.statusCode, durationMs: Date.now() - start })));
    next();
  }
}
