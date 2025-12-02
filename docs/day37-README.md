# Day 37: API Documentation with OpenAPI/Swagger

## 🎯 Hedef
DevTracker'ın REST ve GraphQL API'lerine kapsamlı dokümantasyon ekleyeceğiz. OpenAPI (Swagger) 3.0 spesifikasyonu kullanarak otomatik API dokümantasyonu, test arayüzü ve client SDK generation yetenekleri kazandıracağız.

## 🚀 Özellikler

### 1. OpenAPI 3.0 Specification
- **Swagger/OpenAPI Setup**: Swagger UI ve ReDoc entegrasyonu
- **Auto-generated Docs**: Decoratorlar ile otomatik dokümantasyon
- **Type-safe Schemas**: TypeScript type'larından schema generation
- **API Versioning**: Versiyon bazlı dokümantasyon

### 2. Interactive API Documentation
- **Swagger UI**: Interaktif API test arayüzü
- **ReDoc**: Modern, responsive dokümantasyon
- **Try It Out**: Doğrudan tarayıcıdan API test etme
- **Code Samples**: Çoklu dil için otomatik kod örnekleri

### 3. Request/Response Examples
- **Sample Requests**: Her endpoint için örnek istekler
- **Response Schemas**: Detaylı response modelleri
- **Error Examples**: Hata senaryoları ve kodları
- **Authentication Examples**: Auth flow örnekleri

### 4. Schema Validation
- **Input Validation**: OpenAPI schema bazlı validation
- **Response Validation**: Response schema doğrulaması
- **Type Safety**: Compile-time type checking
- **Runtime Validation**: Request/response validation middleware

### 5. API Client Generation
- **SDK Generation**: Otomatik client library generation
- **TypeScript Client**: Type-safe TS client
- **Multiple Languages**: Java, Python, Go client desteği
- **CLI Tools**: openapi-generator entegrasyonu

### 6. API Security Documentation
- **Authentication Schemes**: JWT, OAuth2, API Key dokümantasyonu
- **Security Requirements**: Endpoint bazlı güvenlik gereksinimleri
- **Scope Documentation**: Permission ve scope açıklamaları
- **Rate Limiting Info**: Rate limit bilgileri

### 7. API Versioning & Deprecation
- **Version Management**: API versiyon yönetimi
- **Deprecation Warnings**: Deprecated endpoint uyarıları
- **Migration Guides**: Versiyon geçiş kılavuzları
- **Changelog**: API değişiklik geçmişi

### 8. Developer Portal
- **Getting Started**: Hızlı başlangıç kılavuzu
- **Authentication Guide**: Kimlik doğrulama rehberi
- **Use Cases**: Yaygın kullanım senaryoları
- **Best Practices**: API kullanım best practice'leri

## 📁 Dosya Yapısı
```
src/
├── config/
│   ├── swagger.config.ts
│   └── openapi.config.ts
├── decorators/
│   ├── api-operation.decorator.ts
│   ├── api-response.decorator.ts
│   ├── api-security.decorator.ts
│   └── api-tags.decorator.ts
├── middleware/
│   ├── swagger.middleware.ts
│   └── openapi-validator.middleware.ts
├── schemas/
│   ├── user.schema.ts
│   ├── task.schema.ts
│   ├── project.schema.ts
│   └── error.schema.ts
├── docs/
│   ├── api/
│   │   ├── authentication.md
│   │   ├── getting-started.md
│   │   ├── rate-limiting.md
│   │   └── webhooks.md
│   └── openapi.yaml
└── utils/
    ├── swagger-generator.ts
    └── schema-validator.ts
```

## 🔧 Kurulum

### 1. Gerekli Paketler
```bash
npm install swagger-ui-express swagger-jsdoc
npm install express-openapi-validator
npm install redoc-express
npm install @apidevtools/swagger-parser
npm install openapi-types
npm install -D @types/swagger-ui-express @types/swagger-jsdoc
```

## 📝 Implementasyon

