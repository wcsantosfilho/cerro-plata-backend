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
    console.log(`FRONT no index.ts: ${process.env.FRONTEND_ORIGIN}`);
    app.enableCors({
      origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:8080',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Authorization, Accept',
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
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
