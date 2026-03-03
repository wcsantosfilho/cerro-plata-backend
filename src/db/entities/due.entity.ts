import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { AssociateEntity } from './associate.entity';
import { OrganizationEntity } from './organization.entity';

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

  @ManyToOne(() => AssociateEntity, (associate) => associate.payments, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'associate_id' })
  associate?: AssociateEntity | null;

  @ManyToOne(
    () => OrganizationEntity,
    (organization) => organization.payments,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;
}
