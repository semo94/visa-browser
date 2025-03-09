import { ValidationPipe, ValidationError, BadRequestException } from '@nestjs/common';

/**
 * Factory to create a customized ValidationPipe with detailed error messages
 */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true, // Automatically convert primitives and perform type casting
    whitelist: true, // Remove properties without validation decorators
    forbidNonWhitelisted: true, // Throw error if non-decorated properties are sent
    validationError: { target: false, value: false }, // Security: remove sensitive data from errors
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
      const errors = validationErrors.map(error => formatValidationError(error));
      return new BadRequestException({
        message: 'Validation failed',
        errors: errors.flat(),
      });
    },
  });
}

/**
 * Recursively formats validation errors into a flattened array of error objects
 */
function formatValidationError(error: ValidationError, parentPath = '') {
  const errors = [];
  const path = parentPath ? `${parentPath}.${error.property}` : error.property;

  if (error.constraints) {
    Object.entries(error.constraints).forEach(([key, value]) => {
      errors.push({
        field: path,
        type: key,
        message: value,
      });
    });
  }

  if (error.children && error.children.length > 0) {
    error.children.forEach(child => {
      errors.push(...formatValidationError(child, path));
    });
  }

  return errors;
}