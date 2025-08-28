# API Documentation

This document provides comprehensive documentation for the RFP management system's API.

## Base URL

`http://localhost:3000/api`

## Authentication

Most endpoints require a JSON Web Token (JWT) for authentication. The JWT should be included in the `Authorization` header as a Bearer token:

`Authorization: Bearer <your_jwt>`

## WebSocket Connection

For real-time notifications, connect to the WebSocket server:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});

// Listen for notifications
socket.on('rfp_published', (data) => {
  console.log('New RFP published:', data);
});

socket.on('response_submitted', (data) => {
  console.log('New response submitted:', data);
});

socket.on('rfp_status_changed', (data) => {
  console.log('RFP status changed:', data);
});

socket.on('response_status_changed', (data) => {
  console.log('Response status changed:', data);
});

socket.on('rfp_awarded', (data) => {
  console.log('RFP awarded:', data);
});
```

## Endpoints

### Health Check

#### `GET /health`

Check the health status of the application and its services.

**Responses:**

- `200 OK`: Application is healthy
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "websocket": "active",
    "api": "running"
  }
}
```

- `503 Service Unavailable`: Application is unhealthy
```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "database": "disconnected",
    "websocket": "active",
    "api": "running"
  },
  "error": "Database connection failed"
}
```

### Authentication

#### `POST /auth/register`

