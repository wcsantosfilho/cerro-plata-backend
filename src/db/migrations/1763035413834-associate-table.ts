import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssociateTable1763035413834 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await queryRunner.query(`
      CREATE TABLE associates (
          id uuid NOT NULL DEFAULT uuid_generate_v4(),
          association_record varchar(20) NOT NULL,
          name varchar(256) NOT NULL,
          phone_number varchar(20),
          zip_code varchar(20),
          street_name varchar(256),
          street_number varchar(20),
          city varchar(128),
          state varchar(2),
          country varchar(2),
          type varchar(20),
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL,
          CONSTRAINT associate_pk_id PRIMARY KEY (id),
          CONSTRAINT associate_un_association_record UNIQUE(association_record)
      );
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS associates;`);
  }
}
