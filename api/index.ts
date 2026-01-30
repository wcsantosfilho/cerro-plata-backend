/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AuditInterceptor } from '../src/audit-log/audit.interceptor';

let cachedApp: any;

/**
 * Initializes the NestJS app only once (cold start),
 * and reuses it across invocations (warm start).
 */
async function bootstrapServer() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);

    // Exact origins allowed (full origin strings)
    const allowedExactOrigins: string[] = [];
    if (process.env.FRONTEND_ORIGIN_LOCAL)
      allowedExactOrigins.push(process.env.FRONTEND_ORIGIN_LOCAL.toString());
    if (process.env.FRONTEND_ORIGIN)
      allowedExactOrigins.push(process.env.FRONTEND_ORIGIN.toString());

    // Alt origins may be a comma-separated list of domain suffixes
    // e.g. "lovableproject.com,lovable.dev,lovable.app,heroku.com"
    const allowedAltDomains: string[] = (process.env.FRONTEND_ORIGIN_ALT ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const corsOptions: CorsOptions = {
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. server-to-server, curl)
        if (!origin) return callback(null, true);

        // If the full origin is explicitly allowed, accept it
        if (allowedExactOrigins.includes(origin)) return callback(null, true);

        // Otherwise validate domain suffixes from FRONTEND_ORIGIN_ALT
        try {
          const hostname = new URL(origin).hostname;
          for (const domain of allowedAltDomains) {
            if (hostname === domain || hostname.endsWith(`.${domain}`)) {
              return callback(null, true);
            }
          }
        } catch (err) {
          // If origin is not a valid URL, block it
          return callback(
            new Error(`CORS blocked for origin: ${origin} ${err}`),
            false,
          );
        }

        callback(new Error(`CORS blocked for origin: ${origin}`), false);
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Authorization, Accept',
      credentials: true,
    };
    console.log(
      `FRONT origins: exact=${allowedExactOrigins.join(',')} alt=${allowedAltDomains.join(',')}`,
    );
    app.enableCors(corsOptions);
    // parse cookies in serverless handler as done in src/main.ts
    app.use(cookieParser() as any);

    app.setGlobalPrefix('api');
    app.useGlobalInterceptors(app.get(AuditInterceptor));

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

    // Register Swagger UI under either '/api/api-docs' or '/api-docs'
    const swaggerPath = 'api-docs';
    SwaggerModule.setup(swaggerPath, app, swaggerDocument);
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
