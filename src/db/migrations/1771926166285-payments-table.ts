import { MigrationInterface, QueryRunner } from 'typeorm';

export class PaymentsTable1771926166285 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.query(`
            ALTER TABLE payments
                ADD COLUMN organization_id uuid
        `);
    await queryRunner.query(`
            ALTER TABLE payments
                ADD CONSTRAINT payment_fk_organization FOREIGN KEY (organization_id)
                REFERENCES organizations(id)
                ON DELETE SET NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE payments
                DROP COLUMN organization_id,
                DROP CONSTRAINT IF EXISTS payment_fk_organization;
        `);
  }
}
