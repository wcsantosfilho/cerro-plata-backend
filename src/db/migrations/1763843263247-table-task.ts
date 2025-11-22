import { MigrationInterface, QueryRunner } from 'typeorm';

export class TableTask1763843263247 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS tasks;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await queryRunner.query(`
        CREATE TABLE tasks (
            id uuid NOT NULL DEFAULT uuid_generate_v4(),
            title varchar(256) NOT NULL,
            description varchar(512) NOT NULL,
            STATUS varchar(50) NOT NULL DEFAULT 'TO_DO',
            expiration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            CONSTRAINT task_pk PRIMARY KEY (id)
        );
    `);
  }
}
