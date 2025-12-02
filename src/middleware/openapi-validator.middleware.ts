import * as OpenApiValidator from 'express-openapi-validator';
import { Express } from 'express';
import path from 'path';

export function setupOpenApiValidator(app: Express): void {
  // Note: This requires an openapi.yaml file
  // For now, we'll skip the validator until the YAML file is generated
  
  // Error handler for validation errors
  app.use((err: any, req: any, res: any, next: any) => {
    if (err.status === 400 && err.errors) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: err.errors.map((e: any) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }
    next(err);
  });
}
