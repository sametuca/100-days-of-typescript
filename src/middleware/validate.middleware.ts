import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

function assignInPlace(target: object, source: object): void {
  const current = target as Record<string, unknown>;
  const next = source as Record<string, unknown>;
  for (const key of Object.keys(current)) {
    if (!Object.prototype.hasOwnProperty.call(next, key)) {
      delete current[key];
    }
  }
  Object.assign(current, next);
}

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validatedBody = schema.parse(req.body);
      req.body = validatedBody;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        throw new ValidationError(
          formattedErrors[0]?.message || 'Validation hatası',
          formattedErrors,
          'VALIDATION_ERROR'
        );
      }
      next(error);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validatedParams = schema.parse(req.params);
      assignInPlace(req.params, validatedParams as object);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        throw new ValidationError(
          formattedErrors[0]?.message || 'Validation hatası',
          formattedErrors,
          'VALIDATION_ERROR'
        );
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validatedQuery = schema.parse(req.query);
      assignInPlace(req.query, validatedQuery as object);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        throw new ValidationError(
          formattedErrors[0]?.message || 'Validation hatası',
          formattedErrors,
          'VALIDATION_ERROR'
        );
      }
      next(error);
    }
  };
};