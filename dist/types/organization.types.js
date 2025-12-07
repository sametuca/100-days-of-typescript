"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBSCRIPTION_PLANS = exports.ROLE_PERMISSIONS = exports.Permission = void 0;
var Permission;
(function (Permission) {
    Permission["ORG_MANAGE"] = "org:manage";
    Permission["ORG_SETTINGS"] = "org:settings";
    Permission["ORG_BILLING"] = "org:billing";
    Permission["ORG_MEMBERS_INVITE"] = "org:members:invite";
    Permission["ORG_MEMBERS_REMOVE"] = "org:members:remove";
    Permission["TEAM_CREATE"] = "team:create";
    Permission["TEAM_MANAGE"] = "team:manage";
    Permission["TEAM_DELETE"] = "team:delete";
    Permission["PROJECT_CREATE"] = "project:create";
    Permission["PROJECT_VIEW"] = "project:view";
    Permission["PROJECT_EDIT"] = "project:edit";
    Permission["PROJECT_DELETE"] = "project:delete";
    Permission["TASK_CREATE"] = "task:create";
    Permission["TASK_VIEW"] = "task:view";
    Permission["TASK_EDIT"] = "task:edit";
    Permission["TASK_DELETE"] = "task:delete";
    Permission["TASK_ASSIGN"] = "task:assign";
})(Permission || (exports.Permission = Permission = {}));
exports.ROLE_PERMISSIONS = {
    owner: [
        Permission.ORG_MANAGE,
        Permission.ORG_SETTINGS,
        Permission.ORG_BILLING,
        Permission.ORG_MEMBERS_INVITE,
        Permission.ORG_MEMBERS_REMOVE,
        Permission.TEAM_CREATE,
        Permission.TEAM_MANAGE,
        Permission.TEAM_DELETE,
        Permission.PROJECT_CREATE,
        Permission.PROJECT_VIEW,
        Permission.PROJECT_EDIT,
        Permission.PROJECT_DELETE,
        Permission.TASK_CREATE,
        Permission.TASK_VIEW,
        Permission.TASK_EDIT,
        Permission.TASK_DELETE,
        Permission.TASK_ASSIGN
    ],
    admin: [
        Permission.ORG_SETTINGS,
        Permission.ORG_MEMBERS_INVITE,
        Permission.TEAM_CREATE,
        Permission.TEAM_MANAGE,
        Permission.PROJECT_CREATE,
        Permission.PROJECT_VIEW,
        Permission.PROJECT_EDIT,
        Permission.TASK_CREATE,
        Permission.TASK_VIEW,
        Permission.TASK_EDIT,
        Permission.TASK_ASSIGN
    ],
    member: [
        Permission.PROJECT_VIEW,
        Permission.TASK_CREATE,
        Permission.TASK_VIEW,
        Permission.TASK_EDIT
    ],
    guest: [
        Permission.PROJECT_VIEW,
        Permission.TASK_VIEW
    ]
};
exports.SUBSCRIPTION_PLANS = {
    free: {
        name: 'free',
        price: { monthly: 0, annual: 0 },
        limits: {
            maxUsers: 5,
            maxProjects: 3,
            maxTasksPerProject: 100,
            storageGB: 1,
            apiCallsPerMonth: 10000
        },
        features: {
            aiAnalysis: false,
            advancedSecurity: false,
            customWorkflows: false,
            prioritySupport: false,
            sso: false,
            auditLogs: false
        }
    },
    starter: {
        name: 'starter',
        price: { monthly: 29, annual: 290 },
        limits: {
            maxUsers: 15,
            maxProjects: 10,
            maxTasksPerProject: 500,
            storageGB: 10,
            apiCallsPerMonth: 50000
        },
        features: {
            aiAnalysis: true,
            advancedSecurity: false,
            customWorkflows: false,
            prioritySupport: false,
            sso: false,
            auditLogs: false
        }
    },
    professional: {
        name: 'professional',
        price: { monthly: 99, annual: 990 },
        limits: {
            maxUsers: 50,
            maxProjects: 50,
            maxTasksPerProject: 2000,
            storageGB: 50,
            apiCallsPerMonth: 200000
        },
        features: {
            aiAnalysis: true,
            advancedSecurity: true,
            customWorkflows: true,
            prioritySupport: true,
            sso: false,
            auditLogs: true
        }
    },
    enterprise: {
        name: 'enterprise',
        price: { monthly: 299, annual: 2990 },
        limits: {
            maxUsers: -1,
            maxProjects: -1,
            maxTasksPerProject: -1,
            storageGB: 500,
            apiCallsPerMonth: -1
        },
        features: {
            aiAnalysis: true,
            advancedSecurity: true,
            customWorkflows: true,
            prioritySupport: true,
            sso: true,
            auditLogs: true
        }
    }
};
//# sourceMappingURL=organization.types.js.map