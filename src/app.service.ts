import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getMain(): string {
    return '/';
  }

  getHealth(): string {
    return `I'm healthy. Are you?`;
  }
}
