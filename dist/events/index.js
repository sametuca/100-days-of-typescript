"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventEmitter = exports.EventPublisher = exports.EventSystem = void 0;
const task_events_handler_1 = require("./handlers/task-events.handler");
class EventSystem {
    static init() {
        task_events_handler_1.TaskEventHandler.init();
    }
}
exports.EventSystem = EventSystem;
var event_publisher_1 = require("./event-publisher");
Object.defineProperty(exports, "EventPublisher", { enumerable: true, get: function () { return event_publisher_1.EventPublisher; } });
var event_emitter_1 = require("./event-emitter");
Object.defineProperty(exports, "eventEmitter", { enumerable: true, get: function () { return event_emitter_1.eventEmitter; } });
//# sourceMappingURL=index.js.map