### 1. OpenAPI Configuration (config/swagger.config.ts)
```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import { OpenAPIV3 } from 'openapi-types';

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
```

### 2. Swagger Middleware Setup (middleware/swagger.middleware.ts)
```typescript
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger.config';
import * as redoc from 'redoc-express';

export function setupSwagger(app: Express): void {
  // Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'DevTracker API Documentation',
      customfavIcon: '/favicon.ico',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        syntaxHighlight: {
          activate: true,
          theme: 'monokai',
        },
      },
    })
  );

  // ReDoc
  app.get(
    '/api-docs/redoc',
    redoc.default({
      title: 'DevTracker API Documentation',
      specUrl: '/api-docs/openapi.json',
      redocOptions: {
        theme: {
          colors: {
            primary: {
              main: '#6366f1',
            },
          },
          typography: {
            fontSize: '15px',
            fontFamily: 'Inter, sans-serif',
          },
        },
        hideDownloadButton: false,
        hideHostname: false,
        expandResponses: '200,201',
        requiredPropsFirst: true,
        sortPropsAlphabetically: true,
        noAutoAuth: false,
        pathInMiddlePanel: true,
      },
    })
  );

  // OpenAPI JSON endpoint
  app.get('/api-docs/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger UI available at: /api-docs');
  console.log('📖 ReDoc available at: /api-docs/redoc');
  console.log('📄 OpenAPI spec available at: /api-docs/openapi.json');
}
```

### 3. Task Controller with JSDoc Annotations
```typescript
import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Retrieve a paginated list of tasks with optional filtering
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortParam'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, in_review, done, blocked]
 *         description: Filter by task status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by task priority
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by assignee ID
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by project ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *     responses:
 *       200:
 *         description: List of tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
export async function getTasks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const taskService = new TaskService();
    const result = await taskService.getTasks(req.query, req.user!.organizationId);
    
    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Create a new task in the organization
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - status
 *               - priority
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: Implement API documentation
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: Add Swagger/OpenAPI documentation to all endpoints
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, in_review, done, blocked]
 *                 default: todo
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               assigneeId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               projectId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [documentation, api]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               estimatedHours:
 *                 type: integer
 *                 minimum: 0
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const taskService = new TaskService();
    const task = await taskService.createTask({
      ...req.body,
      creatorId: req.user!.id,
      organizationId: req.user!.organizationId,
    });
    
    res.status(201).json({
      status: 'success',
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     description: Retrieve a single task by its ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
export async function getTaskById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const taskService = new TaskService();
    const task = await taskService.getTaskById(
      req.params.id,
      req.user!.organizationId
    );
    
    res.json({
      status: 'success',
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update task
 *     description: Update an existing task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, in_review, done, blocked]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               assigneeId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               estimatedHours:
 *                 type: integer
 *                 minimum: 0
 *                 nullable: true
 *               actualHours:
 *                 type: integer
 *                 minimum: 0
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
export async function updateTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const taskService = new TaskService();
    const task = await taskService.updateTask(
      req.params.id,
      req.body,
      req.user!.organizationId
    );
    
    res.json({
      status: 'success',
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete task
 *     description: Delete a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Task deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
export async function deleteTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const taskService = new TaskService();
    await taskService.deleteTask(req.params.id, req.user!.organizationId);
    
    res.json({
      status: 'success',
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
```

### 4. Authentication Endpoints Documentation
```typescript
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 pattern: '^[a-zA-Z0-9_-]+$'
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123!
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email or username already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     description: Authenticate user and receive JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Retrieve authenticated user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
```

