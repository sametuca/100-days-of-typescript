"use strict";
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
//# sourceMappingURL=index.js.map