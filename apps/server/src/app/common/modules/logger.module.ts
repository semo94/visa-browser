import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { LoggerService } from '../services/logger.service';
import { winstonConfig } from '../../config/logger.config';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig)
  ],
  providers: [LoggerService],
  exports: [LoggerService, WinstonModule],
})
export class LoggerModule { }