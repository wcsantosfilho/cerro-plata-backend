import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefreshToken1766597358042 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.query(`
        CREATE TABLE refresh_tokens (
            id uuid NOT NULL DEFAULT uuid_generate_v4(),
            token_hash varchar NOT NULL,
            expires_at timestamptz NOT NULL,
            user_id uuid NOT NULL,
            CONSTRAINT refresh_token_pk_id PRIMARY KEY (id),
            CONSTRAINT refresh_token_fk_user FOREIGN KEY (user_id)
                REFERENCES app_users(id)
                ON DELETE CASCADE
        );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS refresh_tokens;`);
  }
}
