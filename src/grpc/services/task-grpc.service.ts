import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import { TaskRepository } from '../../repositories/task.repository';
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

export class TaskGrpcService {
  private server: grpc.Server;
  private taskRepository: TaskRepository;

  constructor() {
    this.server = new grpc.Server();
    this.taskRepository = new TaskRepository();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.addService(taskProto.TaskService.service, {
      CreateTask: this.createTask.bind(this),
      GetTask: this.getTask.bind(this),
      UpdateTask: this.updateTask.bind(this),
      DeleteTask: this.deleteTask.bind(this),
      ListTasks: this.listTasks.bind(this),
      StreamTaskUpdates: this.streamTaskUpdates.bind(this)
    });
  }

  private async createTask(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { title, description, priority, status, user_id, project_id } = call.request;

      const task = await this.taskRepository.create({
        title,
        description,
        priority,
        status,
        userId: user_id,
        projectId: project_id
      });

      callback(null, {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        user_id: task.userId,
        project_id: task.projectId,
        created_at: task.createdAt,
        updated_at: task.updatedAt
      });
    } catch (error: any) {
      logger.error('gRPC CreateTask error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      }, null);
    }
  }

  private async getTask(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { id } = call.request;
      const task = await this.taskRepository.findById(id);

      if (!task) {
        callback({
          code: grpc.status.NOT_FOUND,
          message: 'Task not found'
        }, null);
        return;
      }

      callback(null, {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        user_id: task.userId,
        project_id: task.projectId,
        created_at: task.createdAt,
        updated_at: task.updatedAt
      });
    } catch (error: any) {
      logger.error('gRPC GetTask error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      }, null);
    }
  }

  private async updateTask(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { id, title, description, priority, status } = call.request;

      const task = await this.taskRepository.update(id, {
        title,
        description,
        priority,
        status
      });

      callback(null, {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        user_id: task.userId,
        project_id: task.projectId,
        created_at: task.createdAt,
        updated_at: task.updatedAt
      });
    } catch (error: any) {
      logger.error('gRPC UpdateTask error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      }, null);
    }
  }

  private async deleteTask(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ): Promise<void> {
    try {
      const { id } = call.request;
      await this.taskRepository.delete(id);

      callback(null, {
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error: any) {
      logger.error('gRPC DeleteTask error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      }, null);
    }
  }

  private async listTasks(
    call: grpc.ServerWritableStream<any, any>
  ): Promise<void> {
    try {
      const { user_id, limit = 10, offset = 0, status } = call.request;

      const filters: any = { userId: user_id };
      if (status) filters.status = status;

      const tasks = await this.taskRepository.findAll(filters, limit, offset);

      for (const task of tasks) {
        call.write({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          user_id: task.userId,
          project_id: task.projectId,
          created_at: task.createdAt,
          updated_at: task.updatedAt
        });
      }

      call.end();
    } catch (error: any) {
      logger.error('gRPC ListTasks error:', error);
      call.destroy({
        code: grpc.status.INTERNAL,
        message: error.message
      } as any);
    }
  }

  private async streamTaskUpdates(
    call: grpc.ServerWritableStream<any, any>
  ): Promise<void> {
    const { user_id, task_ids } = call.request;

    // Simulate real-time updates (in production, use EventEmitter or message queue)
    const interval = setInterval(async () => {
      try {
        for (const taskId of task_ids) {
          const task = await this.taskRepository.findById(taskId);
          if (task && task.userId === user_id) {
            call.write({
              event_type: 'UPDATE',
              task: {
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                user_id: task.userId,
                project_id: task.projectId,
                created_at: task.createdAt,
                updated_at: task.updatedAt
              },
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (error: any) {
        logger.error('Stream task updates error:', error);
      }
    }, 5000); // Check every 5 seconds

    call.on('cancelled', () => {
      clearInterval(interval);
    });
  }

  start(port: number): void {
    this.server.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          logger.error('Failed to start gRPC server:', error);
          return;
        }
        logger.info(`gRPC server running on port ${port}`);
        this.server.start();
      }
    );
  }

  stop(): void {
    this.server.tryShutdown(() => {
      logger.info('gRPC server stopped');
    });
  }
}
