import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 120 }) name: string;
  @Column({ unique: true, length: 180 }) email: string;
  @Column({ select: false }) passwordHash: string;
  @Column({ type: 'varchar', length: 20, default: 'cliente' }) role: 'admin' | 'cliente';
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
