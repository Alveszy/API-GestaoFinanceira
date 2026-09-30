import { Module } from '@nestjs/common'; import { TypeOrmModule } from '@nestjs/typeorm'; import { Budget } from './budget.entity'; import { Category } from '../categories/category.entity'; import { BudgetsController } from './budgets.controller';
@Module({ imports: [TypeOrmModule.forFeature([Budget, Category])], controllers: [BudgetsController] }) export class BudgetsModule {}
