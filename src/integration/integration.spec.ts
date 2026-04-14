// ---------------------------------------------------------------------------
// SQLite compatibility patch
// TypeORM's EntityMetadataValidator rejects `timestamp` / `timestamptz` column
// types when using the better-sqlite3 driver because they are not in its
// `supportedDataTypes` list.  We patch the validator here – BEFORE the NestJS
// testing module is compiled – so that those types are accepted in a SQLite
// context without touching the production entity definitions.
// ---------------------------------------------------------------------------

const {
  EntityMetadataValidator,
} = require('typeorm/metadata-builder/EntityMetadataValidator');
const _origValidate = EntityMetadataValidator.prototype.validate;
EntityMetadataValidator.prototype.validate = function (
  entityMetadata: any,
  allEntityMetadatas: any,
  driver: any,
) {
  const SQLITE_EXTRA_TYPES = ['timestamp', 'timestamptz'];
  if (['better-sqlite3', 'sqlite'].includes(driver?.options?.type)) {
    const original: string[] = driver.supportedDataTypes;
    driver.supportedDataTypes = [...original, ...SQLITE_EXTRA_TYPES];
    try {
      return _origValidate.call(
        this,
        entityMetadata,
        allEntityMetadatas,
        driver,
      );
    } finally {
      driver.supportedDataTypes = original;
    }
  }
  return _origValidate.call(this, entityMetadata, allEntityMetadatas, driver);
};
// ---------------------------------------------------------------------------

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

import { AssociatesService } from '../modules/associates/associates.service';
import { OrganizationsService } from '../modules/organizations/organizations.service';
import { PaymentsService } from '../modules/payments/payments.service';
import { DuesService } from '../modules/dues/dues.service';
import { UsersService } from '../modules/users/users.service';

import { OrganizationEntity } from '../db/entities/organization.entity';
import { UserEntity } from '../db/entities/users.entity';
import { AssociateEntity } from '../db/entities/associate.entity';
import { PaymentEntity } from '../db/entities/payment.entity';
import { DueEntity } from '../db/entities/due.entity';

import { AssociateDto } from '../modules/associates/associate.dto';
import { DueDto } from '../modules/dues/due.dto';
import { PaymentDto, PaymentTypeEnum } from '../modules/payments/payment.dto';
import { UserDto } from '../modules/users/user.dto';

// Valid Brazilian CPFs used across tests
const CPF_1 = '52998224725'; // First associate
const CPF_2 = '11144477735'; // Second associate
const CPF_3 = '98765432100'; // Third CPF for conflict tests

const BASE_ADDRESS = {
  zipCode: '01310100',
  streetName: 'Avenida Paulista',
  streetNumber: '1000',
  addressComplement: 'Apto 42',
  city: 'São Paulo',
  state: 'SP',
  country: 'BR',
};

function buildAssociateDto(
  overrides: Partial<AssociateDto> & { organizationId: string },
): AssociateDto {
  return {
    organizationId: overrides.organizationId,
    associationRecord: overrides.associationRecord ?? '100',
    cpf: overrides.cpf ?? CPF_1,
    name: overrides.name ?? 'João da Silva',
    phoneNumber: overrides.phoneNumber ?? '+5511999990001',
    emergencyPhoneNumber: overrides.emergencyPhoneNumber ?? '+5511999990002',
    email: overrides.email ?? 'joao@test.com',
    address: overrides.address ?? BASE_ADDRESS,
    type: overrides.type ?? 'CONTRIBUTING',
    category: overrides.category ?? 'INDIVIDUAL',
    paymentPlan: overrides.paymentPlan ?? 'MONTHLY',
    bloodType: overrides.bloodType ?? 'O_POS',
    birthDate: overrides.birthDate ?? (new Date('1985-06-15') as any),
    associationDate:
      overrides.associationDate ?? (new Date('2020-01-10') as any),
    fepamRegistrationNumber: overrides.fepamRegistrationNumber ?? 'FEPAM-001',
    fepamDueDate: overrides.fepamDueDate ?? (new Date('2026-12-31') as any),
    createdAt: undefined as any,
    updatedAt: undefined as any,
  };
}

