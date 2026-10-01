import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from './category.entity';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [
    // Disponibiliza o repositório da entidade Category neste módulo.
    TypeOrmModule.forFeature([Category]),
  ],

  // Registra o controller responsável pelas rotas de categorias.
  controllers: [CategoriesController],
})
export class CategoriesModule {}