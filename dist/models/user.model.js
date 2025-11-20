"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const types_1 = require("../types");
class UserModel {
    static createUser(email, username, passwordHash, firstName, lastName, role = types_1.UserRole.USER) {
        return {
            id: this.generateId(),
            email,
            username,
            passwordHash,
            firstName,
            lastName,
            role,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    static generateId() {
        return `user_${this.idCounter++}`;
    }
    static toSafeUser(user) {
        const { passwordHash, ...rest } = user;
        return rest;
    }
    static getFullName(user) {
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        if (user.firstName) {
            return user.firstName;
        }
        return user.username;
    }
}
exports.UserModel = UserModel;
UserModel.idCounter = 1;
//# sourceMappingURL=user.model.js.map