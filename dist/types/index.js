"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.TaskPriority = exports.TaskStatus = void 0;
exports.isTask = isTask;
exports.isUser = isUser;
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "TODO";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["DONE"] = "DONE";
    TaskStatus["CANCELLED"] = "CANCELLED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "LOW";
    TaskPriority["MEDIUM"] = "MEDIUM";
    TaskPriority["HIGH"] = "HIGH";
    TaskPriority["URGENT"] = "URGENT";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MODERATOR"] = "MODERATOR";
})(UserRole || (exports.UserRole = UserRole = {}));
function isTask(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'title' in obj &&
        'status' in obj);
}
function isUser(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'email' in obj &&
        'username' in obj);
}
__exportStar(require("./comment.types"), exports);
__exportStar(require("./activity.types"), exports);
__exportStar(require("./subtask.types"), exports);
__exportStar(require("./analysis.types"), exports);
__exportStar(require("./testing.types"), exports);
__exportStar(require("./performance.types"), exports);
__exportStar(require("./security.types"), exports);
//# sourceMappingURL=index.js.map