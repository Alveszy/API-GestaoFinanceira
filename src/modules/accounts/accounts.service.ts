import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
@Injectable()
export class AccountsService {
  constructor(@InjectRepository(Account) private repo: Repository<Account>) {}
  create(userId: string, dto: CreateAccountDto) { return this.repo.save(this.repo.create({ ...dto, openingBalance: (dto.openingBalance ?? 0).toFixed(2), currency: dto.currency?.toUpperCase() || 'BRL', user: { id: userId } as any })); }
  findAll(userId: string) { return this.repo.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } }); }
  async remove(userId: string, id: string) { const a = await this.repo.findOneBy({ id, user: { id: userId } }); if (!a) throw new NotFoundException('Conta não encontrada.'); await this.repo.remove(a); return { deleted: true }; }
}
