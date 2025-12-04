import { eventEmitter, AppEvent } from './event-emitter';

export class EventPublisher {
  static publishTaskCreated(task: any, createdBy: string) {
    const event: AppEvent = {
      type: 'task.created',
      payload: { task, createdBy },
      timestamp: new Date(),
      userId: createdBy
    };
    eventEmitter.emit('task.created', event);
  }

  static publishTaskUpdated(task: any, updatedBy: string, changes: any) {
    const event: AppEvent = {
      type: 'task.updated',
      payload: { task, updatedBy, changes },
      timestamp: new Date(),
      userId: updatedBy
    };
    eventEmitter.emit('task.updated', event);
  }

  static publishTaskCompleted(task: any, completedBy: string) {
    const event: AppEvent = {
      type: 'task.completed',
      payload: { task, completedBy },
      timestamp: new Date(),
      userId: completedBy
    };
    eventEmitter.emit('task.completed', event);
  }

  static publishTaskAssigned(task: any, assignedTo: string, assignedBy: string) {
    const event: AppEvent = {
      type: 'task.assigned',
      payload: { task, assignedTo, assignedBy },
      timestamp: new Date(),
      userId: assignedBy
    };
    eventEmitter.emit('task.assigned', event);
  }

  static publishUserRegistered(user: any) {
    const event: AppEvent = {
      type: 'user.registered',
      payload: { user },
      timestamp: new Date(),
      userId: user.id
    };
    eventEmitter.emit('user.registered', event);
  }
}