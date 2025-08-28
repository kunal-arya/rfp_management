# Database Schema

This document outlines the database schema for the RFP management system, managed by Prisma.

## Overview

This is a PostgreSQL database schema designed for a comprehensive RFP (Request for Proposal) management system. The system supports:

- **Multi-role User Management**: Buyers, Suppliers, and Admins
- **RFP Lifecycle Management**: Draft → Published → Closed → Awarded
- **Response Management**: Draft → Submitted → Under Review → Approved/Rejected → Awarded
- **Document Management**: File uploads with soft delete capability
- **Audit Trail**: Complete logging of all user actions
- **Real-time Notifications**: WebSocket-based notifications with email integration

## Database Design
![alt text](database_design.png)

## Models

### `RFPStatus`

Represents the status of an RFP.

| Field  | Type     | Description                                   |
|--------|----------|-----------------------------------------------|
| `id`   | `String` | Unique identifier (UUID).                     |
| `code` | `String` | Unique status code (e.g., Draft, Published, Closed, Awarded, Cancelled).  |
| `label`| `String` | Human-readable label for the status.          |
| `rfps` | `RFP[]`  | RFPs associated with this status.             |

**Status Lifecycle:**
- `Draft` → `Published` → `Closed` → `Awarded`
- `Draft`/`Published` → `Cancelled`
- `Published`/`Closed` → `Awarded` (when response awarded)

---

### `Role`

Represents a user role in the system (e.g., "Buyer", "Supplier").

| Field         | Type     | Description                                                 |
|---------------|----------|-------------------------------------------------------------|
| `id`          | `String` | Unique identifier for the role (UUID).                      |
| `name`        | `String` | The name of the role (e.g., "Buyer", "Supplier", "Admin"). Must be unique.        |
| `description` | `String?`| An optional description of the role.                        |
| `permissions` | `Json`   | A JSON object defining the permissions for this role.       |

**Available Roles:**
- **Buyer**: Can create, manage, and award RFPs
- **Supplier**: Can view and respond to published RFPs
- **Admin**: Full system access including user management, analytics, and system configuration
| `users`       | `User[]` | A list of users who have this role.                         |

---

### `User`

Represents a user of the application.

| Field               | Type                | Description                                                 |
|---------------------|---------------------|-------------------------------------------------------------|
| `id`                | `String`            | Unique identifier for the user (UUID).                      |
| `name`              | `String`            | The user's full name. Default: "User"                       |
| `email`             | `String`            | The user's email address. Must be unique.                   |
| `password_hash`     | `String`            | The user's hashed password.                                 |
| `role_id`           | `String`            | Foreign key for the user's role.                            |
| `role`              | `Role`              | The role assigned to the user.                              |
| `status`            | `String`            | User status ('active' or 'inactive'). Default: 'active'     |
| `created_at`        | `DateTime`          | Timestamp of when the user was created.                     |
| `updated_at`        | `DateTime`          | Timestamp of when the user was last updated.                |
| `rfps`              | `RFP[]`             | RFPs created by this user (Buyer role).                     |
| `supplier_responses`| `SupplierResponse[]` | Responses submitted by this user (Supplier role).           |
| `documents`         | `Document[]`        | Documents uploaded by this user.                            |
| `audit_trails`      | `AuditTrail[]`      | Audit trail entries for this user's actions.                |
| `notifications`     | `Notification[]`    | Notifications sent to this user.                            |

---

## System Features

### Authentication & Authorization
- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access Control (RBAC)**: Dynamic permissions stored in database with three roles: Buyer, Supplier, Admin
- **Permission Middleware**: Fine-grained access control with scopes and status checks
- **Admin Panel**: Complete administrative interface with system management capabilities

### Real-time Notifications
- **WebSocket Integration**: Socket.IO for real-time updates
- **Email Notifications**: SendGrid integration for email alerts
- **Event-driven Architecture**: Automatic notifications on status changes

