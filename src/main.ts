import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  console.log(`Running certo-plata-backend on Vercel: ${process.env.NODE_ENV}`);
  const app = await NestFactory.create(AppModule);
  console.log(`FRONT: ${process.env.FRONTEND_ORIGIN}`);
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:8080',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Accept',
    credentials: true,
  });

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
  SwaggerModule.setup('api-docs', app, swaggerDocument);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
