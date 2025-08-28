# RFPFlow - Request for Proposal Management System

A comprehensive full-stack RFP (Request for Proposal) contract management system built with modern technologies and AI assistance, demonstrating production-ready application development capabilities.

## 🌟 Overview

RFPFlow streamlines the entire RFP lifecycle from creation to completion, enabling seamless collaboration between buyers and suppliers with role-based access control, real-time notifications, and comprehensive document management. This project showcases modern web development practices, AI-assisted development, and enterprise-level application architecture.

## ✨ Core Features

### 🔐 User Management & Authentication
- **User Registration**: Role selection (Buyer/Supplier) with validation
- **JWT-based Authentication**: Secure token-based authentication system
- **Dynamic RBAC**: Database-driven role-based access control with granular permissions
- **Session Management**: Secure session handling with proper token validation

### 📋 RFP Lifecycle Management
- **Complete CRUD Operations**: Create, read, update, delete RFPs with validation
- **Status Workflow**: `Draft → Published → Response Submitted → Under Review → Approved/Rejected → Awarded`
- **Version Control**: Track RFP changes and iterations with full versioning support
- **Deadline Management**: Automated deadline tracking and notifications
- **Award Management**: Complete awarding workflow with winner tracking

### 🔍 Advanced Search & Filtering
- **Full-text Search**: Database-driven search across RFP content and metadata
- **Multi-faceted Filtering**: Filter by status, date range, budget, keywords, and more
- **Real-time Results**: Instant search with debounced queries and pagination
- **Advanced Query Builder**: Complex filtering with multiple criteria

### 📄 Document Management
- **File Upload/Download**: Cloudinary integration for secure file storage
- **Multiple Format Support**: PDF, Word, Excel, images with preview
- **Document Versioning**: Track document changes and history
- **File Validation**: Type checking, size limits, and security validation

### 🔔 Real-time Notifications
- **WebSocket Integration**: Socket.IO for instant updates across all users
- **Email Notifications**: SendGrid for automated email alerts with HTML templates
- **Event-driven Architecture**: Automatic notifications on all status changes
- **In-app Notifications**: Real-time notification system with read/unread tracking

### 📊 Data Visualization & Analytics
- **Interactive Charts**: RFP status distribution and analytics with Recharts
- **Role-specific Dashboards**: Customized views for buyers and suppliers
- **Export Capabilities**: PDF/Excel export with print-friendly views
- **Statistics Tracking**: Comprehensive metrics and reporting

### 🚀 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS v4
- **Component Library**: shadcn/ui for consistent design system
- **Real-time Updates**: Live UI updates via WebSocket integration
- **Bulk Operations**: Multi-select actions with confirmation dialogs
- **Professional Landing Page**: Marketing page with Aceternity UI components

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with middleware architecture
- **Database**: PostgreSQL with Prisma ORM and migrations
- **Authentication**: JSON Web Tokens (JWT) with refresh tokens
- **File Storage**: Cloudinary for secure cloud file management
- **Email Service**: SendGrid with HTML templates
- **Real-time**: Socket.IO for WebSocket communication
- **Validation**: Zod schema validation with custom error handling
- **Testing**: Jest with Supertest for comprehensive testing
- **Documentation**: Swagger/OpenAPI with JSDoc comments

### Frontend
- **Framework**: React 18 with TypeScript and modern hooks
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: React Router DOM with protected routes
- **State Management**: React Query (TanStack Query) for server state
- **Styling**: Tailwind CSS v4 with custom design system
- **UI Components**: shadcn/ui with custom components
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for consistent iconography
- **Notifications**: Sonner for toast notifications
- **Testing**: Vitest with React Testing Library
- **Animations**: Framer Motion for smooth interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database
- Cloudinary account (for file uploads)
- SendGrid account (for email notifications)

### Backend Setup

1. **Clone and navigate to backend**:
```bash
git clone <repository-url>
cd rfp/backend
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Environment variables** - Create `.env` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rfp_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# SendGrid
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Frontend URL
FRONTEND_URL="http://localhost:5173"
```

