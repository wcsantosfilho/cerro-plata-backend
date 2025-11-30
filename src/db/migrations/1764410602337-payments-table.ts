import { MigrationInterface, QueryRunner } from 'typeorm';

export class PaymentsTable1764410602337 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.query(`
        CREATE TABLE payments (
            id uuid NOT NULL DEFAULT uuid_generate_v4(),
            associate_id uuid,
            effective_date timestamptz NOT NULL,
            due_date timestamptz NOT NULL,
            description varchar(256) NOT NULL,
            amount decimal NOT NULL,
            type varchar NOT NULL,
            created_at timestamptz NOT NULL,
            updated_at timestamptz NOT NULL,
            CONSTRAINT payment_pk_id PRIMARY KEY (id),
            CONSTRAINT payment_fk_associate FOREIGN KEY (associate_id)
                REFERENCES associates(id)
                ON DELETE SET NULL
        );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS payments;`);
  }
}
