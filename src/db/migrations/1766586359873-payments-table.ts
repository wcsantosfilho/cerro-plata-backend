import { MigrationInterface, QueryRunner } from 'typeorm';

export class PaymentsTable1766586359873 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE payments
        ALTER COLUMN effective_date DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE payments
        ALTER COLUMN effective_date SET NOT NULL;
    `);
  }
}
