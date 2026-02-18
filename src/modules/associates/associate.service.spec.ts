/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// Dismiss: "We recommend installing an extension to run jest tests."
import { HttpException } from '@nestjs/common';
import { AssociateEntity } from '../../db/entities/associate.entity';
import { AssociatesService } from '../associates/associates.service';
import { AssociateDto } from './associate.dto';
import { FoundersAssociatesList, AssociatesList } from './associate.mock';

describe('AssociatesService', () => {
  let service: AssociatesService;
  let mockRepo: {
    findOne: jest.Mock;
    findAll: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
    query: jest.Mock;
    orderBy: jest.Mock;
  };

  const createDto = {
    associationRecord: '138',
    organizationId: '0668342c-0e50-4dee-a022-899e5fb0b1f1',
    name: 'Gustavo Williamson',
    phoneNumber: '+5541987601925',
    address: {
      zipCode: '01310670',
      streetName: '224 Zachary Spurs',
      streetNumber: '919',
      addressComplement: 'Apt 582',
      city: 'Logan',
      state: 'PR',
      country: 'BR',
    },
    type: 'REGULAR',
  };

  beforeEach(() => {
    mockRepo = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
      query: jest.fn(),
      orderBy: jest.fn().mockReturnThis(),
    };
    service = new AssociatesService(mockRepo as any);
  });

  it('should create an associate successfully', async () => {
    const saved = {
      id: '0d33af20-ded0-4e7c-b6bf-8879d480adc0',
      ...createDto,
      createdAt: new Date(),
    };
    mockRepo.save.mockResolvedValue(saved);
    const result = await service.create(createDto as any);
    expect(result).toEqual(
      expect.objectContaining({
        associationRecord: '138',
        name: 'Gustavo Williamson',
        phoneNumber: '+5541987601925',
        type: 'REGULAR',
      }),
    );
    expect(result).toEqual(saved);
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Gustavo Williamson');
  });

  it('should avoid duplication in association Record', async () => {
    const existingAssociate = {
      id: '2d43bf20-ded0-4e7c-b6bf-8879d480adc0',
      ...createDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 1. MOCK: Force findOne to return a record (simulating it was found)
    mockRepo.findOne.mockResolvedValue(existingAssociate as AssociateEntity);

    const createSecondDto = {
      associationRecord: '138',
      name: 'Norberto de Souza Aguiar',
      phoneNumber: '+551130251010',
      address: {
        zipCode: '01001000',
        streetName: 'Praça da Sé',
        streetNumber: '500',
        addressComplement: 'Loja 18',
        city: 'São Paulo',
        state: 'SP',
        country: 'BR',
      },
      type: 'FOUNDER',
    };

    await expect(
      service.create(createSecondDto as AssociateDto),
    ).rejects.toThrow(HttpException);

    // 2. ASSERT: Ensure the error message is correct
    const expectedErrorMessage =
      'Associate with associationRecord: 138 already exists';
    await expect(
      service.create(createSecondDto as AssociateDto),
    ).rejects.toThrow(expectedErrorMessage);
  });

  it('should filter associates without args', async () => {
    const mockQuery = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getManyAndCount: jest
        .fn()
        .mockResolvedValue([AssociatesList.items, AssociatesList.total]),
    } as any;

    mockRepo.createQueryBuilder.mockReturnValue(mockQuery);

    const result = await service.findAll({}); // No filters applied

    expect(mockRepo.createQueryBuilder).toHaveBeenCalledWith('associate');
    expect(mockQuery.orderBy).toHaveBeenCalledWith(
      'associate.createdAt',
      'DESC',
    );
    expect(result).toEqual({
      items: AssociatesList.items.map((e) => ({
        id: e.id,
        associationRecord: e.associationRecord,
        name: e.name,
        phoneNumber: e.phoneNumber,
        address: e.address,
        type: e.type,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
      total: 26,
    });
  });

  it('should filter associates by type = FOUNDER and order by NAME ASC', async () => {
    const mockQuery = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getManyAndCount: jest
        .fn()
        .mockResolvedValue([
          FoundersAssociatesList.items,
          FoundersAssociatesList.total,
        ]),
    } as any;

    mockRepo.createQueryBuilder.mockReturnValue(mockQuery);
    // Mock repository metadata so sorting field validation passes
    (mockRepo as any).metadata = {
      columns: [{ propertyName: 'name' }, { propertyName: 'createdAt' }],
    } as any;

    const result = await service.findAll({
      type: 'FOUNDER',
      sortBy: 'name',
      sortOrder: 'ASC',
    });

    expect(mockRepo.createQueryBuilder).toHaveBeenCalledWith('associate');
    expect(mockQuery.andWhere).toHaveBeenCalledWith('associate.type = :type', {
      type: 'FOUNDER',
    });
    expect(mockQuery.orderBy).toHaveBeenCalledWith('associate.name', 'ASC');
    expect(result).toEqual({
      items: FoundersAssociatesList.items.map((e) => ({
        id: e.id,
        associationRecord: e.associationRecord,
        name: e.name,
        phoneNumber: e.phoneNumber,
        address: e.address,
        type: e.type,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
      total: FoundersAssociatesList.total,
    });
    expect(result.items.length).toBe(2);
  });
});
