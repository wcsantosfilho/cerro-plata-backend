/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

let cachedApp: any;

/**
 * Initializes the NestJS app only once (cold start),
 * and reuses it across invocations (warm start).
 */
async function bootstrapServer() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp;
}

/**
 * Vercel handler (req, res)
 */
export default async function handler(req: any, res: any) {
  const app = await bootstrapServer();
  return app(req, res);
}
