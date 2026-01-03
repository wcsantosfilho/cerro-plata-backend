// Dismiss: "We recommend installing an extension to run jest tests."
import { ConflictException } from '@nestjs/common';
import { AssociatesService } from '../associates/associates.service';

describe('AssociatesService - create', () => {
  let service: AssociatesService;
  let mockRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  const createDto = {
    associationRecord: '138',
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
      create: jest.fn(),
      save: jest.fn(),
    };
    service = new AssociatesService(mockRepo as any);
  });

  it('should create an associate successfully', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(createDto);
    const saved = { id: 1, ...createDto, createdAt: new Date() };
    mockRepo.save.mockResolvedValue(saved);

    const result = await service.create(createDto as any);

    expect(mockRepo.findOne).toHaveBeenCalled();
    // expect(mockRepo.create).toHaveBeenCalledWith(createDto);
    // expect(mockRepo.save).toHaveBeenCalledWith(createDto);
    expect(result).toEqual(saved);
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Gustavo Williamson');
  });
});
