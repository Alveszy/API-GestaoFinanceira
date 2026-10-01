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

@Entity('accounts') // Define a tabela "accounts".
@Index(['user', 'name'], { unique: true }) // Impede contas com mesmo nome para o mesmo usuário.
export class Account {

  @PrimaryGeneratedColumn('uuid') // Gera um ID único automaticamente.
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' }) // Vários usuários podem ter contas; exclui junto com o usuário.
  user!: User;

  @Column({ length: 100 }) // Nome da conta.
  name!: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'checking',
  }) // Tipo da conta, com "checking" como padrão.
  type!: string;

  @Column({
    type: 'char',
    length: 3,
    default: 'BRL',
  }) // Define a moeda da conta.
  currency!: string;

  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    default: 0,
  }) // Guarda o saldo inicial com 2 casas decimais.
  openingBalance!: string;

  @Column({ default: true }) // Define se a conta está ativa.
  active!: boolean;

  @CreateDateColumn() // Data criada automaticamente pelo banco.
  createdAt!: Date;

  @UpdateDateColumn() // Atualizada automaticamente quando houver alteração.
  updatedAt!: Date;
}