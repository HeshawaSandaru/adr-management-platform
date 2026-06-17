import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';

async function bootstrap() {
  const app =
    await NestFactory.create(AppModule);



  // Global API prefix
  app.setGlobalPrefix('api');

  // ✅ Validation (VERY IMPORTANT)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('ADR Management Platform')
    .setDescription(
      'Architecture Decision Record APIs',
    )
    .setVersion('1.0')
    .build();

  const document =
    SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(
    'api/docs',
    app,
    document,
  );

  // Config service (port)
  const configService =
    app.get(ConfigService);

  const port =
    configService.get<number>('PORT') ?? 3000;

  await app.listen(port);

  console.log(
    `Server running on http://localhost:${port}`,
  );
}

bootstrap();