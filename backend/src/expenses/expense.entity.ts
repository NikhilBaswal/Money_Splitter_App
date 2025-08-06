import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  payer: User;

  @Column('float')
  amount: number;

  @Column()
  product: string;

  @Column({ nullable: true })
  place: string;

  @Column({ nullable: true })
  remarks: string;

  @Column('simple-array')
  users: string[]; // names of users sharing the expense

  @Column('float', { nullable: true })
  share: number;

  @Column({ type: 'date', nullable: true })
  date: string;

  @Column({ nullable: true })
  sdate: string; // string date for display (e.g., formatted or original input)
}
