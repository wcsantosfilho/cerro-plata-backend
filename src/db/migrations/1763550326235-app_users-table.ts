import { MigrationInterface, QueryRunner } from 'typeorm';

export class AppUsersTable1763550326235 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE app_users
        ADD COLUMN email varchar(256);
    `);
    await queryRunner.query(`
        UPDATE app_users
        SET email = CONCAT(username, '@example.com')
        WHERE email IS NULL;
    `);
    await queryRunner.query(`
        ALTER TABLE app_users
        ALTER COLUMN email SET NOT NULL;
    `);
    await queryRunner.query(`
        ALTER TABLE app_users
        ADD CONSTRAINT app_users_un_email UNIQUE(email);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE app_users
      DROP COLUMN email;
    `);
    await queryRunner.query(`
      ALTER TABLE app_users
      DROP CONSTRAINT app_users_un_email;
    `);
  }
}
