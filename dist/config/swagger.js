"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const env_1 = __importDefault(require("./env"));
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'DevTracker API',
        version: '1.0.0',
        description: 'Task Management System - REST API Documentation',
        contact: {
            name: 'DevTracker Team',
            email: 'support@devtracker.com'
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
        }
    },
    servers: [
        {
            url: `http://${env_1.default.server.host}:${env_1.default.server.port}${env_1.default.server.apiPrefix}`,
            description: 'Development server'
        },
        {
            url: 'https://api.devtracker.com/api/v1',
            description: 'Production server'
        }
    ],
    tags: [
        {
            name: 'Authentication',
            description: 'User authentication endpoints'
        },
        {
            name: 'Users',
            description: 'User management endpoints'
        },
        {
            name: 'Tasks',
            description: 'Task management endpoints'
        },
        {
            name: 'Projects',
            description: 'Project/Workspace management endpoints'
        },
        {
            name: 'Health',
            description: 'System health check'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your JWT token'
            }
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: false
                    },
                    error: {
                        type: 'object',
                        properties: {
                            message: {
                                type: 'string',
                                example: 'Error message'
                            },
                            code: {
                                type: 'string',
                                example: 'ERROR_CODE'
                            },
                            statusCode: {
                                type: 'integer',
                                example: 400
                            }
                        }
                    }
                }
            },
            User: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: 'user_1000'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'user@example.com'
                    },
                    username: {
                        type: 'string',
                        example: 'johndoe'
                    },
                    firstName: {
                        type: 'string',
                        example: 'John'
                    },
                    lastName: {
                        type: 'string',
                        example: 'Doe'
                    },
                    avatar: {
                        type: 'string',
                        example: 'avatar-123456.jpg'
                    },
                    role: {
                        type: 'string',
                        enum: ['USER', 'ADMIN', 'MODERATOR'],
                        example: 'USER'
                    },
                    isActive: {
                        type: 'boolean',
                        example: true
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time'
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            },
            Task: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: 'task_1000'
                    },
                    title: {
                        type: 'string',
                        example: 'Complete project documentation'
                    },
                    description: {
                        type: 'string',
                        example: 'Write comprehensive API documentation'
                    },
                    status: {
                        type: 'string',
                        enum: ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'],
                        example: 'TODO'
                    },
                    priority: {
                        type: 'string',
                        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
                        example: 'HIGH'
                    },
                    userId: {
                        type: 'string',
                        example: 'user_1000'
                    },
                    projectId: {
                        type: 'string',
                        example: 'project_1'
                    },
                    dueDate: {
                        type: 'string',
                        format: 'date-time'
                    },
                    tags: {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time'
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            },
            Project: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: 'project_1'
                    },
                    name: {
                        type: 'string',
                        example: 'DevTracker Project'
                    },
                    description: {
                        type: 'string',
                        example: 'Main project for task management'
                    },
                    ownerId: {
                        type: 'string',
                        example: 'user_1000'
                    },
                    memberIds: {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        example: ['user_1000', 'user_1001']
                    },
                    status: {
                        type: 'string',
                        enum: ['ACTIVE', 'ARCHIVED', 'COMPLETED'],
                        example: 'ACTIVE'
                    },
                    color: {
                        type: 'string',
                        example: '#3498db'
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time'
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            },
            SafeUser: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: 'user_1000'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'user@example.com'
                    },
                    username: {
                        type: 'string',
                        example: 'johndoe'
                    },
                    firstName: {
                        type: 'string',
                        example: 'John'
                    },
                    lastName: {
                        type: 'string',
                        example: 'Doe'
                    },
                    avatar: {
                        type: 'string',
                        example: '/uploads/avatars/user_1000.jpg'
                    },
                    role: {
                        type: 'string',
                        enum: ['USER', 'ADMIN', 'MODERATOR'],
                        example: 'USER'
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            }
        },
        responses: {
            UnauthorizedError: {
                description: 'Authentication required',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        },
                        example: {
                            success: false,
                            error: {
                                message: 'Authentication required',
                                code: 'UNAUTHORIZED'
                            }
                        }
                    }
                }
            },
            ValidationError: {
                description: 'Validation error',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        },
                        example: {
                            success: false,
                            error: {
                                message: 'Validation failed',
                                code: 'VALIDATION_ERROR'
                            }
                        }
                    }
                }
            }
        }
    }
};
const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map