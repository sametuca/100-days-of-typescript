# Day 24: File Attachments for Tasks

## 📝 Overview
Day 24 focuses on implementing file attachment capabilities for tasks. This feature allows users to upload and attach files (images, documents, PDFs) to their tasks, enhancing collaboration and information sharing.

## 🚀 Features Implemented

### 1. File Upload Infrastructure
- **Multer Middleware**: Configured `multer` for handling `multipart/form-data` requests.
- **File Validation**: Added validation for file types (images, PDFs, documents) and size limits (5MB).
- **Storage Strategy**: Local disk storage in `uploads/` directory with unique filename generation.

### 2. Database Schema Updates
- **Tasks Table**: Added `attachments` column to store file metadata as JSON string.
- **Task Entity**: Updated `Task` interface to include `attachments` array with properties:
  - `filename`: Original name of the file
  - `path`: Storage path
  - `mimetype`: File MIME type
  - `size`: File size in bytes
  - `uploadedAt`: Upload timestamp

### 3. API Endpoints
- **POST /api/tasks/:id/attachments**: Endpoint to upload a file for a specific task.
  - Validates task existence and user ownership.
  - Uses `upload.single('file')` middleware.
  - Returns the updated task object with the new attachment.

### 4. Repository & Service Layer
- **TaskRepository**:
  - Updated `create`, `update`, and `parseTasks` to handle `attachments` JSON serialization/deserialization.
  - Added `addAttachment` method for atomic attachment additions.
- **TaskService**:
  - Added `uploadAttachment` method to handle business logic and file metadata creation.

## 🛠️ Technical Details

### Data Structure
Attachments are stored in the database as a JSON array:
```json
[
  {
    "filename": "project-specs.pdf",
    "path": "uploads/1716382910234-582910-project-specs.pdf",
    "mimetype": "application/pdf",
    "size": 1024567,
    "uploadedAt": "2024-05-22T14:21:50.234Z"
  }
]
```

### API Usage
**Upload a File:**
```http
POST /api/tasks/{taskId}/attachments
Content-Type: multipart/form-data

file: (binary content)
```

## 🧪 Testing
- Verified file upload via API.
- Checked database storage of attachment metadata.
- Verified file type and size validation.
- Confirmed that only task owners can upload attachments.