4. **Database setup**:
```bash
# Run migrations
pnpm prisma migrate deploy

# Seed default data
pnpm prisma db seed
```

5. **Start development server**:
```bash
pnpm dev
```

The backend will be available at `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend**:
```bash
cd ../frontend
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Environment variables** - Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WEBSOCKET_URL=http://localhost:3000
```

**Important**: The `VITE_WEBSOCKET_URL` should point to the backend server root (without `/api` path) for WebSocket connections.

4. **Start development server**:
```bash
pnpm dev
```

The frontend will be available at `http://localhost:5173`

## 🧪 Testing

### Backend Testing
```bash
cd backend
pnpm test              # Run all tests
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage report
```

### Frontend Testing
```bash
cd frontend
pnpm test              # Run tests in watch mode
pnpm test:run          # Run all tests once
pnpm test:coverage     # Run tests with coverage report
```

## 📚 API Documentation

The API documentation is available at:
- **Development**: `http://localhost:3000/api-docs`
- **Swagger JSON**: `http://localhost:3000/api-docs.json`

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - User registration with role selection
- `POST /api/auth/login` - User login with JWT

#### RFPs
- `GET /api/rfp` - Get published RFPs (suppliers) or user's RFPs (buyers)
- `GET /api/rfp/my` - Get user's own RFPs (buyers)
- `POST /api/rfp` - Create new RFP with validation
- `GET /api/rfp/:id` - Get RFP details with permissions
- `PUT /api/rfp/:id` - Update RFP with status validation
- `DELETE /api/rfp/:id` - Delete RFP (draft only)
- `PUT /api/rfp/:id/publish` - Publish RFP
- `PUT /api/rfp/:id/close` - Close RFP
- `PUT /api/rfp/:id/cancel` - Cancel RFP
- `PUT /api/rfp/:id/award` - Award RFP to response

#### RFP Versions
- `POST /api/rfp/:id/versions` - Create new RFP version
- `GET /api/rfp/:id/versions` - Get all versions
- `PUT /api/rfp/:id/versions/:versionId` - Update version
- `DELETE /api/rfp/:id/versions/:versionId` - Delete version

#### Responses
- `GET /api/rfp/my-responses` - Get user's responses (suppliers)
- `GET /api/rfp/:id/responses` - Get responses for RFP (buyers)
- `POST /api/rfp/:id/responses` - Submit response to RFP
- `GET /api/rfp/responses/:responseId` - Get response details
- `PUT /api/rfp/responses/:responseId` - Update response
- `DELETE /api/rfp/responses/:responseId` - Delete response
- `PUT /api/rfp/responses/:responseId/submit` - Submit response
- `PUT /api/rfp/responses/:responseId/approve` - Approve response
- `PUT /api/rfp/responses/:responseId/reject` - Reject response
- `PUT /api/rfp/responses/:responseId/award` - Award response
- `PUT /api/rfp/responses/:responseId/move-to-review` - Move to review

#### Dashboard
- `GET /api/dashboard` - Get role-specific dashboard data
- `GET /api/dashboard/stats` - Get detailed statistics

#### Documents
- `POST /api/rfp/documents` - Upload RFP documents
- `POST /api/rfp/responses/:responseId/documents` - Upload response documents
- `DELETE /api/rfp/documents/:documentId` - Delete documents

#### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read

#### Audit Trail
- `GET /api/audit/my` - Get user's audit trail
- `GET /api/audit/target/:targetType/:targetId` - Get target audit trail
- `GET /api/audit/all` - Get all audit trails (admin)

#### Health Check
- `GET /api/health` - Application health status

For complete API documentation, see [docs/api-docs.md](./docs/api-docs.md)

## 🗄 Database Schema

The system uses PostgreSQL with the following key entities:

