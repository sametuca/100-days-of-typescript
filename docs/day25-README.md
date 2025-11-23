# Day 25: Subtasks Implementation

## Goal
Implement a subtask system to break down main tasks into smaller, manageable items.

## Features
1.  **Subtask Management**:
    *   Add subtasks to a parent task.
    *   Toggle subtask completion status.
    *   Delete subtasks.
2.  **Progress Tracking**:
    *   Calculate task completion percentage based on subtasks.

## Technical Implementation

### Database Schema
New table `subtasks`:
*   `id`: UUID (Primary Key)
*   `task_id`: UUID (Foreign Key to tasks)
*   `title`: Text
*   `is_completed`: Boolean (Default false)
*   `created_at`: Datetime
*   `updated_at`: Datetime

### API Endpoints
*   `POST /api/tasks/:taskId/subtasks`: Create a new subtask.
*   `GET /api/tasks/:taskId/subtasks`: Get all subtasks for a task.
*   `PATCH /api/subtasks/:id`: Update a subtask (title, completion).
*   `DELETE /api/subtasks/:id`: Delete a subtask.

### Components
*   `src/types/subtask.types.ts`: Interfaces and DTOs.
*   `src/repositories/subtask.repository.ts`: Database operations.
*   `src/services/subtask.service.ts`: Business logic.
*   `src/controllers/subtask.controller.ts`: Request handling.
