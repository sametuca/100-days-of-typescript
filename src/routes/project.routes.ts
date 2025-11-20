import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { 
  createProjectSchema, 
  updateProjectSchema, 
  addMemberSchema,
  projectQuerySchema
} from '../validation/project.validation';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const projectController = new ProjectController();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get user's projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ownedOnly
 *         schema:
 *           type: boolean
 *         description: Get only owned projects
 *       - in: query
 *         name: memberOnly
 *         schema:
 *           type: boolean
 *         description: Get only projects where user is member
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, ARCHIVED, COMPLETED]
 *         description: Filter by project status
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', validateQuery(projectQuerySchema), projectController.getProjects);

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "My New Project"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "A project for task management"
 *               color:
 *                 type: string
 *                 pattern: "^#[0-9A-F]{6}$"
 *                 example: "#3498db"
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 50
 *                 example: ["user_123", "user_456"]
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', validateBody(createProjectSchema), projectController.createProject);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       403:
 *         description: Access denied - Not a member
 *       404:
 *         description: Project not found
 */
router.get('/:id', projectController.getProjectById);

/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Update project (owner only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               color:
 *                 type: string
 *                 pattern: "^#[0-9A-F]{6}$"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, ARCHIVED, COMPLETED]
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       403:
 *         description: Access denied - Owner only
 *       404:
 *         description: Project not found
 */
router.put('/:id', validateBody(updateProjectSchema), projectController.updateProject);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete project (owner only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       403:
 *         description: Access denied - Owner only
 *       404:
 *         description: Project not found
 */
router.delete('/:id', projectController.deleteProject);

/**
 * @swagger
 * /projects/{id}/members:
 *   get:
 *     summary: Get project members
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SafeUser'
 */
router.get('/:id/members', projectController.getProjectMembers);

/**
 * @swagger
 * /projects/{id}/members:
 *   post:
 *     summary: Add member to project (owner only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newmember@example.com"
 *     responses:
 *       200:
 *         description: Member added successfully
 *       400:
 *         description: User already a member or not found
 *       403:
 *         description: Access denied - Owner only
 */
router.post('/:id/members', validateBody(addMemberSchema), projectController.addMember);

/**
 * @swagger
 * /projects/{id}/members/{memberId}:
 *   delete:
 *     summary: Remove member from project (owner only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member user ID
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       400:
 *         description: Cannot remove owner or user not a member
 *       403:
 *         description: Access denied - Owner only
 */
router.delete('/:id/members/:memberId', projectController.removeMember);

/**
 * @swagger
 * /projects/{id}/leave:
 *   post:
 *     summary: Leave project (members only, not owner)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Left project successfully
 *       400:
 *         description: Owner cannot leave project
 *       403:
 *         description: Not a member of this project
 */
router.post('/:id/leave', projectController.leaveProject);

/**
 * @swagger
 * /projects/{id}/stats:
 *   get:
 *     summary: Get project statistics
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTasks:
 *                       type: integer
 *                     completedTasks:
 *                       type: integer
 *                     pendingTasks:
 *                       type: integer
 *                     memberCount:
 *                       type: integer
 *                     completionRate:
 *                       type: integer
 *                       description: Completion rate percentage
 */
router.get('/:id/stats', projectController.getProjectStats);

export default router;