import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {

  console.log('MONGO_URI =', process.env.MONGO_URI);
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  app.setGlobalPrefix('api');

  await app.listen(port);

  console.log(`Server running on http://localhost:${port}`);
}

bootstrap();