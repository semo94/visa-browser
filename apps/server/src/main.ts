import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './app/common/filters/http-exception.filter';
import { DatabaseExceptionFilter } from './app/common/filters/database-exception.filter';
import { ResponseInterceptor } from './app/common/interceptors/response.interceptor';
import { createValidationPipe } from './app/common/factories/validation-pipe.factory';
import { LoggerService } from './app/common/services/logger.service';
import compression from 'compression';
import helmet from 'helmet';
import { config } from 'dotenv';

// Load environment variables
config();

async function bootstrap() {
  // Create a logger for bootstrap process
  const logger = new LoggerService(null, 'API Bootstrap');

  try {
    // Create the application
    const app = await NestFactory.create(AppModule, {
      // We still need to use Winston for the initial logger, but will use our wrapper after
      bufferLogs: true,
    });

    // Use our custom logger service
    app.useLogger(await app.resolve(LoggerService));

    // Enable CORS
    app.enableCors();

    // Set global prefix for all routes
    const apiPrefix = process.env.API_PREFIX || 'api/v1';
    app.setGlobalPrefix(apiPrefix);

    // Add security middlewares
    app.use(helmet());
    app.use(compression());

    // Add validation pipe for DTOs with custom error formatting
    app.useGlobalPipes(createValidationPipe());

    // Add global exception filters
    app.useGlobalFilters(
      new DatabaseExceptionFilter(),
      new HttpExceptionFilter(),
    );

    // Add global response interceptor
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Setup Swagger
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Sherpa Visa Products API')
      .setDescription('API for managing visa products')
      .setVersion('1.0')
      .addTag('products')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    // Start the server
    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
    logger.log(`📝 Swagger documentation: http://localhost:${port}/api/docs`);
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap();