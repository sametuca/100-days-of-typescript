import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import logger from '../../utils/logger';

const PROTO_PATH = join(__dirname, '../protos/task.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const taskProto = grpc.loadPackageDefinition(packageDefinition).taskservice as any;

export class TaskGrpcClient {
  private client: any;

  constructor(serverAddress: string) {
    this.client = new taskProto.TaskService(
      serverAddress,
      grpc.credentials.createInsecure()
    );
  }

  async createTask(data: {
    title: string;
    description: string;
    priority: string;
    status: string;
    user_id: number;
    project_id?: number;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.CreateTask(data, (error: any, response: any) => {
        if (error) {
          logger.error('gRPC CreateTask client error:', error);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getTask(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.GetTask({ id }, (error: any, response: any) => {
        if (error) {
          logger.error('gRPC GetTask client error:', error);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async updateTask(id: number, data: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.UpdateTask({ id, ...data }, (error: any, response: any) => {
        if (error) {
          logger.error('gRPC UpdateTask client error:', error);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async deleteTask(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.DeleteTask({ id }, (error: any, response: any) => {
        if (error) {
          logger.error('gRPC DeleteTask client error:', error);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async listTasks(userId: number, options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const tasks: any[] = [];
      const call = this.client.ListTasks({
        user_id: userId,
        ...options
      });

      call.on('data', (task: any) => {
        tasks.push(task);
      });

      call.on('end', () => {
        resolve(tasks);
      });

      call.on('error', (error: any) => {
        logger.error('gRPC ListTasks client error:', error);
        reject(error);
      });
    });
  }

  subscribeToTaskUpdates(
    userId: number,
    taskIds: number[],
    onUpdate: (event: any) => void
  ): () => void {
    const call = this.client.StreamTaskUpdates({
      user_id: userId,
      task_ids: taskIds
    });

    call.on('data', (event: any) => {
      onUpdate(event);
    });

    call.on('error', (error: any) => {
      logger.error('gRPC StreamTaskUpdates error:', error);
    });

    call.on('end', () => {
      logger.info('Task updates stream ended');
    });

    return () => {
      call.cancel();
    };
  }

  close(): void {
    grpc.closeClient(this.client);
  }
}