function buildDueDto(
  overrides: Partial<DueDto> & { organizationId: string },
): DueDto {
  return {
    organizationId: overrides.organizationId,
    associateId: overrides.associateId,
    dueDate: overrides.dueDate ?? '2026-05-01T00:00:00.000Z',
    description: overrides.description ?? 'Test due',
    amount: overrides.amount ?? '100.00',
    type: overrides.type ?? 'MEMBERSHIP_FEE',
    paymentPlan: overrides.paymentPlan ?? 'MONTHLY',
    createdAt: undefined as any,
    updatedAt: undefined as any,
  };
}

function buildPaymentDto(
  overrides: Partial<PaymentDto> & { organizationId: string },
): PaymentDto {
  return {
    organizationId: overrides.organizationId,
    associateId: overrides.associateId,
    dueId: overrides.dueId,
    effectiveDate: overrides.effectiveDate ?? '2026-04-10T00:00:00.000Z',
    dueDate: overrides.dueDate ?? '2026-04-30T00:00:00.000Z',
    description: overrides.description ?? 'Test payment',
    amount: overrides.amount ?? '100.00',
    type: overrides.type ?? 'COURSE',
    createdAt: undefined as any,
    updatedAt: undefined as any,
  };
}

function buildUserDto(overrides: Partial<UserDto>): UserDto {
  return {
    id: undefined as any,
    username: overrides.username ?? 'testuser',
    email: overrides.email ?? 'test@example.com',
    password: overrides.password ?? 'password123',
    organizationId: overrides.organizationId,
  };
}

