import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssociateTable1769766320122 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE associates
        ADD COLUMN email varchar(256),
        ADD CONSTRAINT associate_un_cpf UNIQUE(cpf);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE associates
        DROP COLUMN email,
        DROP CONSTRAINT IF EXISTS associate_un_cpf;
    `);
  }
}
