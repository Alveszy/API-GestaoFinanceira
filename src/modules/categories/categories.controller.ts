import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common'; import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; import { AuthGuard } from '@nestjs/passport'; import { InjectRepository } from '@nestjs/typeorm'; import { Repository } from 'typeorm'; import { CurrentUser } from '../../common/current-user.decorator'; import { IdempotencyService } from '../../common/idempotency.service'; import { Category } from './category.entity'; import { CreateCategoryDto } from './dto/create-category.dto';
@ApiTags('Categorias') @ApiBearerAuth() @UseGuards(AuthGuard('jwt')) @Controller('categories')
export class CategoriesController { constructor(@InjectRepository(Category) private repo: Repository<Category>, private idem: IdempotencyService) {}
  @Post() create(@CurrentUser() user: any, @Body() dto: CreateCategoryDto, @Headers('idempotency-key') key: string) { return this.idem.execute(`category:${user.id}`, key, () => this.repo.save(this.repo.create({ ...dto, user: { id: user.id } as any })), dto); }
  @Get() findAll(@CurrentUser() user: any) { return this.repo.find({ where: { user: { id: user.id } }, order: { name: 'ASC' } }); }
}
