import { Request, Response } from 'express';

export class HealthController {
  
  public static getHealth(_req: Request, res: Response): void {
    
    const healthCheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };

    res.status(200).json({
      success: true,
      data: healthCheck
    });
  }

  
  public static getRoot(_req: Request, res: Response): void {
    
    res.status(200).json({
      success: true,
      message: 'Welcome to DevTracker API',
      version: '1.0.0',
      endpoints: {
        health: '/api/v1/health',  
        docs: '/api/v1/docs'        
      }
    });
  }
}