### Document Management
- **File Upload**: Cloudinary integration for document storage
- **Version Control**: Document versioning and history tracking
- **Permission-based Access**: Role-specific document access

### Search & Filtering
- **Database Search**: Full-text search across RFP content
- **Advanced Filtering**: Multi-field filtering with pagination
- **Role-specific Views**: Different data views for buyers and suppliers

---

### `RFP`

Represents a Request for Proposal with versioning and soft delete support.

| Field               | Type                  | Description                                                 |
|---------------------|-----------------------|-------------------------------------------------------------|
| `id`                | `String`              | Unique identifier for the RFP (UUID).                       |
| `title`             | `String`              | The title of the RFP.                                       |
| `status_id`         | `String`              | Foreign key for the status.                                 |
| `status`            | `RFPStatus`           | The current status of the RFP.                              |
| `buyer_id`          | `String`              | Foreign key for the buyer.                                  |
| `buyer`             | `User`                | The buyer who created the RFP.                              |
| `awarded_response_id`| `String?`            | Foreign key for the awarded response (unique).              |
| `awarded_response`  | `SupplierResponse?`   | The winning response (reverse relation).                    |
| `current_version_id`| `String?`            | Foreign key for the current version (unique).               |
| `current_version`   | `RFPVersion?`        | The current active version of this RFP.                     |
| `created_at`        | `DateTime`           | Timestamp of when the RFP was created.                      |
| `updated_at`        | `DateTime`           | Timestamp of when the RFP was last updated.                 |
| `deleted_at`        | `DateTime?`          | Soft delete timestamp (null = active).                      |
| `closed_at`         | `DateTime?`          | Timestamp when RFP was closed.                              |
| `awarded_at`        | `DateTime?`          | Timestamp when RFP was awarded.                             |
| `versions`          | `RFPVersion[]`       | All versions of this RFP.                                   |
| `supplier_responses`| `SupplierResponse[]` | Responses submitted for this RFP.                           |

**Key Features:**
- **Soft Delete**: `deleted_at` field enables safe deletion without data loss
- **Versioning**: Each RFP can have multiple versions with `current_version` tracking
- **Award Management**: Tracks winning response and award timestamp
- **Lifecycle Tracking**: Complete timestamp tracking from creation to award

---

### `RFPVersion`

Represents a specific version of an RFP.

| Field            | Type        | Description                                                 |
|------------------|-------------|-------------------------------------------------------------|
| `id`             | `String`    | Unique identifier for the RFP version (UUID).               |
| `rfp_id`         | `String`    | Foreign key for the RFP.                                    |
| `rfp`            | `RFP`       | The RFP this version belongs to.                            |
| `version_number` | `Int`       | The version number.                                         |
| `description`    | `String`    | Description of the RFP.                                     |
| `requirements`   | `String`    | Requirements specified in the RFP.                          |
| `budget_min`     | `Float?`    | Minimum budget (optional).                                  |
| `budget_max`     | `Float?`    | Maximum budget (optional).                                  |
| `deadline`       | `DateTime`  | Deadline for the RFP.                                       |
| `notes`          | `String?`   | Optional notes for this version.                            |
| `created_at`     | `DateTime`  | Timestamp of when this version was created.                 |
| `documents`      | `Document[]`| Documents attached to this version.                         |

---

### `Document`

Represents a file uploaded to the system with soft delete support.

| Field               | Type                | Description                                                 |
|---------------------|---------------------|-------------------------------------------------------------|
| `id`                | `String`            | Unique identifier for the document (UUID).                  |
| `file_name`         | `String`            | The name of the uploaded file.                              |
| `url`               | `String`            | Cloudinary URL where the file is stored.                    |
| `file_type`         | `String?`           | MIME type of the file (pdf, image, docx, etc.).             |
| `created_at`        | `DateTime`          | Timestamp when the document was uploaded.                   |
| `deleted_at`        | `DateTime?`         | Soft delete timestamp (null = active).                      |
| `uploader_id`       | `String`            | Foreign key for the user who uploaded the document.         |
| `uploader`          | `User`              | The user who uploaded the document.                         |
| `rfp_response_id`   | `String?`           | Foreign key for supplier response (if attached to response).|
| `rfp_response`      | `SupplierResponse?` | The supplier response this document belongs to.             |
| `rfp_version_id`    | `String?`           | Foreign key for RFP version (if attached to RFP).           |
| `rfp_version`       | `RFPVersion?`       | The RFP version this document is attached to.               |

