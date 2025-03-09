import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { config } from 'dotenv';

// Load environment variables
config();

/**
 * Creates a Winston logger configuration.
 * This can be used both for the NestJS Winston module and standalone loggers.
 * 
 * @param context Optional context name to include in all logs
 * @returns Winston logger configuration
 */
export function createLoggerConfig(context?: string): WinstonModuleOptions {
  const logDir = process.env.LOG_DIR || 'logs';
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

  // Define log formats
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    isDevelopment
      ? winston.format.combine(
        winston.format.colorize(),
        nestWinstonModuleUtilities.format.nestLike('Sherpa', {
          colors: true,
          prettyPrint: true,
        }),
      )
      : winston.format.combine(
        winston.format.json(),
      ),
  );

  // Configure transports
  const transports: winston.transport[] = [
    // Always log to console
    new winston.transports.Console(),
  ];

  // Add file transports in production
  if (env !== 'development') {
    // Add application log file transport
    transports.push(
      new DailyRotateFile({
        dirname: logDir,
        filename: 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
          winston.format.uncolorize(),
          winston.format.json(),
        ),
      }),
    );

    // Add error log file transport
    transports.push(
      new DailyRotateFile({
        dirname: logDir,
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error',
        format: winston.format.combine(
          winston.format.uncolorize(),
          winston.format.json(),
        ),
      }),
    );
  }

  // Default metadata
  const defaultMeta: Record<string, unknown> = {};
  if (context) {
    defaultMeta.context = context;
  }

  // Create Winston configuration
  const winstonConfig: WinstonModuleOptions = {
    level: logLevel,
    format: logFormat,
    defaultMeta,
    transports,
    // Handle uncaught exceptions and rejections
    exceptionHandlers: [
      new winston.transports.Console(),
      new DailyRotateFile({
        dirname: logDir,
        filename: 'exceptions-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        format: winston.format.combine(
          winston.format.uncolorize(),
          winston.format.json(),
        ),
      }),
    ],
    // Handle unhandled promise rejections
    rejectionHandlers: [
      new winston.transports.Console(),
      new DailyRotateFile({
        dirname: logDir,
        filename: 'rejections-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        format: winston.format.combine(
          winston.format.uncolorize(),
          winston.format.json(),
        ),
      }),
    ],
  };

  return winstonConfig;
}

// Default configuration for NestJS Winston module
export const winstonConfig = createLoggerConfig();