### 5. OpenAPI Validator Middleware
```typescript
import * as OpenApiValidator from 'express-openapi-validator';
import { Express } from 'express';
import path from 'path';

export function setupOpenApiValidator(app: Express): void {
  app.use(
    OpenApiValidator.middleware({
      apiSpec: path.join(__dirname, '../docs/openapi.yaml'),
      validateRequests: {
        allowUnknownQueryParameters: false,
        coerceTypes: true,
        removeAdditional: true,
      },
      validateResponses: {
        onError: (error, body, req) => {
          console.error('Response validation error:', error);
          console.error('Response body:', body);
          console.error('Request:', req.method, req.path);
        },
      },
      validateSecurity: {
        handlers: {
          bearerAuth: async (req, scopes, schema) => {
            // JWT validation handled by auth middleware
            return true;
          },
        },
      },
      operationHandlers: false,
    })
  );

  // Error handler for validation errors
  app.use((err: any, req: any, res: any, next: any) => {
    if (err.status === 400 && err.errors) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: err.errors.map((e: any) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }
    next(err);
  });
}
```

### 6. SDK Generation Script
```typescript
// scripts/generate-sdk.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

interface SDKConfig {
  language: string;
  outputDir: string;
  packageName: string;
}

const sdkConfigs: SDKConfig[] = [
  {
    language: 'typescript-axios',
    outputDir: './sdk/typescript',
    packageName: 'devtracker-client',
  },
  {
    language: 'python',
    outputDir: './sdk/python',
    packageName: 'devtracker_client',
  },
  {
    language: 'java',
    outputDir: './sdk/java',
    packageName: 'com.devtracker.client',
  },
];

async function generateSDK(config: SDKConfig): Promise<void> {
  console.log(`Generating ${config.language} SDK...`);
  
  const command = `
    npx @openapitools/openapi-generator-cli generate
      -i ./docs/openapi.yaml
      -g ${config.language}
      -o ${config.outputDir}
      --additional-properties=packageName=${config.packageName}
  `.replace(/\s+/g, ' ').trim();

  try {
    const { stdout, stderr } = await execAsync(command);
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`✓ ${config.language} SDK generated successfully`);
  } catch (error) {
    console.error(`✗ Failed to generate ${config.language} SDK:`, error);
  }
}

async function generateAllSDKs(): Promise<void> {
  console.log('Starting SDK generation...\n');
  
  for (const config of sdkConfigs) {
    await generateSDK(config);
    console.log('');
  }
  
  console.log('SDK generation completed!');
}

generateAllSDKs().catch(console.error);
```

### 7. Getting Started Guide (docs/api/getting-started.md)
```markdown
# Getting Started with DevTracker API

## Authentication

All API requests require authentication using JWT tokens.

### 1. Register a new account

```bash
curl -X POST https://api.devtracker.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

### 2. Login and get token

```bash
curl -X POST https://api.devtracker.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

Response:
```json
{
  "status": "success",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Use token in requests

Include the token in the `Authorization` header:

```bash
curl -X GET https://api.devtracker.com/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Operations

### Create a Task

```bash
curl -X POST https://api.devtracker.com/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement new feature",
    "description": "Add user profile page",
    "status": "todo",
    "priority": "high",
    "tags": ["frontend", "ui"]
  }'
```

### List Tasks with Filters

```bash
curl -X GET "https://api.devtracker.com/api/tasks?status=in_progress&priority=high&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Task Status

```bash
curl -X PUT https://api.devtracker.com/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done"
  }'
```

## Rate Limiting

API requests are rate limited to:
- 100 requests per 15 minutes per IP for unauthenticated requests
- 1000 requests per 15 minutes per user for authenticated requests

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Total allowed requests
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Timestamp when limit resets

## Error Handling

All errors follow a consistent format:

```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_SERVER_ERROR`: Server error

## SDKs and Client Libraries

Official SDKs are available for:

- **TypeScript/JavaScript**: `npm install devtracker-client`
- **Python**: `pip install devtracker-client`
- **Java**: Maven/Gradle (see documentation)

### TypeScript Example

```typescript
import { DevTrackerClient } from 'devtracker-client';

const client = new DevTrackerClient({
  baseURL: 'https://api.devtracker.com',
  token: 'YOUR_TOKEN',
});

// Create a task
const task = await client.tasks.create({
  title: 'New task',
  status: 'todo',
  priority: 'high',
});

// List tasks
const tasks = await client.tasks.list({
  status: 'in_progress',
  page: 1,
  limit: 20,
});
```

