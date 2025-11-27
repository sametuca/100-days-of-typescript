export interface Organization {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    website?: string;
    settings: OrganizationSettings;
    subscriptionPlan: SubscriptionPlanName;
    subscriptionStatus: 'active' | 'cancelled' | 'suspended' | 'trial';
    createdAt: Date;
    updatedAt: Date;
}

export interface OrganizationSettings {
    theme: {
        primaryColor: string;
        logo?: string;
    };
    features: {
        aiAnalysis: boolean;
        advancedSecurity: boolean;
        customWorkflows: boolean;
    };
    limits: {
        maxUsers: number;
        maxProjects: number;
        maxTasksPerProject: number;
        storageGB: number;
    };
}

export interface Team {
    id: string;
    organizationId: string;
    name: string;
    description?: string;
    avatar?: string;
    settings: TeamSettings;
    createdAt: Date;
    updatedAt: Date;
}

export interface TeamSettings {
    visibility: 'public' | 'private';
    defaultRole: TeamRole;
}

export interface Membership {
    id: string;
    userId: string;
    organizationId: string;
    teamId?: string;
    role: OrganizationRole;
    permissions: Permission[];
    status: 'active' | 'invited' | 'suspended';
    invitedBy?: string;
    invitedAt?: Date;
    joinedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type OrganizationRole = 'owner' | 'admin' | 'member' | 'guest';
export type TeamRole = 'lead' | 'member' | 'viewer';

export enum Permission {
    // Organization permissions
    ORG_MANAGE = 'org:manage',
    ORG_SETTINGS = 'org:settings',
    ORG_BILLING = 'org:billing',
    ORG_MEMBERS_INVITE = 'org:members:invite',
    ORG_MEMBERS_REMOVE = 'org:members:remove',

    // Team permissions
    TEAM_CREATE = 'team:create',
    TEAM_MANAGE = 'team:manage',
    TEAM_DELETE = 'team:delete',

    // Project permissions
    PROJECT_CREATE = 'project:create',
    PROJECT_VIEW = 'project:view',
    PROJECT_EDIT = 'project:edit',
    PROJECT_DELETE = 'project:delete',

    // Task permissions
    TASK_CREATE = 'task:create',
    TASK_VIEW = 'task:view',
    TASK_EDIT = 'task:edit',
    TASK_DELETE = 'task:delete',
    TASK_ASSIGN = 'task:assign'
}

export const ROLE_PERMISSIONS: Record<OrganizationRole, Permission[]> = {
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

export type SubscriptionPlanName = 'free' | 'starter' | 'professional' | 'enterprise';

export interface SubscriptionPlan {
    name: SubscriptionPlanName;
    price: {
        monthly: number;
        annual: number;
    };
    limits: {
        maxUsers: number;
        maxProjects: number;
        maxTasksPerProject: number;
        storageGB: number;
        apiCallsPerMonth: number;
    };
    features: {
        aiAnalysis: boolean;
        advancedSecurity: boolean;
        customWorkflows: boolean;
        prioritySupport: boolean;
        sso: boolean;
        auditLogs: boolean;
    };
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanName, SubscriptionPlan> = {
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
            maxUsers: -1, // unlimited
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

export interface OrganizationUsage {
    users: { current: number; limit: number };
    projects: { current: number; limit: number };
    storage: { current: number; limit: number; unit: string };
    apiCalls: { current: number; limit: number; period: string };
}

export interface CreateOrganizationDto {
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    website?: string;
}

export interface UpdateOrganizationDto {
    name?: string;
    description?: string;
    logo?: string;
    website?: string;
    settings?: Partial<OrganizationSettings>;
}

export interface CreateTeamDto {
    name: string;
    description?: string;
    avatar?: string;
    settings?: Partial<TeamSettings>;
}

export interface UpdateTeamDto {
    name?: string;
    description?: string;
    avatar?: string;
    settings?: Partial<TeamSettings>;
}

export interface InviteMemberDto {
    email: string;
    role: OrganizationRole;
    teamIds?: string[];
}

export interface UpdateMemberDto {
    role?: OrganizationRole;
    permissions?: Permission[];
}
