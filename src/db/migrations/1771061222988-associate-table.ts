import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssociateTable1771061222988 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.query(`
            ALTER TABLE associates
                ADD COLUMN organization_id uuid NOT NULL,
                CONSTRAINT associate_fk_organization FOREIGN KEY (organization_id)
                REFERENCES organizations(id)
                ON DELETE SET NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE associates
                DROP COLUMN organization_id,
                DROP CONSTRAINT IF EXISTS associate_fk_organization;
        `);
  }
}