describe('Integration Tests (SQLite)', () => {
  let module: TestingModule;
  let organizationsService: OrganizationsService;
  let associatesService: AssociatesService;
  let paymentsService: PaymentsService;
  let duesService: DuesService;
  let usersService: UsersService;

  let orgId: string;
  let associate1Id: string;
  let associate2Id: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [
            OrganizationEntity,
            UserEntity,
            AssociateEntity,
            PaymentEntity,
            DueEntity,
          ],
          // synchronize is off: `timestamp` type is not recognized by
          // better-sqlite3's TypeORM validator. Schema is created manually below.
          synchronize: false,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          OrganizationEntity,
          UserEntity,
          AssociateEntity,
          PaymentEntity,
          DueEntity,
        ]),
      ],
      providers: [
        OrganizationsService,
        UsersService,
        AssociatesService,
        DuesService,
        PaymentsService,
      ],
    }).compile();

    organizationsService = module.get(OrganizationsService);
    associatesService = module.get(AssociatesService);
    paymentsService = module.get(PaymentsService);
    duesService = module.get(DuesService);
    usersService = module.get(UsersService);

    // Manually create SQLite-compatible schema.
    // We use `synchronize: false` and issue raw DDL here because TypeORM's
    // entity definitions use `timestamp` / `timestamptz` (PostgreSQL types)
    // which are rejected by the better-sqlite3 schema sync. The validator
    // patch above allows the module to compile; the actual table DDL below
    // uses SQLite-native types (TEXT / DATETIME / REAL).
    const { DataSource } = await import('typeorm');
    const rawDs = module.get(DataSource);

    await rawDs.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id                TEXT PRIMARY KEY,
        organization_name TEXT NOT NULL,
        created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await rawDs.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id              TEXT PRIMARY KEY,
        username        TEXT NOT NULL,
        email           TEXT NOT NULL UNIQUE,
        password_hash   TEXT NOT NULL,
        organization_id TEXT,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // NOTE: Most associate columns are nullable in production because they were
    // added via ALTER TABLE ... ADD COLUMN (which is nullable by default in PG).
    // Only the columns from the original CREATE TABLE are NOT NULL.
    await rawDs.query(`
      CREATE TABLE IF NOT EXISTS associates (
        id                        TEXT PRIMARY KEY,
        association_record        TEXT NOT NULL,
        name                      TEXT NOT NULL,
        cpf                       TEXT,
        phone_number              TEXT,
        emergency_phone_number    TEXT,
        email                     TEXT,
        zip_code                  TEXT,
        street_name               TEXT,
        street_number             TEXT,
        address_complement        TEXT,
        city                      TEXT,
        state                     TEXT,
        country                   TEXT,
        type                      TEXT,
        category                  TEXT,
        payment_plan              TEXT,
        blood_type                TEXT,
        birth_date                TEXT,
        association_date          TEXT,
        fepam_registration_number TEXT,
        fepam_due_date            TEXT,
        created_at                DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at                DATETIME DEFAULT CURRENT_TIMESTAMP,
        organization_id           TEXT REFERENCES organizations(id) ON DELETE SET NULL
      )
    `);
    await rawDs.query(`
      CREATE TABLE IF NOT EXISTS dues (
        id              TEXT PRIMARY KEY,
        due_date        TEXT NOT NULL,
        description     TEXT NOT NULL,
        amount          REAL NOT NULL,
        type            TEXT NOT NULL,
        payment_plan    TEXT NOT NULL,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        associate_id    TEXT REFERENCES associates(id) ON DELETE SET NULL,
        organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL
      )
    `);
    await rawDs.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id              TEXT PRIMARY KEY,
        effective_date  TEXT,
        due_date        TEXT NOT NULL,
        description     TEXT NOT NULL,
        amount          REAL NOT NULL,
        type            TEXT NOT NULL,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        associate_id    TEXT REFERENCES associates(id) ON DELETE SET NULL,
        due_id          TEXT REFERENCES dues(id) ON DELETE SET NULL,
        organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL
      )
    `);

    // Create the organization used across tests
    const org = await organizationsService.create({
      organization_name: 'Cerro Plata Test Org',
    } as OrganizationEntity);
    orgId = org.id;
  }, 30000);

  afterAll(async () => {
    await module.close();
  });

  // ---------------------------------------------------------------------------
  // Organizations & Users
  // ---------------------------------------------------------------------------

  describe('Organizations', () => {
    it('should create an organization', async () => {
      const org = await organizationsService.create({
        organization_name: 'Secondary Org',
      } as OrganizationEntity);

      expect(org).toBeDefined();
      expect(org.id).toBeDefined();
      expect(org.organization_name).toBe('Secondary Org');
    });

    it('should find organization by id', async () => {
      const found =
        await organizationsService.findOrganizationByIdOrFail(orgId);
      expect(found.id).toBe(orgId);
      expect(found.organization_name).toBe('Cerro Plata Test Org');
    });

    it('should throw when organization not found', async () => {
      await expect(
        organizationsService.findOrganizationByIdOrFail(
          '00000000-0000-0000-0000-000000000000',
        ),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('Users', () => {
    it('should create a user', async () => {
      const user = await usersService.create(
        buildUserDto({
          username: 'testuser',
          email: 'test@example.com',
          organizationId: orgId,
        }),
      );

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
    });

    it('should throw ConflictException when creating duplicate user', async () => {
      await expect(
        usersService.create(
          buildUserDto({
            username: 'testuser',
            email: 'test@example.com',
            organizationId: orgId,
          }),
        ),
      ).rejects.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // Associates
  // ---------------------------------------------------------------------------

  describe('Associates', () => {
    it('should create first associate', async () => {
      const dto = buildAssociateDto({
        organizationId: orgId,
        associationRecord: '100',
        cpf: CPF_1,
        name: 'Maria Oliveira',
        email: 'maria@test.com',
      });

      const result = await associatesService.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.cpf).toBe(CPF_1);
      expect(result.name).toBe('Maria Oliveira');
      expect(result.associationRecord).toBe('100');
      expect(result.organizationId).toBe(orgId);

      associate1Id = result.id!;
    });

    it('should create second associate with different CPF and associationRecord', async () => {
      const dto = buildAssociateDto({
        organizationId: orgId,
        associationRecord: '101',
        cpf: CPF_2,
        name: 'Carlos Pereira',
        email: 'carlos@test.com',
        type: 'FOUNDER',
      });

      const result = await associatesService.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.cpf).toBe(CPF_2);
      expect(result.name).toBe('Carlos Pereira');
      expect(result.associationRecord).toBe('101');

      associate2Id = result.id!;
    });

    it('should fail when creating associate with duplicate CPF', async () => {
      const dto = buildAssociateDto({
        organizationId: orgId,
        associationRecord: '102',
        cpf: CPF_1, // same as associate 1
        name: 'Another Person',
        email: 'another@test.com',
      });

      await expect(associatesService.create(dto)).rejects.toThrow(
        HttpException,
      );

      await expect(associatesService.create(dto)).rejects.toMatchObject({
        message: expect.stringContaining('already exists'),
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should fail when creating associate with duplicate associationRecord', async () => {
      const dto = buildAssociateDto({
        organizationId: orgId,
        associationRecord: '100', // same as associate 1
        cpf: CPF_3,
        name: 'Different Person',
        email: 'different@test.com',
      });

      await expect(associatesService.create(dto)).rejects.toThrow(
        HttpException,
      );

      await expect(associatesService.create(dto)).rejects.toMatchObject({
        message: expect.stringContaining('already exists'),
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should fail when creating associate with invalid CPF', async () => {
      const dto = buildAssociateDto({
        organizationId: orgId,
        associationRecord: '103',
        cpf: '12345678900', // invalid CPF
        name: 'Invalid CPF Person',
        email: 'invalidcpf@test.com',
      });

      await expect(associatesService.create(dto)).rejects.toThrow(
        HttpException,
      );

      await expect(associatesService.create(dto)).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });

    describe('Query Associates by different criteria', () => {
      it('should return all associates for the organization with default pagination', async () => {
        const result = await associatesService.findAll(orgId, {});

        expect(result.items).toBeDefined();
        expect(result.total).toBeGreaterThanOrEqual(2);
        expect(result.items.every((a) => a.organizationId === orgId)).toBe(
          true,
        );
      });

      it('should filter associates by type FOUNDER', async () => {
        const result = await associatesService.findAll(orgId, {
          type: 'FOUNDER',
        });

        expect(result.items.length).toBeGreaterThanOrEqual(1);
        expect(result.items.every((a) => a.type === 'FOUNDER')).toBe(true);
      });

      it('should filter associates by associationRecord', async () => {
        const result = await associatesService.findAll(orgId, {
          associationrecord: '100',
        });

        expect(result.items.length).toBe(1);
        expect(result.items[0].associationRecord).toBe('100');
        expect(result.items[0].cpf).toBe(CPF_1);
      });

      it('should return empty when filtering by non-existent associationRecord', async () => {
        const result = await associatesService.findAll(orgId, {
          associationrecord: '999',
        });

        expect(result.items.length).toBe(0);
        expect(result.total).toBe(0);
      });

      it('should respect pagination limit', async () => {
        const result = await associatesService.findAll(orgId, {
          limit: 1,
          page: 1,
        });

        expect(result.items.length).toBe(1);
        expect(result.total).toBeGreaterThanOrEqual(2);
      });

      it('should sort associates by associationRecord ASC', async () => {
        const result = await associatesService.findAll(orgId, {
          sortBy: 'associationRecord',
          sortOrder: 'ASC',
        });

        expect(result.items.length).toBeGreaterThanOrEqual(2);
        const records = result.items.map((a) => a.associationRecord);
        const sorted = [...records].sort();
        expect(records).toEqual(sorted);
      });

      it('should find associate by id and organization', async () => {
        const found = await associatesService.findByIdAndOrganization(
          orgId,
          associate1Id,
        );

        expect(found).toBeDefined();
        expect(found!.id).toBe(associate1Id);
        expect(found!.cpf).toBe(CPF_1);
      });

      it('should throw NOT_FOUND when associate id does not belong to organization', async () => {
        await expect(
          associatesService.findByIdAndOrganization(
            orgId,
            '00000000-0000-0000-0000-000000000000',
          ),
        ).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
      });
    });

    describe('Update Associates', () => {
      it('should update an associate successfully', async () => {
        const updated = await associatesService.update(associate1Id, {
          name: 'Maria Oliveira Updated',
        });

        expect(updated.name).toBe('Maria Oliveira Updated');
        expect(updated.cpf).toBe(CPF_1);
      });

      it('should fail when updating associate with a CPF that already belongs to another associate', async () => {
        // Try to set associate1's CPF to associate2's CPF
        await expect(
          associatesService.update(associate1Id, { cpf: CPF_2 }),
        ).rejects.toThrow(HttpException);

        await expect(
          associatesService.update(associate1Id, { cpf: CPF_2 }),
        ).rejects.toMatchObject({
          message: expect.stringContaining('already exists'),
          status: HttpStatus.BAD_REQUEST,
        });
      });

      it('should fail when updating associate with an associationRecord that already belongs to another associate', async () => {
        // Try to set associate1's associationRecord to associate2's associationRecord
        await expect(
          associatesService.update(associate1Id, { associationRecord: '101' }),
        ).rejects.toThrow(HttpException);

        await expect(
          associatesService.update(associate1Id, { associationRecord: '101' }),
        ).rejects.toMatchObject({
          message: expect.stringContaining('already exists'),
          status: HttpStatus.BAD_REQUEST,
        });
      });

      it('should fail when updating a non-existent associate', async () => {
        await expect(
          associatesService.update('00000000-0000-0000-0000-000000000000', {
            name: 'Ghost',
          }),
        ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Dues
  // ---------------------------------------------------------------------------

  describe('Dues', () => {
    let dueId: string;

    it('should create a Due for an associate', async () => {
      const due = await duesService.create(
        buildDueDto({
          organizationId: orgId,
          associateId: associate1Id,
          dueDate: '2026-05-01T00:00:00.000Z',
          description: 'Monthly membership fee',
          amount: '150.00',
          type: 'MEMBERSHIP_FEE',
        }),
      );

      expect(due).toBeDefined();
      expect(due.id).toBeDefined();
      expect(due.associateId).toBe(associate1Id);
      expect(due.organizationId).toBe(orgId);
      expect(due.amount).toBe('150.00');

      dueId = due.id!;
    });

    it('should create a Due without an associate (COURSE type)', async () => {
      const due = await duesService.create(
        buildDueDto({
          organizationId: orgId,
          dueDate: '2026-06-01T00:00:00.000Z',
          description: 'Course fee',
          amount: '200.00',
          type: 'COURSE',
        }),
      );

      expect(due).toBeDefined();
      expect(due.id).toBeDefined();
      expect(due.associateId).toBeUndefined();
    });

    it('should fail creating a MEMBERSHIP_FEE Due without an associateId', async () => {
      await expect(
        duesService.create(
          buildDueDto({
            organizationId: orgId,
            dueDate: '2026-07-01T00:00:00.000Z',
            description: 'Membership due without associate',
            amount: '100.00',
            type: 'MEMBERSHIP_FEE',
          }),
        ),
      ).rejects.toThrow(HttpException);
    });

    it('should list all dues for an organization', async () => {
      const result = await duesService.findAll(orgId, {});
      expect(result.total).toBeGreaterThanOrEqual(1);
    });
  });

  // ---------------------------------------------------------------------------
  // Payments
  // ---------------------------------------------------------------------------

  describe('Payments', () => {
    let dueForPaymentId: string;

    beforeAll(async () => {
      // Create a fresh due specifically for payment tests
      const due = await duesService.create(
        buildDueDto({
          organizationId: orgId,
          associateId: associate2Id,
          dueDate: '2026-08-01T00:00:00.000Z',
          description: 'Due for payment tests',
          amount: '120.00',
          type: 'MEMBERSHIP_FEE',
        }),
      );
      dueForPaymentId = due.id!;
    });

    it('should create a Payment for a COURSE without a Due', async () => {
      const payment = await paymentsService.create(
        buildPaymentDto({
          organizationId: orgId,
          associateId: associate1Id,
          description: 'Course payment',
          amount: '50.00',
          type: 'COURSE',
        }),
      );

      expect(payment).toBeDefined();
      expect(payment.id).toBeDefined();
      expect(payment.type).toBe(PaymentTypeEnum.COURSE);
      expect(payment.dueId).toBeUndefined();
    });

    it('should fail creating MEMBERSHIP_FEE Payment without a Due', async () => {
      const noduePmt = buildPaymentDto({
        organizationId: orgId,
        associateId: associate1Id,
        description: 'Membership payment without due',
        amount: '150.00',
        type: 'MEMBERSHIP_FEE',
        // dueId intentionally omitted
      });

      await expect(paymentsService.create(noduePmt)).rejects.toThrow(
        HttpException,
      );

      await expect(paymentsService.create(noduePmt)).rejects.toMatchObject({
        message: expect.stringContaining('dueId'),
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should fail creating MEMBERSHIP_FEE Payment without an Associate', async () => {
      const noAssocPmt = buildPaymentDto({
        organizationId: orgId,
        // associateId intentionally omitted
        dueId: dueForPaymentId,
        description: 'Membership payment without associate',
        amount: '120.00',
        type: 'MEMBERSHIP_FEE',
      });

      await expect(paymentsService.create(noAssocPmt)).rejects.toThrow(
        HttpException,
      );

      await expect(paymentsService.create(noAssocPmt)).rejects.toMatchObject({
        message: expect.stringContaining('associateId'),
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should fail creating a Payment with a non-existent Associate', async () => {
      const ghostPmt = buildPaymentDto({
        organizationId: orgId,
        associateId: '00000000-0000-0000-0000-000000000000',
        description: 'Payment with ghost associate',
        amount: '50.00',
        type: 'COURSE',
      });

      await expect(paymentsService.create(ghostPmt)).rejects.toThrow(
        HttpException,
      );

      await expect(paymentsService.create(ghostPmt)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should create a valid MEMBERSHIP_FEE Payment linked to a Due', async () => {
      const payment = await paymentsService.create(
        buildPaymentDto({
          organizationId: orgId,
          associateId: associate2Id,
          dueId: dueForPaymentId,
          dueDate: '2026-08-01T00:00:00.000Z',
          description: 'Membership payment',
          amount: '120.00',
          type: 'MEMBERSHIP_FEE',
        }),
      );

      expect(payment).toBeDefined();
      expect(payment.id).toBeDefined();
      expect(payment.dueId).toBe(dueForPaymentId);
      expect(payment.associateId).toBe(associate2Id);
      expect(payment.amount).toBe('120.00');
    });

    it('should fail when creating a Payment for a Due that has already been paid', async () => {
      // dueForPaymentId was already paid in the previous test
      const dupePmt = buildPaymentDto({
        organizationId: orgId,
        associateId: associate2Id,
        dueId: dueForPaymentId,
        effectiveDate: '2026-04-15T00:00:00.000Z',
        dueDate: '2026-08-01T00:00:00.000Z',
        description: 'Duplicate membership payment',
        amount: '120.00',
        type: 'MEMBERSHIP_FEE',
      });

      await expect(paymentsService.create(dupePmt)).rejects.toThrow(
        HttpException,
      );

      await expect(paymentsService.create(dupePmt)).rejects.toMatchObject({
        message: expect.stringContaining('already associated'),
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should list payments for the organization', async () => {
      const result = await paymentsService.findAll(orgId, {});
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.items.every((p) => p.organizationId === orgId)).toBe(true);
    });

    it('should list payments by associate', async () => {
      const result = await paymentsService.findByAssociateAndOrganization(
        orgId,
        associate2Id,
        {},
      );
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.items.every((p) => p.associateId === associate2Id)).toBe(
        true,
      );
    });
  });
});
