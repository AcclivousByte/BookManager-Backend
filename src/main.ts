import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ResourceNotFoundExceptionFilter } from './utils/exceptions/resourceNotFound/resourceNotFound-exception.filter';
import { ResponseTransformInterceptor } from './utils/interceptors/responseTransform.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.use(helmet());

  // Global FIlters
  app.useGlobalFilters(new ResourceNotFoundExceptionFilter());

  // Global Interceptors
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      whitelist: true,
    }),
  );

  await app.listen(3000);
}

bootstrap();
