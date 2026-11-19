import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { ApiBearerAuth, ApiBody, ApiConsumes, ApiHeader, ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { CurrentUser } from '../../common/current-user.decorator';
import { IdempotencyService } from '../../common/idempotency.service';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';
import { MAX_RECEIPT_BYTES } from './transaction-receipts.service';

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
  @ApiHeader({ name: 'idempotency-key', required: true, schema: { type: 'string', minLength: 1, maxLength: 128 } })
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

  @Put(':id/receipt')
  @ApiOperation({ summary: 'Anexar ou substituir comprovante PDF ou JPG (até 5 MiB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: {
    type: 'object',
    required: ['receipt'],
    properties: { receipt: { type: 'string', format: 'binary' } },
  } })
  @UseInterceptors(FileInterceptor('receipt', {
    limits: { fileSize: MAX_RECEIPT_BYTES, files: 1, fields: 0 },
  }))
  putReceipt(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() receipt?: { buffer: Buffer },
  ) {
    return this.service.putReceipt(user.id, id, receipt?.buffer);
  }

  @Get(':id/receipt')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  @ApiOperation({ summary: 'Baixar comprovante da própria transação' })
  @ApiProduces('application/pdf', 'image/jpeg')
  @ApiOkResponse({ schema: { type: 'string', format: 'binary' } })
  getReceipt(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.getReceipt(user.id, id);
  }

  @Get(':id/receipt/preview')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  @ApiOperation({ summary: 'Visualizar a imagem JPG do comprovante' })
  @ApiProduces('image/jpeg')
  @ApiOkResponse({ schema: { type: 'string', format: 'binary' } })
  previewReceipt(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.getReceipt(user.id, id, true);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    // Remove a transação pelo ID, verificando o usuário dono dela.
    return this.service.remove(user.id, id);
  }
}
