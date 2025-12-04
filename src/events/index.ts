import { TaskEventHandler } from './handlers/task-events.handler';

export class EventSystem {
  static init() {
    TaskEventHandler.init();
  }
}

export { EventPublisher } from './event-publisher';
export { eventEmitter } from './event-emitter';