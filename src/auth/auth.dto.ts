export class AuthResponseDto {
  token: string; // access token
  expiresIn: number; // access token seconds
  user: string;
  refreshToken?: string; // plaintext refresh token
  refreshExpiresIn?: number; // seconds until refresh expires
}
