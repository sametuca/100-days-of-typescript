import { EventEmitter } from 'events';
import logger from '../utils/logger';

export interface AppEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
}

class AppEventEmitter extends EventEmitter {
  emit(eventName: string, event: AppEvent): boolean {
    logger.info(`Event emitted: ${eventName}`, { 
      type: event.type, 
      userId: event.userId,
      timestamp: event.timestamp 
    });
    return super.emit(eventName, event);
  }
}

export const eventEmitter = new AppEventEmitter();