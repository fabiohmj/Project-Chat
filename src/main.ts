import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(3000);
}
bootstrap();
