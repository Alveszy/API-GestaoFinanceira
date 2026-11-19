import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Transaction } from './transaction.entity';
import { Account } from '../accounts/account.entity';
import { Category } from '../categories/category.entity';

import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TransactionReceiptsService } from './transaction-receipts.service';

@Module({
  imports: [
    // Disponibiliza os repositórios dessas entidades para o módulo.
    TypeOrmModule.forFeature([
      Transaction,
      Account,
      Category,
    ]),
  ],

  // Registra o Service responsável pela lógica das transações.
  providers: [
    TransactionsService,
    TransactionReceiptsService,
  ],

  // Registra o Controller responsável pelas rotas das transações.
  controllers: [
    TransactionsController,
  ],
})
export class TransactionsModule {}
