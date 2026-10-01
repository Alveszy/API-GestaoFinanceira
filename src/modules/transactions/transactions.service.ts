// Importa ferramentas do NestJS para criar o serviço e tratar erros de "não encontrado".
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

// Importa recursos para conectar o serviço aos repositórios do TypeORM.
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isDateString } from 'class-validator';

// Importa as entidades usadas pelo serviço.
import { Transaction } from './transaction.entity';
import { Account } from '../accounts/account.entity';
import { Category } from '../categories/category.entity';

// Importa o DTO usado para receber os dados de uma nova transação.
import { CreateTransactionDto } from './dto/create-transaction.dto';

// Marca a classe como um serviço gerenciado pelo NestJS.
@Injectable()
export class TransactionsService {

  // Cria os repositórios que permitem acessar transações, contas e categorias no banco.
  constructor(
    // Repositório responsável pelas transações.
    @InjectRepository(Transaction)
    private tx: Repository<Transaction>,

    // Repositório responsável pelas contas.
    @InjectRepository(Account)
    private accounts: Repository<Account>,

    // Repositório responsável pelas categorias.
    @InjectRepository(Category)
    private categories: Repository<Category>,
  ) {}

  // Cria uma nova transação para o usuário.
  async create(userId: string, dto: CreateTransactionDto) {

    // Procura a conta informada pelo usuário e verifica se ela pertence a ele.
    const account = await this.accounts.findOneBy({
      id: dto.accountId,
      user: { id: userId },
    });

    // Retorna erro caso a conta não exista ou não pertença ao usuário.
    if (!account) {
      throw new NotFoundException('Conta não encontrada.');
    }

    // Inicialmente, a transação não possui categoria.
    let category: Category | null = null;

    // Verifica se o usuário informou uma categoria.
    if (dto.categoryId) {

      // Procura a categoria e verifica se ela pertence ao usuário.
      category = await this.categories.findOneBy({
        id: dto.categoryId,
        user: { id: userId },
      });

      // Retorna erro caso a categoria não exista.
      if (!category) {
        throw new NotFoundException('Categoria não encontrada.');
      }

      // Verifica se o tipo da categoria é igual ao tipo da transação.
      if (category.kind !== dto.kind) {
        throw new NotFoundException(
          'A categoria não corresponde ao tipo da transação.',
        );
      }
    }

    // Cria e salva a nova transação no banco de dados.
    const savedTransaction = await this.tx.save(
      this.tx.create({

        // Copia os dados enviados pelo usuário para a transação.
        ...dto,

        // Formata o valor da transação com duas casas decimais.
        amount: dto.amount.toFixed(2),

        // Define "completed" como status padrão caso nenhum seja informado.
        status: dto.status || 'completed',

        // Relaciona a transação ao usuário atual.
        user: { id: userId } as any,

        // Relaciona a transação à conta encontrada.
        account,

        // Relaciona a transação à categoria encontrada.
        category,
      }),
    );

    // Recalcula o saldo para retorná-lo junto com a conta da transação.
    const movement = await this.tx
      .createQueryBuilder('transaction')
      .innerJoin('transaction.account', 'account')
      .select(
        'COALESCE(SUM(CASE WHEN transaction.kind = :income THEN transaction.amount ELSE -transaction.amount END), 0)',
        'netAmount',
      )
      .where('transaction.userId = :userId', { userId })
      .andWhere('account.id = :accountId', { accountId: account.id })
      .andWhere('transaction.status = :status', { status: 'completed' })
      .setParameter('income', 'income')
      .getRawOne<{ netAmount: string }>();

    const balanceCents = Math.round(
      (Number(account.openingBalance) + Number(movement?.netAmount ?? 0)) * 100,
    );

    return {
      ...savedTransaction,
      account: {
        ...savedTransaction.account,
        balance: (balanceCents / 100).toFixed(2),
      },
    };
  }

  // Busca todas as transações de um usuário.
  findAll(userId: string, from?: string, to?: string) {

    // Rejeita filtros inválidos antes que cheguem à consulta SQL.
    if ((from && !isDateString(from)) || (to && !isDateString(to))) {
      throw new BadRequestException('Informe datas válidas nos filtros from e to.');
    }
    if (from && to && from > to) {
      throw new BadRequestException('A data from não pode ser posterior à data to.');
    }

    // Cria uma consulta personalizada para buscar as transações.
    const qb = this.tx
      .createQueryBuilder('t')

      // Busca também os dados da conta relacionada.
      .leftJoinAndSelect('t.account', 'account')

      // Busca também os dados da categoria relacionada.
      .leftJoinAndSelect('t.category', 'category')

      // Filtra somente as transações do usuário informado.
      .where('t.userId = :userId', { userId });

    // Se uma data inicial foi informada, filtra a partir dela.
    if (from) {
      qb.andWhere('t.occurredAt >= :from', { from });
    }

    // Se uma data final foi informada, filtra até ela.
    if (to) {
      qb.andWhere('t.occurredAt <= :to', { to });
    }

    // Ordena as transações da mais recente para a mais antiga e limita a 200.
    return qb
      .orderBy('t.occurredAt', 'DESC')
      .take(200)

      // Executa a consulta e retorna os resultados.
      .getMany();
  }

  // Remove uma transação específica do usuário.
  async remove(userId: string, id: string) {

    // Procura a transação pelo ID e verifica se pertence ao usuário.
    const t = await this.tx.findOneBy({
      id,
      user: { id: userId },
    });

    // Retorna erro caso a transação não seja encontrada.
    if (!t) {
      throw new NotFoundException('Transação não encontrada.');
    }

    // Remove a transação do banco de dados.
    await this.tx.remove(t);

    // Retorna uma confirmação de que a exclusão foi realizada.
    return {
      deleted: true,
    };
  }
}
