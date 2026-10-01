import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Request, Response } from 'express';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Acessa os objetos de requisição e resposta do Express
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    // Tenta identificar um código de erro vindo do banco de dados
    const dbCode = (exception as any)?.driverError?.code;

    // 23505 = registro duplicado | 23503 = violação de chave estrangeira
    const isConstraintConflict =
      dbCode === '23505' || dbCode === '23503';

    // Define o status HTTP que será retornado
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : isConstraintConflict
          ? HttpStatus.CONFLICT
          : HttpStatus.INTERNAL_SERVER_ERROR;

    // Pega a resposta original da exceção do NestJS
    const raw: any =
      exception instanceof HttpException
        ? exception.getResponse()
        : null;

    // Define uma mensagem amigável para o erro
    const detail =
      typeof raw === 'string'
        ? raw
        : raw?.message ||
          (dbCode === '23505'
            ? 'Já existe um registro com esses dados.'
            : dbCode === '23503'
              ? 'Este registro está vinculado a outros dados e não pode ser alterado ou removido.'
              : status === 500
                ? 'Erro interno do servidor'
                : 'Requisição inválida');

    // Retorna o erro seguindo o formato Problem Details
    res
      .status(status)
      .type('application/problem+json')
      .json({
        type: `https://httpstatuses.com/${status}`,
        title:
          typeof raw?.error === 'string'
            ? raw.error
            : HttpStatus[status],
        status,
        detail,
        instance: req.url,
        requestId: (req as any).correlationId,
      });
  }
}