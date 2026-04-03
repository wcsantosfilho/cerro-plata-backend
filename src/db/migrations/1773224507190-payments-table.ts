import { MigrationInterface, QueryRunner } from 'typeorm';

export class PaymentsTable1773224507190 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.query(`
            ALTER TABLE payments
                ADD COLUMN due_id uuid
        `);
    await queryRunner.query(`
            ALTER TABLE payments
                ADD CONSTRAINT payment_fk_due FOREIGN KEY (due_id)
                REFERENCES dues(id)
                ON DELETE SET NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE payments
                DROP COLUMN due_id,
                DROP CONSTRAINT IF EXISTS payment_fk_due;
        `);
  }
}
