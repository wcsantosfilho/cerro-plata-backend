import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { AssociateEntity } from './associate.entity';
import { OrganizationEntity } from './organization.entity';
import { PaymentEntity } from './payment.entity';

@Entity({ name: 'dues' })
export class DueEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'timestamp', name: 'due_date' })
  dueDate: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'varchar', name: 'payment_plan' })
  paymentPlan: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => AssociateEntity, (associate) => associate.dues, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'associate_id' })
  associate?: AssociateEntity | null;

  @OneToMany(() => PaymentEntity, (payment) => payment.due, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  payments?: PaymentEntity[];

  @ManyToOne(() => OrganizationEntity, (organization) => organization.dues, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;
}
