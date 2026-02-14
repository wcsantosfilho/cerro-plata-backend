import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationTable1770200803155 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await queryRunner.query(`
      CREATE TABLE organizations (
          id uuid NOT NULL DEFAULT uuid_generate_v4(),
          organization_name varchar(256) NOT NULL,
          created_at timestamptz NOT NULL DEFAULT NOW(),
          updated_at timestamptz NOT NULL DEFAULT NOW(),
          CONSTRAINT organization_pk_id PRIMARY KEY (id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS organizations;`);
  }
}
