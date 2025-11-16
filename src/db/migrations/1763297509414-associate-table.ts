import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssociateTable1763297509414 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE associates
        ALTER COLUMN created_at SET DEFAULT now();
    `);
    await queryRunner.query(`
        ALTER TABLE associates
        ALTER COLUMN updated_at SET DEFAULT now();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE associates
      ALTER COLUMN created_at DROP DEFAULT;
    `);
    await queryRunner.query(`
      ALTER TABLE associates
      ALTER COLUMN updated_at DROP DEFAULT;
    `);
  }
}
