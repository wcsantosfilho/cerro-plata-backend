import { ConflictException, Injectable } from '@nestjs/common';
import { UserDto } from './user.dto';
import { hashSync as bcryptHashSync } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../db/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(newUser: UserDto): Promise<Partial<UserDto>> {
    const userAlreadyRegistered = await this.findByUserName(newUser.username);

    if (userAlreadyRegistered) {
      throw new ConflictException(
        `User '${newUser.username}' already registered.`,
      );
    }

    const dbUser = new UserEntity();
    dbUser.username = newUser.username;
    dbUser.passwordHash = bcryptHashSync(newUser.password, 10);
    const createdUser = await this.usersRepository.save(dbUser);

    return this.mapEntityToDto(createdUser);
  }

  async findByUserName(username: string): Promise<UserDto | null> {
    const userFound = await this.usersRepository.findOne({
      where: { username },
    });

    if (!userFound) {
      return null;
    }

    return {
      id: userFound?.id,
      username: userFound?.username,
      password: userFound?.passwordHash,
    };
  }

  private mapEntityToDto(userEntity: UserEntity): Partial<UserDto> {
    return {
      id: userEntity.id,
      username: userEntity.username,
    };
  }
}
