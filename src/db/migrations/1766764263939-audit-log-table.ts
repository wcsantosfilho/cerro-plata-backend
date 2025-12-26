import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuditLogTable1766764263939 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.query(`
        CREATE TABLE audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id VARCHAR(255) NOT NULL,
            action VARCHAR(50) NOT NULL,
            entity VARCHAR(100) NOT NULL,
            entity_id VARCHAR(255),
            data_before JSONB,
            data_after JSONB,
            ip_address VARCHAR(100),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs;`);
  }
}
