import { AppModule } from '../dist/app.module';
import { NestFactory } from '@nestjs/core';

let cachedApp;

async function bootstrapServer() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);
    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp;
}

module.exports = async (req, res) => {
  const app = await bootstrapServer();
  return app(req, res);
};