Registers a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "roleName": "Buyer"
}
```

**Responses:**

- `201 Created`: User registered successfully.
- `400 Bad Request`: Missing required fields or invalid role.
- `409 Conflict`: Email already exists.

#### `POST /auth/login`

Logs in a user and returns a JWT.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Responses:**

- `200 OK`: Login successful. Returns a JWT.
- `401 Unauthorized`: Invalid credentials.

#### `POST /auth/logout`

Logout a user (creates audit trail).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Responses:**
- `200 OK`: Logout successful
  ```json
  {
    "message": "Logged out successfully",
    "logout_time": "2024-01-15T10:30:00.000Z"
  }
  ```
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

### Dashboard

#### `GET /dashboard`

Get role-specific dashboard data.

**Responses:**

- `200 OK`: Dashboard data for the user's role.
- `401 Unauthorized`: Missing or invalid JWT.

**Buyer Dashboard Response:**
```json
{
  "recentRfps": [...],
  "recentResponses": [...],
  "stats": {
    "totalRfps": 10,
    "publishedRfps": 5,
    "totalResponses": 25,
    "pendingReviews": 3
  }
}
```

**Supplier Dashboard Response:**
```json
{
  "recentRfps": [...],
  "recentResponses": [...],
  "stats": {
    "totalResponses": 15,
    "approvedResponses": 8,
    "pendingResponses": 3,
    "awardedResponses": 2
  }
}
```

#### `GET /dashboard/stats`

Get detailed dashboard statistics.

### RFPs

#### `GET /rfp`

Get published RFPs (for suppliers) or user's RFPs (for buyers).

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Items per page
- `search` (string): Search term
- `status` (string): Filter by status (Draft, Published, Closed, Awarded, Cancelled)
- `gte___budget_min` (number): Minimum budget filter
- `lte___budget_max` (number): Maximum budget filter
- `gte___deadline` (date): From date filter
- `lte___deadline` (date): To date filter

#### `GET /rfp/my`

Get user's own RFPs (buyers only).

**Query Parameters:** Same as above

#### `POST /rfp`

Create a new RFP.

**Request Body:**
```json
{
  "title": "Website Development RFP",
  "description": "We need a new website",
  "requirements": "Modern design, responsive",
  "budget_min": 5000,
  "budget_max": 15000,
  "deadline": "2024-02-15T00:00:00.000Z"
}
```

#### `GET /rfp/:id`

Get specific RFP details.

#### `PUT /rfp/:id`

Update an RFP.

#### `DELETE /rfp/:id`

Delete an RFP (draft only).

#### `PUT /rfp/:id/publish`

Publish an RFP.

#### `PUT /rfp/:id/close`

Close an RFP.

#### `PUT /rfp/:id/cancel`

Cancel an RFP.

#### `PUT /rfp/:id/award`

Award an RFP to a specific response.

**Request Body:**
```json
{
  "responseId": "response-uuid"
}
```

### RFP Versions

#### `POST /rfp/:id/versions`

Create a new version of an RFP.

#### `GET /rfp/:id/versions`

Get all versions of an RFP.

#### `PUT /rfp/:id/versions/:versionId`

Update a specific version.

#### `DELETE /rfp/:id/versions/:versionId`

Delete a version.

### Responses

#### `GET /rfp/my-responses`

Get user's responses (suppliers only).

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Items per page
- `search` (string): Search term
- `status` (string): Filter by status (Draft, Submitted, Under Review, Approved, Rejected, Awarded)
- `gte___proposed_budget` (number): Minimum budget filter
- `lte___proposed_budget` (number): Maximum budget filter
- `gte___created_at` (date): From date filter
- `lte___created_at` (date): To date filter

#### `GET /rfp/:id/responses`

Get responses for a specific RFP (buyers only).

#### `POST /rfp/:id/responses`

Submit a response to an RFP.

**Request Body:**
```json
{
  "proposed_budget": 12000,
  "timeline": "3 months",
  "cover_letter": "We are excited to work on this project..."
}
```

#### `GET /rfp/responses/:responseId`

Get specific response details.

#### `PUT /rfp/responses/:responseId`

Update a response.

#### `DELETE /rfp/responses/:responseId`

Delete a response.

#### `PUT /rfp/responses/:responseId/submit`

Submit a response (change status to Submitted).

#### `PUT /rfp/responses/:responseId/approve`

Approve a response (buyers only).

#### `PUT /rfp/responses/:responseId/reject`

Reject a response (buyers only).

**Request Body:**
```json
{
  "rejection_reason": "Budget too high"
}
```

#### `PUT /rfp/responses/:responseId/award`

Award a response (buyers only).

#### `PUT /rfp/responses/:responseId/move-to-review`

Move response to review status (buyers only).

#### `PUT /rfp/responses/:responseId/reopen`

Reopen a rejected response for editing (buyers and admins).

**Required Permission:** `supplier_response.reopen`

**Authorization:** Buyer (for their own RFPs) or Admin (for any response)

**Request Body:** None

**Response:**
```json
{
  "id": "response-uuid",
  "rfp_id": "rfp-uuid",
  "supplier_id": "supplier-uuid",
  "status": {
    "code": "Draft",
    "label": "Draft"
  },
  "proposed_budget": 50000,
  "timeline": "3 months",
  "cover_letter": "Updated proposal...",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "supplier": {
    "id": "supplier-uuid",
    "name": "John Supplier",
    "email": "john@supplier.com"
  },
  "rfp": {
    "id": "rfp-uuid",
    "title": "Software Development RFP",
    "buyer": {
      "name": "Jane Buyer",
      "email": "jane@buyer.com"
    }
  }
}
```

**Notifications Sent:**
- Database notification to supplier
- Real-time WebSocket notification to supplier
- Email notification to supplier
- Database notification to all admins
- Real-time WebSocket notification to all admins

### Documents

#### `POST /rfp/documents`

Upload document for RFP.

**Request Body:** Multipart form data
- `file`: Document file
- `rfp_version_id`: RFP version ID
- `file_type`: Document type (pdf, image, docx)

#### `POST /rfp/responses/:responseId/documents`

Upload document for response.

**Request Body:** Multipart form data
- `file`: Document file
- `file_type`: Document type

#### `DELETE /rfp/documents/:documentId`

Delete a document.

**Request Body:**
```json
{
  "rfp_version_id": "version-uuid" // or "responseId": "response-uuid"
}
```

### Notifications

#### `GET /notifications`

Get user's notifications.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `unread_only` (boolean): Filter unread notifications

#### `PUT /notifications/:id/read`

Mark notification as read.

#### `PUT /notifications/read-all`

Mark all notifications as read.

### Audit Trail

#### `GET /audit/my`

Get user's audit trail.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search term
- `action` (string): Filter by action type
- `gte___created_at` (date): From date filter
- `lte___created_at` (date): To date filter

#### `GET /audit/target/:targetType/:targetId`

Get audit trail for specific target.

#### `GET /audit/all`

Get all audit trails (admin only).

### Admin Panel

#### `GET /admin/config`

Get system configuration (admin only).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Responses:**
- `200 OK`: System configuration retrieved
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions

#### `PUT /admin/config`

Update system configuration (admin only).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "email": {
    "smtpHost": "smtp.gmail.com",
    "smtpPort": "587",
    "emailNotifications": true
  },
  "fileUpload": {
    "maxFileSize": 10,
    "allowedFileTypes": ["pdf", "doc", "docx"]
  },
  "security": {
    "sessionTimeout": 60,
    "maxLoginAttempts": 5
  }
}
```

