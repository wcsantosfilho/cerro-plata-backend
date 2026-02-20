import { MigrationInterface, QueryRunner } from 'typeorm';

export class AppUsersTable1771490777403 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.query(`
            ALTER TABLE app_users
                ADD COLUMN organization_id uuid
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE app_users
                DROP COLUMN organization_id,
        `);
  }
}
