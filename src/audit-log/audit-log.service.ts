import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../db/entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
  ) {}

  async logAction(params: {
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    dataBefore?: any;
    dataAfter?: any;
    ipAddress?: string;
  }) {
    const log = this.auditRepo.create(params);
    await this.auditRepo.save(log);
  }
}
