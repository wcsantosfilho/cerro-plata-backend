/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

let cachedApp: any;

/**
 * Initializes the NestJS app only once (cold start),
 * and reuses it across invocations (warm start).
 */
async function bootstrapServer() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);

    const allowedOrigins = ['http://localhost:8080'];
    allowedOrigins.push(process.env.FRONTEND_ORIGIN?.toString() ?? '');

    const corsOptions: CorsOptions = {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked for origin: ${origin}`), false);
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Authorization, Accept',
      credentials: true,
    };

    console.log(`FRONT no index.ts: ${process.env.FRONTEND_ORIGIN}`);
    app.enableCors(corsOptions);

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
