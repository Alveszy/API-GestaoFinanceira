import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '@nestjs/passport';

import { CurrentUser } from '../../common/current-user.decorator';
import { IdempotencyService } from '../../common/idempotency.service';

import { CreateAccountDto } from './dto/create-account.dto';
import { AccountsService } from './accounts.service';

@ApiTags('Contas') // Agrupa as rotas no Swagger.
@ApiBearerAuth() // Indica que as rotas utilizam Bearer Token.
@UseGuards(AuthGuard('jwt')) // Exige autenticação por JWT.
@Controller('accounts') // Define "/accounts" como rota base.
export class AccountsController {

  constructor(
    private service: AccountsService,
    private idempotency: IdempotencyService,
  ) {}

  @Post() // Rota POST /accounts.
  @ApiOperation({
    summary: 'Criar conta (requer Idempotency-Key)',
  })
  create(
    @CurrentUser() user: any, // Obtém o usuário autenticado.
    @Body() dto: CreateAccountDto, // Obtém os dados enviados no corpo.
    @Headers('idempotency-key') key: string, // Obtém a chave de idempotência.
  ) {
    // Evita executar a mesma criação mais de uma vez.
    return this.idempotency.execute(
      `account:${user.id}`,
      key,
      () => this.service.create(user.id, dto),
      dto,
    );
  }

  @Get() // Rota GET /accounts.
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.id);
  }

  @Delete(':id') // Rota DELETE /accounts/:id.
  remove(
    @CurrentUser() user: any,
    @Param('id') id: string, // Obtém o ID da conta pela URL.
  ) {
    return this.service.remove(user.id, id);
  }
}