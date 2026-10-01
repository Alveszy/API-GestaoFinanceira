import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Account } from './account.entity';
import { Transaction } from '../transactions/transaction.entity';

import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';

@Module({
  imports: [
    // Disponibiliza os repositórios das entidades.
    TypeOrmModule.forFeature([Account, Transaction]),
  ],

  providers: [
    AccountsService,
  ],

  controllers: [
    AccountsController,
  ],
})
export class AccountsModule {}