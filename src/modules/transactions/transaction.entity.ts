import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../auth/user.entity';
import { Account } from '../accounts/account.entity';
import { Category } from '../categories/category.entity';

// Define que essa classe representa a tabela "transactions" no banco.
@Entity('transactions')

// Cria um índice para facilitar buscas por usuário e data.
@Index(['user', 'occurredAt'])
export class Transaction {

  // Gera automaticamente um ID único no formato UUID.
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Relaciona a transação ao usuário que a criou.
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  // Relaciona a transação à conta utilizada.
  @ManyToOne(() => Account, { onDelete: 'RESTRICT' })
  account!: Account;

  // Relaciona a transação a uma categoria, que pode ser opcional.
  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  category!: Category | null;

  // Define se a transação é uma receita ou uma despesa.
  @Column({ type: 'varchar', length: 20 })
  kind!: 'income' | 'expense';

  // Armazena o valor da transação com até duas casas decimais.
  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount!: string;

  // Armazena a descrição da transação.
  @Column({ length: 180 })
  description!: string;

  // Armazena a data em que a transação aconteceu.
  @Column({ type: 'date' })
  occurredAt!: string;

  // Define o estado atual da transação.
  @Column({
    type: 'varchar',
    length: 20,
    default: 'completed',
  })
  status!: 'completed' | 'pending' | 'cancelled';

  // Registra automaticamente quando a transação foi criada.
  @CreateDateColumn()
  createdAt!: Date;

  // Atualiza automaticamente quando a transação é alterada.
  @UpdateDateColumn()
  updatedAt!: Date;
}
