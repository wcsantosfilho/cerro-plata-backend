import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssociateTable1771665154716 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE associates
                DROP CONSTRAINT IF EXISTS associate_un_association_record;
        `);
    await queryRunner.query(`
            ALTER TABLE associates
                DROP CONSTRAINT IF EXISTS associate_un_cpf;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE associates
                ADD CONSTRAINT IF NOT EXISTS associate_un_association_record UNIQUE (association_record);
        `);
    await queryRunner.query(`
            ALTER TABLE associates
                ADD CONSTRAINT IF NOT EXISTS associate_un_cpf UNIQUE (cpf);
        `);
  }
}
