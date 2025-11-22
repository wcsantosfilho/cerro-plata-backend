/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let cachedApp: any;

/**
 * Initializes the NestJS app only once (cold start),
 * and reuses it across invocations (warm start).
 */
async function bootstrapServer() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);

    const allowedOrigins = [
      process.env.FRONTEND_ORIGIN_LOCAL?.toString() ?? '',
    ];
    allowedOrigins.push(process.env.FRONTEND_ORIGIN_ALT?.toString() ?? '');
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

    const swaggerConfig = new DocumentBuilder()
      .setTitle('Cerro Plata API')
      .setDescription('API documentation for Cerro Plata backend')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'access-token', // nome da referência (pode ser usado no decorator))
      )
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('/docs', app, swaggerDocument, {
      swaggerOptions: {
        url: '/docs-json',
      },
    });

    app.setGlobalPrefix('');
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
