import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); const res = ctx.getResponse<Response>(); const req = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw: any = exception instanceof HttpException ? exception.getResponse() : null;
    const detail = typeof raw === 'string' ? raw : raw?.message || (status === 500 ? 'Erro interno do servidor' : 'Requisição inválida');
    res.status(status).type('application/problem+json').json({
      type: `https://httpstatuses.com/${status}`, title: typeof raw?.error === 'string' ? raw.error : HttpStatus[status], status,
      detail, instance: req.url, requestId: (req as any).correlationId,
    });
  }
}
