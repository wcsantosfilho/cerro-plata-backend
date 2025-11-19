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
    const emailAlreadyRegistered = await this.findByEmail(newUser.email);

    if (userAlreadyRegistered || emailAlreadyRegistered) {
      throw new ConflictException(
        `User '${newUser.username}, ${newUser.email}' already registered.`,
      );
    }

    const dbUser = new UserEntity();
    dbUser.username = newUser.username;
    dbUser.email = newUser.email;
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
      email: userFound?.email,
      username: userFound?.username,
      password: userFound?.passwordHash,
    };
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    const userFound = await this.usersRepository.findOne({
      where: { email },
    });

    if (!userFound) {
      return null;
    }

    return {
      id: userFound?.id,
      email: userFound?.email,
      username: userFound?.username,
      password: userFound?.passwordHash,
    };
  }

  private mapEntityToDto(userEntity: UserEntity): Partial<UserDto> {
    return {
      id: userEntity.id,
      username: userEntity.username,
      email: userEntity.email,
    };
  }
}
