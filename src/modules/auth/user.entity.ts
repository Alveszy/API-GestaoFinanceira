import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Define que a classe representa a tabela "users".
@Entity('users')
export class User {

  // Gera automaticamente um ID único para o usuário.
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Armazena o nome do usuário.
  @Column({ length: 120 })
  name!: string;

  // Armazena o e-mail e impede e-mails duplicados.
  @Column({ unique: true, length: 180 })
  email!: string;

  // Armazena a senha criptografada e não retorna esse campo nas consultas comuns.
  @Column({ select: false })
  passwordHash!: string;

  // Define o nível de acesso do usuário.
  @Column({
    type: 'varchar',
    length: 20,
    default: 'cliente',
  })
  role!: 'admin' | 'cliente';

  // Registra automaticamente a data de criação do usuário.
  @CreateDateColumn()
  createdAt!: Date;

  // Atualiza automaticamente a data de alteração do usuário.
  @UpdateDateColumn()
  updatedAt!: Date;
}