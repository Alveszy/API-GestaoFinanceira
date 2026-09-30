import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ProblemDetailsFilter } from './common/problem-details.filter';
import { RequestContextMiddleware } from './common/request-context.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const requestContext = new RequestContextMiddleware();
  app.use(requestContext.use.bind(requestContext));
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new ProblemDetailsFilter());
  const config = new DocumentBuilder().setTitle('API de Gestão Financeira')
    .setDescription('API REST para controle financeiro pessoal. Erros seguem RFC 7807; envie Idempotency-Key nas operações de criação.')
    .setVersion('1.0.0').addBearerAuth().build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