#### `GET /admin/database/stats`

Get database statistics (admin only).

#### `POST /admin/database/test`

Test database connection (admin only).

#### `POST /admin/database/backup`

Create database backup (admin only).

#### `POST /admin/database/optimize`

Optimize database (admin only).

#### `POST /admin/export/users`

Export users data (admin only).

**Request Body:**
```json
{
  "format": "csv",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "filters": {
    "role": "Supplier"
  }
}
```

#### `POST /admin/export/rfps`

Export RFPs data (admin only).

#### `POST /admin/export/responses`

Export responses data (admin only).

#### `POST /admin/export/audit-logs`

Export audit logs data (admin only).

#### `POST /admin/reports/generate`

Generate system report (admin only).

**Request Body:**
```json
{
  "reportType": "user-activity",
  "format": "pdf",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  }
}
```

#### `POST /admin/reports/schedule`

Schedule report generation (admin only).

**Request Body:**
```json
{
  "reportType": "user-activity",
  "schedule": {
    "frequency": "weekly",
    "time": "09:00",
    "recipients": ["admin@example.com"]
  }
}
```

### User Management

#### `GET /admin/users`

Get all users with pagination and filtering (admin only).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for name or email
- `role` (optional): Filter by role (Buyer, Supplier, Admin)
- `status` (optional): Filter by status (active, inactive)

**Responses:**
- `200 OK`: Users list with pagination
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions

#### `GET /admin/users/:id`

Get specific user details (admin only).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Responses:**
- `200 OK`: User details
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found

#### `PUT /admin/users/:id`

Update user information (admin only).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role_id": "role-uuid"
}
```

**Responses:**
- `200 OK`: User updated successfully
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found

#### `PUT /admin/users/:id/toggle-status`

Toggle user status (activate/deactivate) (admin only).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "action": "activate" // or "deactivate"
}
```

**Responses:**
- `200 OK`: User status toggled successfully
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found

#### `DELETE /admin/users/:id`

Delete user (admin only).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Responses:**
- `200 OK`: User deleted successfully
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found

#### `GET /admin/users/stats`

Get user statistics (admin only).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Responses:**
- `200 OK`: User statistics retrieved successfully
  ```json
  {
    "totalUsers": 150,
    "userGrowthLastMonth": "+12%",
    "activeUsers": 89,
    "activeUserGrowthLastWeek": "+5%",
    "totalBuyers": 45,
    "totalSuppliers": 105
  }
  ```
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions

#### `POST /admin/users`

