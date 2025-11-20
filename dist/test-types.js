"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const taskTitle = "TypeScript Öğren";
const taskId = 123;
const isCompleted = true;
const createdDate = new Date();
const status = types_1.TaskStatus.TODO;
const priority = types_1.TaskPriority.HIGH;
const role = types_1.UserRole.ADMIN;
const task = {
    id: "1",
    title: "TypeScript Öğren",
    description: "100 Days of Code",
    status: types_1.TaskStatus.IN_PROGRESS,
    priority: types_1.TaskPriority.HIGH,
    userId: "user1",
    projectId: "project1",
    createdAt: new Date(),
    updatedAt: new Date()
};
const user = {
    id: "user1",
    email: "user@example.com",
    username: "johndoe",
    passwordHash: "hashed_password",
    firstName: "John",
    lastName: "Doe",
    role: types_1.UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
};
const taskWithoutDesc = {
    id: "2",
    title: "Sadece Başlık",
    status: types_1.TaskStatus.TODO,
    priority: types_1.TaskPriority.LOW,
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date()
};
const taskResponse = {
    success: true,
    data: task
};
const userResponse = {
    success: true,
    data: user
};
const messageResponse = {
    success: true,
    data: "İşlem başarılı"
};
const taskSummary = {
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority
};
const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
};
const partialTask = {
    title: "Sadece başlık"
};
let idOrNumber;
idOrNumber = "123";
idOrNumber = 123;
let projectStatus;
projectStatus = 'ACTIVE';
const person = {
    name: "Ali",
    age: 25
};
function processEntity(entity) {
    if ('title' in entity) {
        console.log(entity.title);
    }
    else {
        console.log(entity.username);
    }
}
const isValidTask = (task) => {
    return task.title.length > 0;
};
const getTitles = (tasks) => {
    return tasks.map(task => task.title);
};
const numbers = [1, 2, 3];
const strings = ["a", "b", "c"];
const tasks = [task];
const coordinate = [10, 20];
const response = [true, "Success"];
const readonlyTask = task;
const readonlyArray = [1, 2, 3];
async function getTask(id) {
    return task;
}
async function deleteTask(id) {
}
//# sourceMappingURL=test-types.js.map