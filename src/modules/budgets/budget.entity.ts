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
import { Category } from '../categories/category.entity';

// Define que a classe representa a tabela "budgets".
@Entity('budgets')

// Impede que o mesmo usuário tenha dois orçamentos para o mesmo mês e categoria.
@Index(['user', 'month', 'category'], { unique: true })
export class Budget {

  // Gera automaticamente um ID único para o orçamento.
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Relaciona o orçamento ao usuário que o criou.
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  // Relaciona o orçamento a uma categoria, que pode ser opcional.
  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  category!: Category | null;

  // Armazena o mês do orçamento no formato YYYY-MM.
  @Column({ type: 'char', length: 7 })
  month!: string;

  // Armazena o valor máximo definido para o orçamento.
  @Column({ type: 'numeric', precision: 14, scale: 2 })
  limitAmount!: string;

  // Armazena um nome opcional para identificar o orçamento.
  @Column({ length: 120, nullable: true })
  name?: string;

  // Registra automaticamente a data de criação.
  @CreateDateColumn()
  createdAt!: Date;

  // Atualiza automaticamente a data de alteração.
  @UpdateDateColumn()
  updatedAt!: Date;
}