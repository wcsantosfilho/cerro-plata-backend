import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getMain(): string {
    return '/';
  }

  getHello(): string {
    return 'Hello World!';
  }

  getHealth(): string {
    return `I'm healthy. Are you?`;
  }
}
