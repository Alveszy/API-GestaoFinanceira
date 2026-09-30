import { Body, Controller, Delete, Get, Headers, Param, Post, Query, UseGuards } from '@nestjs/common'; import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'; import { AuthGuard } from '@nestjs/passport'; import { CurrentUser } from '../../common/current-user.decorator'; import { IdempotencyService } from '../../common/idempotency.service'; import { CreateTransactionDto } from './dto/create-transaction.dto'; import { TransactionsService } from './transactions.service';
@ApiTags('Transações') @ApiBearerAuth() @UseGuards(AuthGuard('jwt')) @Controller('transactions')
export class TransactionsController { constructor(private service: TransactionsService, private idem: IdempotencyService) {}
  @Post() @ApiOperation({ summary: 'Registrar receita ou despesa (requer Idempotency-Key)' }) create(@CurrentUser() user: any, @Body() dto: CreateTransactionDto, @Headers('idempotency-key') key: string) { return this.idem.execute(`transaction:${user.id}`, key, () => this.service.create(user.id, dto), dto); }
  @Get() findAll(@CurrentUser() user: any, @Query('from') from?: string, @Query('to') to?: string) { return this.service.findAll(user.id, from, to); }
  @Delete(':id') remove(@CurrentUser() user: any, @Param('id') id: string) { return this.service.remove(user.id, id); }
}