Create a new user (admin only).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "roleName": "Buyer"
}
```

**Responses:**
- `201 Created`: User created successfully
- `400 Bad Request`: Validation error
- `409 Conflict`: User with this email already exists
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions

#### `GET /admin/analytics`

Get comprehensive analytics data (admin only).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Responses:**
- `200 OK`: Analytics data retrieved successfully
  ```json
  {
    "totalRfps": 342,
    "totalResponses": 1289,
    "newRfpsThisMonth": 23,
    "newResponsesThisMonth": 45,
    "monthlyGrowthData": [
      {
        "month": "Jan",
        "users": 12,
        "rfps": 5,
        "responses": 18
      }
    ],
    "rfpStatusDistribution": [
      {
        "status": "Draft",
        "count": 25,
        "percentage": 15
      }
    ],
    "responseMetrics": {
      "avgResponseTime": "2.3 days",
      "responseRate": "78%",
      "successRate": "65%",
      "avgResponsesPerRfp": 3.8
    },
    "systemMetrics": {
      "totalLogins": 89,
      "errorRate": "0.1",
      "avgSessionDuration": "12m 30s"
    },
    "topPerformingBuyers": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "rfpsCreated": 15
      }
    ],
    "topPerformingSuppliers": [
      {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "responsesSubmitted": 25
      }
    ],
    "rfpCategoryDistribution": [
      {
        "category": "Technology",
        "count": 45,
        "percentage": 35
      }
    ],
    "responseTimeMetrics": [
      {
        "time_range": "Within 24h",
        "count": 45
      }
    ]
  }
  ```
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions

#### `GET /admin/roles`

Get all roles with their permissions (admin only).

**Required Permission:** `admin.manage_roles`

**Headers:**
- `Authorization: Bearer <token>` (required)

**Responses:**
- `200 OK`: Roles retrieved successfully
  ```json
  {
    "roles": [
      {
        "id": "role-uuid",
        "name": "Buyer",
        "description": "Can create and manage RFPs",
        "permissions": {
          "rfp": {
            "create": { "allowed": true },
            "update": { "allowed": true, "scope": "own" },
            "delete": { "allowed": true, "scope": "own" },
            "view": { "allowed": true }
          },
          "supplier_response": {
            "view": { "allowed": true, "scope": "rfp_owner" },
            "approve": { "allowed": true, "scope": "rfp_owner" },
            "reject": { "allowed": true, "scope": "rfp_owner" }
          }
        }
      }
    ]
  }
  ```
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions

#### `GET /admin/roles/:roleName/permissions`

Get permissions for a specific role (admin only).

**Required Permission:** `admin.manage_roles`

**Headers:**
- `Authorization: Bearer <token>` (required)

**Parameters:**
- `roleName`: Role name (Buyer, Supplier, Admin)

**Responses:**
- `200 OK`: Role permissions retrieved successfully
  ```json
  {
    "roleName": "Buyer",
    "permissions": {
      "rfp": {
        "create": { "allowed": true },
        "update": { "allowed": true, "scope": "own" }
      }
    }
  }
  ```
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Role not found

#### `PUT /admin/roles/:roleName/permissions`

Update permissions for a specific role (admin only).

**Required Permission:** `admin.manage_roles`

**Headers:**
- `Authorization: Bearer <token>` (required)

**Parameters:**
- `roleName`: Role name (Buyer, Supplier, Admin)

**Request Body:**
```json
{
  "permissions": {
    "rfp": {
      "create": { "allowed": true },
      "update": { "allowed": true, "scope": "own" }
    },
    "supplier_response": {
      "view": { "allowed": true, "scope": "rfp_owner" }
    }
  }
}
```

**Responses:**
- `200 OK`: Permissions updated successfully
  ```json
  {
    "message": "Role permissions updated successfully",
    "roleName": "Buyer",
    "permissions": {
      "rfp": {
        "create": { "allowed": true }
      }
    }
  }
  ```
- `400 Bad Request`: Invalid permissions structure
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Role not found

**Notifications Sent:**
- Database notification to all admin users
- Real-time WebSocket notification to all admin users
- Email notification to all admin users

#### `POST /admin/reports/schedule`

Schedule report generation (admin only).

**Request Body:**
```json
{
  "reportType": "rfp-performance",
  "schedule": {
    "frequency": "weekly",
    "time": "09:00",
    "recipients": ["admin@example.com"]
  }
}
```

## Status Codes

### RFP Statuses
- `Draft`: Initial state, only visible to creator
- `Published`: Visible to all suppliers
- `Closed`: No longer accepting responses
- `Awarded`: RFP has been awarded to a supplier
- `Cancelled`: RFP has been cancelled

### Response Statuses
- `Draft`: Initial state, only visible to supplier
- `Submitted`: Submitted for review
- `Under Review`: Being reviewed by buyer
- `Approved`: Approved by buyer
- `Rejected`: Rejected by buyer
- `Awarded`: Response has been awarded

## Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ]
}
```

## Pagination

Most list endpoints support pagination with the following response format:

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

## Filtering

Many endpoints support advanced filtering using the following format:

- `eq___field`: Equal to value
- `neq___field`: Not equal to value
- `gte___field`: Greater than or equal to value
- `lte___field`: Less than or equal to value
- `gt___field`: Greater than value
- `lt___field`: Less than value
- `contains___field`: Contains substring
- `in___field`: Value in array (comma-separated)
- `not_in___field`: Value not in array (comma-separated)

## File Upload

File uploads support the following formats:
- **Documents**: PDF, DOC, DOCX
- **Images**: JPG, PNG, GIF
- **Maximum size**: 10MB per file

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **File uploads**: 10 requests per minute
- **Other endpoints**: 100 requests per minute

## WebSocket Events

### Client to Server
- `join_room`: Join a specific room for notifications
- `leave_room`: Leave a room

### Server to Client
- `rfp_published`: New RFP published
- `response_submitted`: New response submitted
- `rfp_status_changed`: RFP status updated
- `response_status_changed`: Response status updated
- `rfp_awarded`: RFP awarded to supplier
- `notification`: New notification received
