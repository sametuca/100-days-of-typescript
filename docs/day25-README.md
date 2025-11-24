# Day 25: Advanced Search & Filtering

## 📝 Overview
Day 25 focuses on enhancing the task retrieval capabilities by implementing advanced search, filtering, and sorting options. This allows users to find specific tasks efficiently using multiple criteria such as status, priority, date ranges, and text search.

## 🚀 Features Implemented

### 1. Advanced Filtering
- **Multiple Status Selection**: Filter tasks by multiple statuses simultaneously (e.g., `status=TODO&status=IN_PROGRESS`).
- **Multiple Priority Selection**: Filter tasks by multiple priorities (e.g., `priority=HIGH&priority=URGENT`).
- **Date Range Filtering**: Filter tasks created within a specific date range using `startDate` and `endDate`.

### 2. Sorting
- **Dynamic Sorting**: Sort tasks by various fields:
  - `createdAt` (default)
  - `updatedAt`
  - `title`
  - `priority`
  - `dueDate`
- **Sort Order**: Support for Ascending (`asc`) and Descending (`desc`) orders.

### 3. Full-Text Search
- **Text Search**: Search for tasks by matching text in `title` or `description`.

## 🛠️ Technical Details

### API Endpoints

#### `GET /tasks`
Retrieves a paginated list of tasks with optional filters.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | `number` | Page number (default: 1) | `1` |
| `limit` | `number` | Items per page (default: 10) | `20` |
| `search` | `string` | Text to search in title/description | `bug fix` |
| `status` | `string[]` | Filter by status (can be multiple) | `TODO` |
| `priority` | `string[]` | Filter by priority (can be multiple) | `HIGH` |
| `startDate` | `string` | Filter tasks created after this date (ISO 8601) | `2023-01-01T00:00:00Z` |
| `endDate` | `string` | Filter tasks created before this date (ISO 8601) | `2023-12-31T23:59:59Z` |
| `sortBy` | `string` | Field to sort by | `dueDate` |
| `sortOrder` | `string` | Sort direction (`asc` or `desc`) | `asc` |

### Example Requests

**1. Get high priority tasks that are TODO or IN_PROGRESS:**
```http
GET /tasks?priority=HIGH&status=TODO&status=IN_PROGRESS
```

**2. Search for "meeting" in tasks created in November 2023, sorted by due date:**
```http
GET /tasks?search=meeting&startDate=2023-11-01T00:00:00Z&endDate=2023-11-30T23:59:59Z&sortBy=dueDate&sortOrder=asc
```

## 🧪 Testing
- Verified multiple status/priority filtering.
- Tested date range filtering with various intervals.
- Confirmed sorting works for all supported fields.
- Validated pagination works correctly with filters applied.
