import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../auth/user.entity';

// Define que a classe representa a tabela "categories".
@Entity('categories')

// Impede que o mesmo usuário tenha duas categorias com o mesmo nome e tipo.
@Index(['user', 'name', 'kind'], { unique: true })
export class Category {

  // Gera automaticamente um ID único para a categoria.
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Relaciona a categoria ao usuário que a criou.
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  // Armazena o nome da categoria.
  @Column({ length: 80 })
  name!: string;

  // Define se a categoria é de receita ou despesa.
  @Column({ type: 'varchar', length: 20 })
  kind!: 'income' | 'expense';

  // Armazena uma cor opcional para identificar a categoria.
  @Column({ nullable: true, length: 20 })
  color?: string;

  // Registra automaticamente a data de criação da categoria.
  @CreateDateColumn()
  createdAt!: Date;
}