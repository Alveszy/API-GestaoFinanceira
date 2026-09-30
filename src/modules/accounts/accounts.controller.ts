import { Body, Controller, Delete, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/current-user.decorator';
import { IdempotencyService } from '../../common/idempotency.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountsService } from './accounts.service';
@ApiTags('Contas') @ApiBearerAuth() @UseGuards(AuthGuard('jwt')) @Controller('accounts')
export class AccountsController {
  constructor(private service: AccountsService, private idempotency: IdempotencyService) {}
  @Post() @ApiOperation({ summary: 'Criar conta (requer Idempotency-Key)' }) create(@CurrentUser() user: any, @Body() dto: CreateAccountDto, @Headers('idempotency-key') key: string) { return this.idempotency.execute(`account:${user.id}`, key, () => this.service.create(user.id, dto), dto); }
  @Get() findAll(@CurrentUser() user: any) { return this.service.findAll(user.id); }
  @Delete(':id') remove(@CurrentUser() user: any, @Param('id') id: string) { return this.service.remove(user.id, id); }
}
