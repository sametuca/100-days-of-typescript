# Day 24: Collaboration & Activity Logs

## Overview
In this update, we added collaboration features to the DevTracker API. Users can now comment on tasks, and all key activities (status changes, priority updates, comments) are automatically logged to an activity history.

## Changes

### Database Schema
- **New Table `comments`**: Stores task comments.
- **New Table `activity_logs`**: Stores the history of actions performed on tasks.

### New Features

#### 1. Task Comments
- **Create Comment**: `POST /api/v1/tasks/:taskId/comments`
- **List Comments**: `GET /api/v1/tasks/:taskId/comments`
- **Update Comment**: `PUT /api/v1/comments/:id`
- **Delete Comment**: `DELETE /api/v1/comments/:id`

#### 2. Activity History
- **Automatic Logging**:
  - Status changes (e.g., TODO -> IN_PROGRESS)
  - Priority changes (e.g., MEDIUM -> HIGH)
  - New comments
- **View History**: `GET /api/v1/tasks/:taskId/activity-logs`

### Technical Implementation
- **Repositories**: `CommentRepository`, `ActivityRepository`
- **Services**: `CommentService`, `ActivityService`
- **Integration**: `TaskService` now integrates with `ActivityService` to log changes automatically.

## Verification
We ran a verification script `scripts/verify-day24.ts` which performed the following steps:
1. Created a test user and task.
2. Updated task status -> Verified activity log created.
3. Added a comment -> Verified comment created and activity log created.
4. Retrieved task history -> Verified logs contain correct details.
5. Updated and deleted comment -> Verified success.

## Example Activity Log Response
```json
[
  {
    "id": "uuid...",
    "task_id": "task_123",
    "user_id": "user_456",
    "action_type": "STATUS_CHANGE",
    "details": {
      "from": "TODO",
      "to": "IN_PROGRESS"
    },
    "created_at": "2023-10-27T10:00:00Z"
  },
  {
    "id": "uuid...",
    "task_id": "task_123",
    "user_id": "user_456",
    "action_type": "COMMENT_ADDED",
    "details": {
      "comment_id": "comment_789"
    },
    "created_at": "2023-10-27T10:05:00Z"
  }
]
```
