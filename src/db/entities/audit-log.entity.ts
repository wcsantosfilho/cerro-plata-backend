import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @Column({ name: 'action', type: 'varchar' })
  action: string;

  @Column({ name: 'entity', type: 'varchar' })
  entity: string;

  @Column({ name: 'entity_id', type: 'varchar', nullable: true })
  entityId: string;

  @Column({ name: 'data_before', type: 'jsonb', nullable: true })
  dataBefore?: any;

  @Column({ name: 'data_after', type: 'jsonb', nullable: true })
  dataAfter?: any;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
