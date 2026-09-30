import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../auth/user.entity';
@Entity('accounts') @Index(['user', 'name'], { unique: true })
export class Account {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) user: User;
  @Column({ length: 100 }) name: string;
  @Column({ type: 'varchar', length: 30, default: 'checking' }) type: string;
  @Column({ type: 'char', length: 3, default: 'BRL' }) currency: string;
  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 }) openingBalance: string;
  @Column({ default: true }) active: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
