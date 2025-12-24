import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../modules/users/users.service';
import { AuthResponseDto } from './auth.dto';
import { compareSync as bcryptCompareSync, hash as bcryptHash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from '../db/entities/refresh-token.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private jwtExpirationTimeInSeconds: number;
  private refreshTokenExpirationTimeInMs: number;

  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  private readonly accessTokenExpirySeconds =
    Number(this.configService.get('JWT_EXPIRATION_TIME')) || 15 * 60;

  private readonly refreshTokenExpiryMs =
    Number(this.configService.get('REFRESH_TOKEN_EXPIRATION_TIME')) ||
    7 * 24 * 60 * 60 * 1000; // 7 days
  async signIn(email: string, password: string): Promise<AuthResponseDto> {
    const foundUser = await this.userService.findByEmail(email);

    if (!foundUser || !bcryptCompareSync(password, foundUser.password)) {
      throw new UnauthorizedException();
    }

    const payload = { sub: foundUser.id, username: foundUser.username };

    const token = this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpirySeconds, // número = segundos
    });
    // create refresh token (store hashed and return plaintext as id.plain)
    const plaintext = randomBytes(64).toString('hex');
    const tokenHash = await new Promise<string>((res, rej) =>
      bcryptHash(plaintext, 10, (err, hash) => (err ? rej(err) : res(hash))),
    );

    const expiresAt = new Date(Date.now() + this.refreshTokenExpiryMs);

    const refreshEntity = this.refreshTokenRepository.create({
      tokenHash,
      expiresAt,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user: { id: foundUser.id } as any,
    });

    const saved = await this.refreshTokenRepository.save(refreshEntity);

    const refreshToken = `${saved.id}.${plaintext}`;

    return {
      token,
      expiresIn: 15 * 60, // 15 minutes in seconds
      user: foundUser.username,
      refreshToken,
      refreshExpiresIn: Math.floor(this.refreshTokenExpiryMs / 1000),
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    token: string;
    expiresIn: number;
    refreshToken?: string;
    refreshExpiresIn?: number;
  }> {
    if (!refreshToken) throw new BadRequestException('refreshToken required');

    const [id, plaintext] = refreshToken.split('.');
    if (!id || !plaintext)
      throw new BadRequestException('invalid refresh token format');

    const stored = await this.refreshTokenRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!stored) throw new UnauthorizedException();
    if (stored.expiresAt < new Date()) {
      await this.refreshTokenRepository.remove(stored);
      throw new UnauthorizedException();
    }

    const valid = await new Promise<boolean>((res) =>
      bcryptCompareSync(plaintext, stored.tokenHash) ? res(true) : res(false),
    );

    if (!valid) {
      await this.refreshTokenRepository.remove(stored);
      throw new UnauthorizedException();
    }

    // rotate: remove old token and create a new one
    await this.refreshTokenRepository.remove(stored);

    const newPlain = randomBytes(64).toString('hex');
    const newHash = await new Promise<string>((res, rej) =>
      bcryptHash(newPlain, 10, (err, hash) => (err ? rej(err) : res(hash))),
    );
    const newExpiresAt = new Date(Date.now() + this.refreshTokenExpiryMs);

    const newEntity = this.refreshTokenRepository.create({
      tokenHash: newHash,
      expiresAt: newExpiresAt,
      user: stored.user,
    });
    const saved = await this.refreshTokenRepository.save(newEntity);

    const payload = { sub: stored.user.id, username: stored.user.username };
    const token = this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpirySeconds,
    });

    return {
      token,
      expiresIn: 15 * 60,
      refreshToken: `${saved.id}.${newPlain}`,
      refreshExpiresIn: Math.floor(this.refreshTokenExpiryMs / 1000),
    };
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    if (!refreshToken) return;
    const [id] = refreshToken.split('.');
    if (!id) return;
    const stored = await this.refreshTokenRepository.findOne({ where: { id } });
    if (stored) await this.refreshTokenRepository.remove(stored);
  }
}
