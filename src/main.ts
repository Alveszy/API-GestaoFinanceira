// Permite que os decorators do TypeScript funcionem corretamente.
import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

import { ProblemDetailsFilter } from './common/problem-details.filter';
import { RequestContextMiddleware } from './common/request-context.middleware';

async function bootstrap() {

  // Cria a aplicação NestJS usando o módulo principal.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const requestContext = new RequestContextMiddleware();

  // Executa o middleware para adicionar contexto às requisições, como o Correlation-ID.
  app.use(requestContext.use.bind(requestContext));

  // Define "api/v1" como prefixo padrão de todas as rotas da API.
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // Permite que a API receba requisições de outros domínios.
  app.enableCors();

  // Valida os dados recebidos e remove campos que não estão definidos nos DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Faz com que os erros da API sejam retornados no formato Problem Details.
  app.useGlobalFilters(new ProblemDetailsFilter());

  // Configura as informações que aparecerão na documentação do Swagger.
  const config = new DocumentBuilder()
    .setTitle('API de Gestão Financeira')
    .setDescription(
      'API REST para controle financeiro pessoal. Erros seguem RFC 7807; envie Idempotency-Key nas operações de criação.',
    )
    .setVersion('1.0.0')

    // Adiciona suporte para autenticação usando Bearer Token/JWT no Swagger.
    .addBearerAuth()
    .build();

  // Cria a documentação da API e disponibiliza ela em /docs.
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, config),
  );

  // Inicia o servidor na porta definida ou usa a porta 3000 como padrão.
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

// Inicia a aplicação.
bootstrap();
