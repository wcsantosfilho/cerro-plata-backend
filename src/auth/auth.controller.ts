import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthResponseDto } from './auth.dto';
import { AuthService } from './auth.service';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('auth')
@ApiExcludeController()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.signIn(email, password);

    // set refresh token as HttpOnly, Secure cookie via Set-Cookie header
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: result.refreshExpiresIn ?? undefined,
      path: '/',
    });

    // Do not include refresh token in response body
    delete result.refreshToken;
    delete result.refreshExpiresIn;

    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    token: string;
    expiresIn: number;
  }> {
    // read refresh token from HttpOnly cookie
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (!refreshToken) throw new BadRequestException('refreshToken required');
    const result = await this.authService.refreshToken(refreshToken);

    // rotate cookie with new refresh token
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: result.refreshExpiresIn ?? undefined,
      path: '/',
    });

    return { token: result.token, expiresIn: result.expiresIn };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Body('refreshToken') refreshTokenFromBody: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    // prefer cookie, fallback to body
    const refreshToken: string =
      (req.cookies as Record<string, string>)?.refreshToken ??
      refreshTokenFromBody;
    await this.authService.revokeRefreshToken(refreshToken);

    // clear cookie on logout
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    });
  }
}