**Key Features:**
- **Soft Delete**: Documents can be marked as deleted without actual removal
- **Dual Association**: Documents can be attached to either RFP versions or supplier responses
- **Cloud Storage**: Files are stored in Cloudinary with URLs for access
- **Type Tracking**: MIME types help with file handling and display

---

### `SupplierResponseStatus`

Represents the status of a supplier's response.

| Field      | Type                  | Description                                   |
|------------|-----------------------|-----------------------------------------------|
| `id`       | `String`              | Unique identifier (UUID).                     |
| `code`     | `String`              | Unique status code (e.g., Draft, Submitted, Under Review, Approved, Rejected, Awarded).  |
| `label`    | `String`              | Human-readable label.                         |
| `responses`| `SupplierResponse[]`  | Responses with this status.                   |

**Status Lifecycle:**
- `Draft` → `Submitted` → `Under Review` → `Approved`/`Rejected`
- `Approved` → `Awarded` (only one per RFP)

---

### `SupplierResponse`

Represents a response from a supplier to an RFP.

| Field           | Type                    | Description                                                 |
|-----------------|-------------------------|-------------------------------------------------------------|
| `id`            | `String`                | Unique identifier (UUID).                                   |
| `rfp_id`        | `String`                | Foreign key for the RFP.                                    |
| `rfp`           | `RFP`                   | The RFP this response is for.                               |
| `supplier_id`   | `String`                | Foreign key for the supplier.                               |
| `supplier`      | `User`                  | The supplier who submitted the response.                    |
| `status_id`     | `String`                | Foreign key for the status.                                 |
| `status`        | `SupplierResponseStatus`| The current status of the response.                         |
| `proposed_budget`| `Float?`               | Proposed budget amount (optional).                          |
| `timeline`      | `String?`               | Proposed timeline/delivery schedule (optional).             |
| `cover_letter`  | `String?`               | Optional cover letter or proposal summary.                  |
| `rejection_reason`| `String?`             | Reason for rejection (populated when rejected).             |
| `documents`     | `Document[]`            | Documents attached to this response.                        |
| `created_at`    | `DateTime`              | Timestamp when the response was first created.              |
| `updated_at`    | `DateTime`              | Timestamp when the response was last updated.               |
| `submitted_at`  | `DateTime?`             | Timestamp when draft was submitted for review.              |
| `reviewed_at`   | `DateTime?`             | Timestamp when response was reviewed.                       |
| `decided_at`    | `DateTime?`             | Timestamp when final decision was made (approved/rejected). |
| `awarded_for_rfp`| `RFP?`                | Reverse relation for awarded response (only one per RFP).   |

**Response Status Lifecycle:**
- `Draft` → `Submitted` → `Under Review` → `Approved`/`Rejected`
- `Approved` → `Awarded` (only one response per RFP can be awarded)
- `Rejected` → `Draft` (can be reopened for editing)

**Key Features:**
- **Complete Audit Trail**: Timestamp tracking at every stage
- **Flexible Content**: Optional budget, timeline, and cover letter
- **Document Support**: Multiple documents can be attached
- **Rejection Tracking**: Detailed rejection reasons for transparency
- **Award Management**: Only one response per RFP can be awarded

---

### `AuditTrail`

Comprehensive audit trail for tracking all user actions and system events.

