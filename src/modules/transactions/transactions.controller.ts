import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CurrentUser } from '../../common/current-user.decorator';
import { IdempotencyService } from '../../common/idempotency.service';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';

// Identifica o controller nas categorias do Swagger.
@ApiTags('Transações')

// Informa que as rotas utilizam autenticação Bearer/JWT.
@ApiBearerAuth()

// Exige autenticação JWT para acessar as rotas deste controller.
@UseGuards(AuthGuard('jwt'))

// Define "transactions" como caminho base das rotas.
@Controller('transactions')
export class TransactionsController {

  constructor(
    // Service responsável pela lógica das transações.
    private service: TransactionsService,

    // Service responsável por evitar o processamento duplicado de requisições.
    private idem: IdempotencyService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar receita ou despesa (requer Idempotency-Key)',
  })
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateTransactionDto,
    @Headers('idempotency-key') key: string,
  ) {
    // Executa a criação garantindo que a mesma requisição não seja processada duas vezes.
    return this.idem.execute(
      `transaction:${user.id}`,
      key,
      () => this.service.create(user.id, dto),
      dto,
    );
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    // Busca as transações do usuário, podendo filtrar por período.
    return this.service.findAll(user.id, from, to);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    // Remove a transação pelo ID, verificando o usuário dono dela.
    return this.service.remove(user.id, id);
  }
}