import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CurrentUser } from '../../common/current-user.decorator';
import { IdempotencyService } from '../../common/idempotency.service';

import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

// Define a categoria das rotas no Swagger.
@ApiTags('Categorias')

// Indica que as rotas utilizam autenticação Bearer/JWT.
@ApiBearerAuth()

// Exige autenticação JWT para acessar as rotas.
@UseGuards(AuthGuard('jwt'))

// Define "categories" como caminho base das rotas.
@Controller('categories')
export class CategoriesController {

  constructor(
    // Repositório usado para acessar a tabela Category.
    @InjectRepository(Category)
    private repo: Repository<Category>,

    // Serviço usado para evitar operações duplicadas.
    private idem: IdempotencyService,
  ) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateCategoryDto,
    @Headers('idempotency-key') key: string,
  ) {
    // Cria e salva a categoria garantindo que a mesma operação não seja repetida.
    return this.idem.execute(
      `category:${user.id}`,
      key,
      () =>
        this.repo.save(
          this.repo.create({
            ...dto,
            user: { id: user.id } as any,
          }),
        ),
      dto,
    );
  }

  @Get()
  findAll(@CurrentUser() user: any) {

    // Busca somente as categorias pertencentes ao usuário e ordena pelo nome.
    return this.repo.find({
      where: {
        user: { id: user.id },
      },
      order: {
        name: 'ASC',
      },
    });
  }
}