import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Account } from './account.entity';
import { Transaction } from '../transactions/transaction.entity';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {

  constructor(
    @InjectRepository(Account)
    private repo: Repository<Account>,

    @InjectRepository(Transaction)
    private transactions: Repository<Transaction>,
  ) {}

  create(userId: string, dto: CreateAccountDto) {
    return this.repo.save(
      this.repo.create({
        ...dto,

        // Garante o valor com duas casas decimais.
        openingBalance: (dto.openingBalance ?? 0).toFixed(2),

        currency: dto.currency?.toUpperCase() || 'BRL',

        user: { id: userId } as any,
      }),
    );
  }

  async findAll(userId: string) {
    const accounts = await this.repo.find({
      where: {
        user: { id: userId },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const movements = await this.transactions
      .createQueryBuilder('transaction')
      .innerJoin('transaction.account', 'account')
      .select('account.id', 'accountId')
      .addSelect(
        'SUM(CASE WHEN transaction.kind = :income THEN transaction.amount ELSE -transaction.amount END)',
        'netAmount',
      )
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.status = :status', {
        status: 'completed',
      })
      .setParameter('income', 'income')
      .groupBy('account.id')
      .getRawMany<{
        accountId: string;
        netAmount: string;
      }>();

    // Cria um mapa para encontrar rapidamente os movimentos de cada conta.
    const movementByAccount = new Map(
      movements.map(({ accountId, netAmount }) => [
        accountId,
        netAmount,
      ]),
    );

    return accounts.map((account) => {
      const openingBalanceCents = Math.round(
        Number(account.openingBalance) * 100,
      );

      const movementCents = Math.round(
        Number(movementByAccount.get(account.id) ?? 0) * 100,
      );

      return {
        ...account,

        // Soma saldo inicial + movimentações da conta.
        balance: (
          (openingBalanceCents + movementCents) /
          100
        ).toFixed(2),
      };
    });
  }

  async remove(userId: string, id: string) {
    const a = await this.repo.findOneBy({
      id,
      user: { id: userId },
    });

    if (!a) {
      throw new NotFoundException('Conta não encontrada.');
    }

    await this.repo.remove(a);

    return {
      deleted: true,
    };
  }
}