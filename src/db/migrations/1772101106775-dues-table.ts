import { MigrationInterface, QueryRunner } from 'typeorm';

export class DuesTable1772101106775 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.query(`
        CREATE TABLE dues (
            id uuid NOT NULL DEFAULT uuid_generate_v4(),
            associate_id uuid,
            organization_id uuid,
            due_date timestamptz NOT NULL,
            description varchar(256) NOT NULL,
            amount decimal NOT NULL,
            type varchar NOT NULL,
            payment_plan varchar NOT NULL,
            created_at timestamptz NOT NULL DEFAULT NOW(),
            updated_at timestamptz NOT NULL DEFAULT NOW(),
            CONSTRAINT due_pk_id PRIMARY KEY (id),
            CONSTRAINT due_fk_associate FOREIGN KEY (associate_id)
                REFERENCES associates(id)
                ON DELETE SET NULL,
            CONSTRAINT due_fk_organization FOREIGN KEY (organization_id)
                REFERENCES organizations(id)
                ON DELETE SET NULL
        );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS dues;`);
  }
}
