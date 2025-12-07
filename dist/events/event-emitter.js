"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventEmitter = void 0;
const events_1 = require("events");
const logger_1 = __importDefault(require("../utils/logger"));
class AppEventEmitter extends events_1.EventEmitter {
    emit(eventName, event) {
        logger_1.default.info(`Event emitted: ${eventName}`, {
            type: event.type,
            userId: event.userId,
            timestamp: event.timestamp
        });
        return super.emit(eventName, event);
    }
}
exports.eventEmitter = new AppEventEmitter();
//# sourceMappingURL=event-emitter.js.map