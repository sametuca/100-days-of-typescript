"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPublisher = void 0;
const event_emitter_1 = require("./event-emitter");
class EventPublisher {
    static publishTaskCreated(task, createdBy) {
        const event = {
            type: 'task.created',
            payload: { task, createdBy },
            timestamp: new Date(),
            userId: createdBy
        };
        event_emitter_1.eventEmitter.emit('task.created', event);
    }
    static publishTaskUpdated(task, updatedBy, changes) {
        const event = {
            type: 'task.updated',
            payload: { task, updatedBy, changes },
            timestamp: new Date(),
            userId: updatedBy
        };
        event_emitter_1.eventEmitter.emit('task.updated', event);
    }
    static publishTaskCompleted(task, completedBy) {
        const event = {
            type: 'task.completed',
            payload: { task, completedBy },
            timestamp: new Date(),
            userId: completedBy
        };
        event_emitter_1.eventEmitter.emit('task.completed', event);
    }
    static publishTaskAssigned(task, assignedTo, assignedBy) {
        const event = {
            type: 'task.assigned',
            payload: { task, assignedTo, assignedBy },
            timestamp: new Date(),
            userId: assignedBy
        };
        event_emitter_1.eventEmitter.emit('task.assigned', event);
    }
    static publishUserRegistered(user) {
        const event = {
            type: 'user.registered',
            payload: { user },
            timestamp: new Date(),
            userId: user.id
        };
        event_emitter_1.eventEmitter.emit('user.registered', event);
    }
}
exports.EventPublisher = EventPublisher;
//# sourceMappingURL=event-publisher.js.map