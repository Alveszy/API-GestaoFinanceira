// Importa o recurso para criar um módulo no NestJS.
import { Module } from '@nestjs/common';

// Importa as ferramentas para carregar e acessar configurações da aplicação.
import { ConfigModule, ConfigService } from '@nestjs/config';

// Importa o recurso usado para criar um Guard global.
import { APP_GUARD } from '@nestjs/core';

// Importa as ferramentas de controle de requisições.
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// Importa as ferramentas para conectar o NestJS ao banco de dados.
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa os módulos responsáveis pelas funcionalidades da aplicação.
import { AuthModule } from './modules/auth/auth.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { HealthModule } from './modules/health/health.module';
import { CommonModule } from './common/common.module';

// Importa o Guard responsável por verificar as permissões dos usuários.
import { RolesGuard } from './common/roles.guard';

// Importa as entidades que representam as tabelas do banco de dados.
import { User } from './modules/auth/user.entity';
import { Account } from './modules/accounts/account.entity';
import { Transaction } from './modules/transactions/transaction.entity';
import { Category } from './modules/categories/category.entity';
import { Budget } from './modules/budgets/budget.entity';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    TypeOrmModule.forRootAsync({ imports: [ConfigModule], inject: [ConfigService], useFactory: (c: ConfigService) => ({
      type: 'postgres' as const, host: c.get<string>('DB_HOST', 'localhost'), port: c.get<number>('DB_PORT', 5432),
      username: c.get<string>('DB_USERNAME', 'finance'), password: c.get<string>('DB_PASSWORD', 'finance_dev'),
      database: c.get<string>('DB_DATABASE', 'finance_db'), entities: [User, Account, Transaction, Category, Budget],
      synchronize: c.get('DB_SYNCHRONIZE', 'false') === 'true', autoLoadEntities: true,
    }) }),
    CommonModule, AuthModule, AccountsModule, TransactionsModule, CategoriesModule, BudgetsModule, HealthModule],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }, RolesGuard],
})
export class AppModule {}