- **Users**: Authentication and profile information with role relationships
- **Roles**: Dynamic role definitions with JSON permissions
- **RFPs**: Request for proposal records with status tracking
- **RFPVersions**: Versioned RFP content with document attachments
- **SupplierResponses**: Supplier responses to RFPs with status workflow
- **Documents**: File attachments and metadata with Cloudinary integration
- **Notifications**: System notifications and templates with read tracking
- **AuditTrail**: Comprehensive activity logging for all user actions

For detailed schema information, see [docs/database-schema.md](./docs/database-schema.md)

## 🔑 Permissions System

The system implements a flexible RBAC model with:

### Default Roles
- **Buyer**: Can create/manage RFPs, review responses, award contracts
- **Supplier**: Can view published RFPs, submit responses, manage documents

### Permission Structure
```json
{
  "resource": {
    "action": {
      "allowed": boolean,
      "scope": "own" | "rfp_owner" | "published",
      "allowed_statuses": ["status1", "status2"]
    }
  }
}
```

For complete permissions documentation, see [docs/permissions.md](./docs/permissions.md)

## 🔄 Real-time Features

### WebSocket Events
- `rfp_published` - New RFP published (to suppliers)
- `response_submitted` - New response submitted (to buyers)
- `rfp_status_changed` - RFP status updated (to relevant users)
- `response_status_changed` - Response status updated (to relevant users)
- `rfp_awarded` - RFP awarded (to winner and buyer)
- `notification` - New notification received

### Email Notifications
- RFP published notifications with HTML templates
- Response submission alerts with detailed information
- Status change notifications with context
- Deadline reminders with action links
- Award notifications with celebration messaging

## 📁 Project Structure

```
rfp/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/     # Request handlers with validation
│   │   ├── services/        # Business logic and data access
│   │   ├── middleware/      # Custom middleware (auth, permissions)
│   │   ├── utils/           # Utility functions and helpers
│   │   ├── validations/     # Zod schemas for validation
│   │   ├── config/          # Configuration files
│   │   └── __tests__/       # Comprehensive test suite
│   ├── prisma/              # Database schema and migrations
│   └── docs/                # Backend documentation
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components with routing
│   │   ├── hooks/           # Custom hooks for data fetching
│   │   ├── contexts/        # React contexts for state management
│   │   ├── apis/            # API layer with Axios
│   │   ├── utils/           # Utility functions
│   │   └── test/            # Test utilities and setup
├── docs/                    # Project documentation
└── README.md               # This file
```

## 🤖 AI Usage Report

This project was developed with substantial AI assistance, highlighting effective human-AI collaboration and improved productivity.

The development started with Gemini CLI and continued using Cursor. To maintain context, I first instructed the AI to list all tasks in ACTION_ITEMS.md. The AI then selected tasks from this file and documented completed work in WORK_DONE.md.

To provide additional context, I created API_DOCS.md and DATABASE_SCHEMA.md, and also supplied REQUIREMENTS.md containing the project specifications.

For managing permissions, I prepared PERMISSION.md, which includes the JSON structure used for our RBAC system. This setup allowed the AI to understand project requirements, database structure, APIs, and permissions, enabling it to assist effectively throughout development.

## 🚀 Deployment

### Backend Deployment (Railway/Heroku)
1. Set up production database (PostgreSQL)
2. Configure environment variables
3. Deploy with `git push` or Railway CLI
4. Run database migrations in production

### Frontend Deployment (Vercel/Netlify)
1. Build production bundle: `pnpm build`
2. Configure environment variables
3. Deploy to hosting platform
4. Set up custom domain (optional)

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or deploy individual services
docker build -t rfp-backend ./backend
docker build -t rfp-frontend ./frontend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- AI-assisted development for enhanced productivity and quality
- Open source libraries and frameworks that made this possible
- shadcn/ui for the excellent component library
- Tailwind CSS for the utility-first styling approach
- Aceternity UI for beautiful landing page components
- Prisma for excellent database tooling
- React Query for efficient data fetching

---

**RFPFlow** - Streamline Your RFP Process with Modern Technology 🚀

*Demonstrating production-ready application development with AI assistance*
# rfp_management
