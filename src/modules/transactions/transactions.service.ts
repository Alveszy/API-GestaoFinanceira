import { Injectable, NotFoundException } from '@nestjs/common'; import { InjectRepository } from '@nestjs/typeorm'; import { Repository } from 'typeorm'; import { Transaction } from './transaction.entity'; import { Account } from '../accounts/account.entity'; import { Category } from '../categories/category.entity'; import { CreateTransactionDto } from './dto/create-transaction.dto';
@Injectable() export class TransactionsService {
  constructor(@InjectRepository(Transaction) private tx: Repository<Transaction>, @InjectRepository(Account) private accounts: Repository<Account>, @InjectRepository(Category) private categories: Repository<Category>) {}
  async create(userId: string, dto: CreateTransactionDto) {
    const account = await this.accounts.findOneBy({ id: dto.accountId, user: { id: userId } }); if (!account) throw new NotFoundException('Conta não encontrada.');
    let category: Category | null = null; if (dto.categoryId) { category = await this.categories.findOneBy({ id: dto.categoryId, user: { id: userId } }); if (!category) throw new NotFoundException('Categoria não encontrada.'); if (category.kind !== dto.kind) throw new NotFoundException('A categoria não corresponde ao tipo da transação.'); }
    return this.tx.save(this.tx.create({ ...dto, amount: dto.amount.toFixed(2), status: dto.status || 'completed', user: { id: userId } as any, account, category }));
  }
  findAll(userId: string, from?: string, to?: string) { const qb = this.tx.createQueryBuilder('t').leftJoinAndSelect('t.account','account').leftJoinAndSelect('t.category','category').where('t.userId = :userId',{userId}); if (from) qb.andWhere('t.occurredAt >= :from',{from}); if (to) qb.andWhere('t.occurredAt <= :to',{to}); return qb.orderBy('t.occurredAt','DESC').take(200).getMany(); }
  async remove(userId: string, id: string) { const t = await this.tx.findOneBy({ id, user: { id: userId } }); if (!t) throw new NotFoundException('Transação não encontrada.'); await this.tx.remove(t); return { deleted: true }; }
}
