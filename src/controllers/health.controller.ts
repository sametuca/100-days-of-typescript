import { Request, Response } from 'express';

export class HealthController {
  
  /**
   * @swagger
   * /:
   *   get:
   *     summary: API root endpoint
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Welcome message
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 version:
   *                   type: string
   *                 endpoints:
   *                   type: object
   */
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

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Health check endpoint
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Server health status
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     uptime:
   *                       type: number
   *                     message:
   *                       type: string
   *                     timestamp:
   *                       type: string
   *                     environment:
   *                       type: string
   */
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
}