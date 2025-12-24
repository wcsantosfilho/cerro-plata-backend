import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
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
  ): Promise<AuthResponseDto> {
    return await this.authService.signIn(email, password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string): Promise<{
    token: string;
    expiresIn: number;
    refreshToken?: string;
    refreshExpiresIn?: number;
  }> {
    return await this.authService.refreshToken(refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string): Promise<void> {
    await this.authService.revokeRefreshToken(refreshToken);
  }
}