| Field         | Type       | Description                                                 |
|---------------|------------|-------------------------------------------------------------|
| `id`          | `String`   | Unique identifier (UUID).                                   |
| `user_id`     | `String?`  | Foreign key for the user who performed the action.          |
| `user`        | `User?`    | The user who performed the action (null for system actions).|
| `action`      | `String`   | The action performed (e.g., RFP_CREATED, USER_LOGIN).       |
| `target_type` | `String?`  | The type of object affected (e.g., RFP, SupplierResponse).  |
| `target_id`   | `String?`  | ID of the affected object.                                  |
| `details`     | `Json?`    | Additional details about the action in JSON format.         |
| `created_at`  | `DateTime` | Timestamp when the action occurred.                         |

**Audit Actions Tracked:**
- **User Actions**: LOGIN, LOGOUT, USER_REGISTERED
- **RFP Management**: RFP_CREATED, RFP_UPDATED, RFP_DELETED, RFP_PUBLISHED
- **Response Management**: RESPONSE_CREATED, RESPONSE_SUBMITTED, RESPONSE_MOVED_TO_REVIEW, RESPONSE_APPROVED, RESPONSE_REJECTED, RESPONSE_REOPENED, RESPONSE_AWARDED
- **Document Management**: DOCUMENT_UPLOADED, DOCUMENT_DELETED
- **Admin Actions**: USER_CREATED, USER_UPDATED, USER_STATUS_CHANGED, PERMISSIONS_UPDATED, DATA_EXPORTED, REPORT_GENERATED

**Key Features:**
- **Complete Traceability**: Every CRUD operation is logged
- **User Attribution**: Links actions to specific users
- **Rich Details**: JSON field stores additional context
- **System Actions**: Supports actions without user attribution

---

### `NotificationTemplate`

Predefined templates for system notifications with placeholder support.

| Field        | Type            | Description                                                 |
|--------------|-----------------|-------------------------------------------------------------|
| `id`         | `String`        | Unique identifier (UUID).                                   |
| `code`       | `String`        | Unique template code (primary key).                         |
| `title`      | `String`        | Notification title template.                                |
| `message`    | `String`        | Message template with placeholders (e.g., {{rfp_title}}).   |
| `channel`    | `String`        | Delivery channel: 'EMAIL', 'IN_APP', or 'BOTH'.             |
| `created_at` | `DateTime`      | When the template was created.                              |
| `notifications`| `Notification[]`| All notifications using this template.                      |

**Available Notification Templates:**
- `USER_CREATED`: New user registration notification
- `RFP_CREATED`: RFP creation notification for admins
- `RFP_PUBLISHED`: RFP publishing notification for suppliers
- `RESPONSE_DRAFT_CREATED`: Draft response creation notification for admins
- `RESPONSE_SUBMITTED`: Response submission notification for buyers
- `RESPONSE_MOVED_TO_REVIEW`: Response moved to review notification
- `RESPONSE_APPROVED`: Response approval notification
- `RESPONSE_REJECTED`: Response rejection notification
- `RESPONSE_REOPENED`: Response reopened for editing notification
- `RESPONSE_AWARDED`: Response awarded notification

---

### `Notification`

Individual notification instances sent to users.

| Field         | Type                   | Description                                                 |
|---------------|------------------------|-------------------------------------------------------------|
| `id`          | `String`               | Unique identifier (UUID).                                   |
| `user_id`     | `String`               | Foreign key for the recipient user.                         |
| `user`        | `User`                 | The user receiving the notification.                        |
| `template_code`| `String`              | Foreign key referencing the notification template.          |
| `template`    | `NotificationTemplate` | The notification template used.                             |
| `data`        | `Json?`                | Runtime data to replace template placeholders.              |
| `is_read`     | `Boolean`              | Whether the user has read the notification. Default: false |
| `created_at`  | `DateTime`             | When the notification was created.                          |
| `sent_at`     | `DateTime?`            | When the notification was sent/delivered.                   |

**Notification System Features:**
- **Template-based**: Reusable templates with dynamic content
- **Multi-channel**: Support for in-app, email, or both
- **Read Tracking**: Users can mark notifications as read
- **Real-time Delivery**: WebSocket integration for instant notifications
- **Bulk Operations**: Mark all notifications as read functionality
