import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserTable1763035392878 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await queryRunner.query(`
      CREATE TABLE app_users (
          id uuid NOT NULL DEFAULT uuid_generate_v4(),
          username varchar(256) NOT NULL,
          password_hash varchar(256) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          CONSTRAINT user_pk_id PRIMARY KEY (id),
          CONSTRAINT user_un_username UNIQUE(username)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM public.app_users WHERE username='admin';`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS app_users;`);
  }
}
