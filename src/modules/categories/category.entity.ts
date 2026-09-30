import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../auth/user.entity';
@Entity('categories') @Index(['user', 'name', 'kind'], { unique: true })
export class Category {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) user: User;
  @Column({ length: 80 }) name: string;
  @Column({ type: 'varchar', length: 20 }) kind: 'income' | 'expense';
  @Column({ nullable: true, length: 20 }) color?: string;
  @CreateDateColumn() createdAt: Date;
}
