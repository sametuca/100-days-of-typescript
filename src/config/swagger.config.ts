import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevTracker API',
      version: '1.0.0',
      description: 'DevTracker - Modern Task & Project Management Platform API',
      contact: {
        name: 'API Support',
        email: 'support@devtracker.com',
        url: 'https://devtracker.com/support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
      {
        url: 'https://staging-api.devtracker.com',
        description: 'Staging server',
      },
      {
        url: 'https://api.devtracker.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key for service-to-service communication',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'An error occurred',
            },
            code: {
              type: 'string',
              example: 'VALIDATION_ERROR',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          required: ['id', 'email', 'username', 'name', 'role'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User unique identifier',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30,
              description: 'Unique username',
              example: 'johndoe',
            },
            name: {
              type: 'string',
              description: 'Full name',
              example: 'John Doe',
            },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'developer', 'viewer'],
              description: 'User role in the organization',
              example: 'developer',
            },
            avatar: {
              type: 'string',
              format: 'uri',
              nullable: true,
              description: 'Avatar image URL',
              example: 'https://example.com/avatars/user.jpg',
            },
            organizationId: {
              type: 'string',
              format: 'uuid',
              description: 'Organization ID',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Task: {
          type: 'object',
          required: ['id', 'title', 'status', 'priority', 'creatorId', 'organizationId'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Task unique identifier',
            },
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              description: 'Task title',
              example: 'Implement authentication',
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Detailed task description',
              example: 'Add JWT-based authentication system',
            },
            status: {
              type: 'string',
              enum: ['todo', 'in_progress', 'in_review', 'done', 'blocked'],
              description: 'Current task status',
              example: 'in_progress',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Task priority level',
              example: 'high',
            },
            assigneeId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Assigned user ID',
            },
            creatorId: {
              type: 'string',
              format: 'uuid',
              description: 'Task creator user ID',
            },
            projectId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Associated project ID',
            },
            organizationId: {
              type: 'string',
              format: 'uuid',
              description: 'Organization ID',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Task tags',
              example: ['backend', 'security'],
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Task due date',
            },
            estimatedHours: {
              type: 'integer',
              minimum: 0,
              nullable: true,
              description: 'Estimated hours to complete',
              example: 8,
            },
            actualHours: {
              type: 'integer',
              minimum: 0,
              nullable: true,
              description: 'Actual hours spent',
              example: 10,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Project: {
          type: 'object',
          required: ['id', 'name', 'key', 'status', 'organizationId', 'ownerId'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Project unique identifier',
            },
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Project name',
              example: 'DevTracker v2.0',
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Project description',
            },
            key: {
              type: 'string',
              pattern: '^[A-Z]{2,10}$',
              description: 'Project key (2-10 uppercase letters)',
              example: 'DT',
            },
            status: {
              type: 'string',
              enum: ['planning', 'active', 'on_hold', 'completed', 'archived'],
              description: 'Project status',
              example: 'active',
            },
            organizationId: {
              type: 'string',
              format: 'uuid',
            },
            ownerId: {
              type: 'string',
              format: 'uuid',
              description: 'Project owner user ID',
            },
            startDate: {
              type: 'string',
              format: 'date',
              nullable: true,
            },
            endDate: {
              type: 'string',
              format: 'date',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of items',
              example: 100,
            },
            page: {
              type: 'integer',
              description: 'Current page number',
              example: 1,
            },
            limit: {
              type: 'integer',
              description: 'Items per page',
              example: 20,
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages',
              example: 5,
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Authentication required',
                code: 'UNAUTHORIZED',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Access denied',
                code: 'FORBIDDEN',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Resource not found',
                code: 'NOT_FOUND',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                errors: [
                  {
                    field: 'email',
                    message: 'Invalid email format',
                  },
                ],
              },
            },
          },
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Rate limit exceeded',
                code: 'RATE_LIMIT_EXCEEDED',
              },
            },
          },
        },
      },
      parameters: {
        PageParam: {
          in: 'query',
          name: 'page',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
          description: 'Page number',
        },
        LimitParam: {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
          },
          description: 'Items per page',
        },
        SortParam: {
          in: 'query',
          name: 'sort',
          schema: {
            type: 'string',
            pattern: '^[a-zA-Z_]+(:(asc|desc))?$',
          },
          description: 'Sort field and order (e.g., "createdAt:desc")',
          example: 'createdAt:desc',
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User management operations',
      },
      {
        name: 'Tasks',
        description: 'Task management operations',
      },
      {
        name: 'Projects',
        description: 'Project management operations',
      },
      {
        name: 'Organizations',
        description: 'Organization management operations',
      },
      {
        name: 'Admin',
        description: 'Administrative operations',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
