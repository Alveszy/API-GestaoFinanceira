import { Global, Module } from '@nestjs/common';

import { IdempotencyService } from './idempotency.service';

@Global()
@Module({
  // Disponibiliza o serviço dentro deste módulo
  providers: [IdempotencyService],

  // Permite que outros módulos utilizem o serviço
  exports: [IdempotencyService],
})
export class CommonModule {}