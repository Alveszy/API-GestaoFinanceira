import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Budget } from './budget.entity';
import { Category } from '../categories/category.entity';

import { BudgetsController } from './budgets.controller';

@Module({
  imports: [
    // Disponibiliza os repositórios de Budget e Category para este módulo.
    TypeOrmModule.forFeature([Budget, Category]),
  ],

  // Registra o controller responsável pelas rotas de orçamentos.
  controllers: [BudgetsController],
})
export class BudgetsModule {}