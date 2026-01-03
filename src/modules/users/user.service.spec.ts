import { UserDto } from './user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  const createUserDto: Partial<UserDto> = {
    username: 'lalai',
    email: 'lalai@example.com',
    password: '987654321',
  };

  beforeEach(() => {
    mockRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    service = new UsersService(mockRepo as any);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('should create an user successfully', async () => {
    const saved = {
      id: '0d33af20-ded0-4e7c-b6bf-8879d480adc0',
      ...createUserDto,
    };

    mockRepo.save.mockResolvedValue(saved);
    const result = await service.create(createUserDto as UserDto);
    expect(result).toEqual(
      expect.objectContaining({
        id: '0d33af20-ded0-4e7c-b6bf-8879d480adc0',
        username: 'lalai',
        email: 'lalai@example.com',
      }),
    );
    expect(result).toHaveProperty('id');
    expect(result.username).toBe('lalai');
  });
});
