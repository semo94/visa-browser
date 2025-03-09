import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { ProductsModule } from './modules/products/products.module';
import { LoggerModule } from './common/modules/logger.module';
import { RequestIdMiddleware } from './common/middlewares/request-id.middleware';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    TypeOrmModule.forRoot(databaseConfig),
    LoggerModule,
    ProductsModule,
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, LoggerMiddleware)
      .forRoutes('*');
  }
}