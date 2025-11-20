"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectModel = void 0;
class ProjectModel {
    static createProject(name, ownerId, description, color, memberIds = []) {
        return {
            id: this.generateId(),
            name,
            description,
            ownerId,
            color,
            memberIds: [ownerId, ...memberIds],
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    static generateId() {
        return `project_${this.idCounter++}`;
    }
    static addMember(project, userId) {
        if (project.memberIds.includes(userId)) {
            return project;
        }
        return {
            ...project,
            memberIds: [...project.memberIds, userId],
            updatedAt: new Date()
        };
    }
    static removeMember(project, userId) {
        if (project.ownerId === userId) {
            throw new Error('Proje sahibi çıkarılamaz');
        }
        return {
            ...project,
            memberIds: project.memberIds.filter(id => id !== userId),
            updatedAt: new Date()
        };
    }
    static isMember(project, userId) {
        return project.memberIds.includes(userId);
    }
    static isOwner(project, userId) {
        return project.ownerId === userId;
    }
}
exports.ProjectModel = ProjectModel;
ProjectModel.idCounter = 1;
//# sourceMappingURL=project.model.js.map