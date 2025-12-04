import axios, { AxiosInstance } from 'axios';
import { serviceRegistry, ServiceInfo } from './service-registry';
import logger from '../utils/logger';

export class ServiceClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async callService(serviceName: string, endpoint: string, data?: any, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'): Promise<any> {
    const services = serviceRegistry.getServicesByName(serviceName);
    
    if (services.length === 0) {
      throw new Error(`No healthy instances of service '${serviceName}' found`);
    }

    // Simple load balancing - round robin
    const service = services[Math.floor(Math.random() * services.length)];
    const url = `http://${service.host}:${service.port}${endpoint}`;

    try {
      logger.info(`Calling service: ${serviceName} at ${url}`);
      
      const response = await this.client.request({
        method,
        url,
        data
      });

      return response.data;
    } catch (error: any) {
      logger.error(`Service call failed: ${serviceName}`, error.message);
      throw new Error(`Service call failed: ${error.message}`);
    }
  }

  async getUserService(endpoint: string, data?: any, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'): Promise<any> {
    return this.callService('user-service', endpoint, data, method);
  }

  async getTaskService(endpoint: string, data?: any, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'): Promise<any> {
    return this.callService('task-service', endpoint, data, method);
  }

  async getNotificationService(endpoint: string, data?: any, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'): Promise<any> {
    return this.callService('notification-service', endpoint, data, method);
  }
}

export const serviceClient = new ServiceClient();