import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuditInterceptor } from './audit-log/audit.interceptor';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  console.log(`Running certo-plata-backend on Vercel: ${process.env.NODE_ENV}`);
  const app = await NestFactory.create(AppModule);
  console.log(`FRONT: ${process.env.FRONTEND_ORIGIN}`);

  // Use a single global prefix so Swagger assets and endpoints
  // are registered under the same /api path when deployed to Vercel.
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalInterceptors(app.get(AuditInterceptor));

  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:8080',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Accept',
    credentials: true,
  });

  // parse cookies so we can read `req.cookies.refreshToken` in controllers

  app.use(cookieParser() as any);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Cerro Plata Backend API')
    .setDescription('API documentation for Cerro Plata Backend')
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
  // Register Swagger UI under /api/api-docs (consistent with globalPrefix)
  SwaggerModule.setup(`${globalPrefix}/api-docs`, app, swaggerDocument);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
