import { MigrationInterface, QueryRunner } from 'typeorm';

export class Associates1763944225899 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE associates
        ADD COLUMN address_complement varchar(256);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE associates
        DROP COLUMN address_complement;
    `);
  }
}
