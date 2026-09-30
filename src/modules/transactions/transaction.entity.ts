import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../auth/user.entity'; import { Account } from '../accounts/account.entity'; import { Category } from '../categories/category.entity';
@Entity('transactions') @Index(['user', 'occurredAt'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) user: User;
  @ManyToOne(() => Account, { onDelete: 'RESTRICT' }) account: Account;
  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' }) category: Category | null;
  @Column({ type: 'varchar', length: 20 }) kind: 'income' | 'expense';
  @Column({ type: 'numeric', precision: 14, scale: 2 }) amount: string;
  @Column({ length: 180 }) description: string;
  @Column({ type: 'date' }) occurredAt: string;
  @Column({ type: 'varchar', length: 20, default: 'completed' }) status: 'completed' | 'pending' | 'cancelled';
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
