// Day 29: Security Controller

import { Request, Response } from 'express';
import { securityService } from '../services/security.service';

export class SecurityController {
  // Get security statistics
  static getStats = (_req: Request, res: Response): void => {
    const stats = securityService.getStats();
    res.json({ success: true, data: stats });
  };

  // Unblock IP address
  static unblockIP = (req: Request, res: Response): void => {
    const { ip } = req.params;
    securityService.unblockIP(ip);
    res.json({ success: true, message: `IP ${ip} unblocked` });
  };
}