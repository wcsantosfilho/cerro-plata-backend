import { MigrationInterface, QueryRunner } from 'typeorm';

export class TableAssociates1768294782760 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE associates
        ADD COLUMN cpf varchar(11),
        ADD COLUMN emergency_phone_number varchar(20),
        ADD COLUMN category varchar(20),
        ADD COLUMN payment_plan varchar(20),
        ADD COLUMN blood_type varchar(6),
        ADD COLUMN birth_date date,
        ADD COLUMN fepam_registration_number varchar(20),
        ADD COLUMN fepam_due_date date,
        ADD COLUMN association_date date;

    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE associates
        DROP COLUMN cpf,
        DROP COLUMN emergency_phone_number,
        DROP COLUMN category,
        DROP COLUMN payment_plan,
        DROP COLUMN blood_type,
        DROP COLUMN birth_date,
        DROP COLUMN fepam_registration_number,
        DROP COLUMN fepam_due_date,
        DROP COLUMN association_date;
    `);
  }
}