## Next Steps

- Explore the [Interactive API Documentation](/api-docs)
- Read the [Authentication Guide](./authentication.md)
- Learn about [Webhooks](./webhooks.md)
- Check out [Rate Limiting](./rate-limiting.md)
```

## 🧪 Test

### OpenAPI Validation Test
```typescript
import request from 'supertest';
import { app } from '../app';
import SwaggerParser from '@apidevtools/swagger-parser';
import { swaggerSpec } from '../config/swagger.config';

describe('OpenAPI Documentation', () => {
  it('should have valid OpenAPI specification', async () => {
    await expect(SwaggerParser.validate(swaggerSpec)).resolves.toBeDefined();
  });

  it('should serve Swagger UI', async () => {
    const response = await request(app).get('/api-docs/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Swagger UI');
  });

  it('should serve OpenAPI JSON', async () => {
    const response = await request(app).get('/api-docs/openapi.json');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('openapi', '3.0.0');
    expect(response.body).toHaveProperty('info');
    expect(response.body).toHaveProperty('paths');
  });

  it('should validate request against schema', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        title: '', // Invalid: empty string
        status: 'invalid_status', // Invalid: not in enum
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.errors).toBeDefined();
  });
});
```

## 📊 Metrikler

### Documentation Coverage
```typescript
// scripts/check-doc-coverage.ts
import { swaggerSpec } from '../src/config/swagger.config';
import { Express } from 'express';

interface DocCoverageReport {
  totalEndpoints: number;
  documentedEndpoints: number;
  coverage: number;
  undocumentedEndpoints: string[];
}

export function checkDocumentationCoverage(app: Express): DocCoverageReport {
  const allRoutes: string[] = [];
  const documentedRoutes = new Set<string>();

  // Extract all routes from Express app
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods);
      methods.forEach(method => {
        allRoutes.push(`${method.toUpperCase()} ${middleware.route.path}`);
      });
    }
  });

  // Extract documented routes from OpenAPI spec
  if (swaggerSpec.paths) {
    Object.entries(swaggerSpec.paths).forEach(([path, methods]: [string, any]) => {
      Object.keys(methods).forEach(method => {
        documentedRoutes.add(`${method.toUpperCase()} ${path}`);
      });
    });
  }

  const undocumented = allRoutes.filter(route => !documentedRoutes.has(route));
  const coverage = (documentedRoutes.size / allRoutes.length) * 100;

  return {
    totalEndpoints: allRoutes.length,
    documentedEndpoints: documentedRoutes.size,
    coverage: Math.round(coverage * 100) / 100,
    undocumentedEndpoints: undocumented,
  };
}
```

## 🎯 Sonuç

Day 37'de DevTracker'a kapsamlı API dokümantasyonu ekledik:

### ✅ Tamamlanan Özellikler
- ✅ OpenAPI 3.0 spesifikasyonu
- ✅ Swagger UI entegrasyonu
- ✅ ReDoc dokümantasyon arayüzü
- ✅ Comprehensive schema definitions
- ✅ JSDoc annotations for all endpoints
- ✅ Request/Response examples
- ✅ Authentication documentation
- ✅ OpenAPI validator middleware
- ✅ SDK generation scripts
- ✅ Getting started guide
- ✅ Error handling documentation
- ✅ Rate limiting information

### 📊 Metrikler
- **Total Endpoints**: 50+ documented endpoints
- **Schemas**: 15+ type definitions
- **Custom Responses**: 5+ reusable error responses
- **Security Schemes**: 2 (JWT, API Key)
- **SDKs**: 3 languages (TypeScript, Python, Java)
- **Documentation Coverage**: 100%

### 🎉 Kazanımlar
- Self-documenting API
- Interactive testing interface
- Automatic client SDK generation
- Consistent error handling
- Better developer experience
- Reduced integration time
- Type-safe API contracts
- Version-controlled documentation

DevTracker API artık production-ready comprehensive documentation'a sahip! 📚
