import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CurrentUser } from '../../common/current-user.decorator';
import { IdempotencyService } from '../../common/idempotency.service';

import { Category } from '../categories/category.entity';
import { Budget } from './budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';

// Define a categoria das rotas no Swagger.
@ApiTags('Orçamentos')

// Indica que as rotas utilizam autenticação Bearer/JWT.
@ApiBearerAuth()

// Exige autenticação JWT para acessar as rotas.
@UseGuards(AuthGuard('jwt'))

// Define "budgets" como caminho base das rotas.
@Controller('budgets')
export class BudgetsController {

  constructor(
    // Repositório usado para acessar os orçamentos no banco.
    @InjectRepository(Budget)
    private budgets: Repository<Budget>,

    // Repositório usado para consultar as categorias.
    @InjectRepository(Category)
    private categories: Repository<Category>,

    // Evita que a mesma operação seja processada duas vezes.
    private idem: IdempotencyService,
  ) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateBudgetDto,
    @Headers('idempotency-key') key: string,
  ) {
    // Executa a criação garantindo que a mesma requisição não seja duplicada.
    return this.idem.execute(
      `budget:${user.id}`,
      key,
      async () => {

        // Começa sem nenhuma categoria associada.
        let category: Category | null = null;

        // Verifica se o orçamento recebeu uma categoria.
        if (dto.categoryId) {

          // Procura a categoria e verifica se ela pertence ao usuário.
          category = await this.categories.findOneBy({
            id: dto.categoryId,
            user: { id: user.id },
          });

          // Retorna erro caso a categoria não exista.
          if (!category) {
            throw new NotFoundException('Categoria não encontrada.');
          }
        }

        // Cria e salva o orçamento no banco.
        return this.budgets.save(
          this.budgets.create({
            month: dto.month,
            limitAmount: dto.limitAmount.toFixed(2),
            name: dto.name,
            category,
            user: { id: user.id } as any,
          }),
        );
      },
      dto,
    );
  }

  @Get()
  findAll(@CurrentUser() user: any) {

    // Busca os orçamentos do usuário, incluindo suas categorias e ordenando pelo mês.
    return this.budgets.find({
      where: {
        user: { id: user.id },
      },
      relations: {
        category: true,
      },
      order: {
        month: 'DESC',
      },
    });
  }
}