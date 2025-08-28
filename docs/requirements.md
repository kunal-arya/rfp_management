# RFP Contract Management System - Full-Stack Coding Assignment

## Overview
Build a complete **RFP (Request for Proposal) contract management system** that demonstrates your ability to create production-ready applications using modern technologies and AI tools for productivity.

**Time Allocation:** ~2 hours (AI assistance encouraged)

---

## Product Requirements

### Core Features
#### User Management & Authentication
- User registration with role selection (**Buyer/Supplier**)
- JWT-based authentication
- Role-based access control

#### RFP Lifecycle Management
- Buyers can create and publish RFPs
- Suppliers can browse available RFPs and submit responses
- Buyers can review responses and approve/reject them
- Document status tracking:  
  `Draft → Published → Response Submitted → Under Review → Approved/Rejected`

#### Document Management
- File upload capabilities for RFP documents and responses
- Document indexing and full-text search
- Version control for document updates

#### Email Notifications
- Automated emails when RFP status changes
- Notifications to suppliers when new RFPs are published
- Alerts to buyers when responses are submitted

#### Dashboard & UI
- Role-specific dashboards
- Responsive, modern design
- Real-time status updates

---

## Technical Requirements

### Backend (Choose one stack)
- **Node.js:** Express/Fastify + TypeScript  
- **Python:** FastAPI/Django + Python 3.9+  
- **Go:** Gin/Echo framework  
- Database: **PostgreSQL** or **MongoDB** with proper indexing

### Frontend (Choose one)
- **React with TypeScript** (preferred)  
- Vue.js 3 with Composition API  
- Svelte/SvelteKit  
- Next.js (full-stack option)

### Required Integrations
- **Email Service:** SendGrid, Mailgun, or AWS SES  
- **File Storage:** AWS S3, Cloudinary, or local with proper handling  
- **Search:** Elasticsearch, Algolia, or database full-text search  

---

## AI Tool Usage
Document your use of AI tools for:
- Code generation and boilerplate creation  
- UI/UX design assistance  
- Database schema design  
- API documentation  
- Testing strategy  

---

## Deliverables

### 1. Working Application
- Deployed application (**Vercel, Netlify, Railway, or similar**)  
- GitHub repository with clear **README**  
- Environment setup instructions  

### 2. Core Functionality Demo
Your application must demonstrate:  
- [ ] User registration and login for both roles  
- [ ] Buyer creating an RFP with document upload  
- [ ] Supplier browsing and responding to RFPs  
- [ ] Basic search functionality across RFPs  
- [ ] Email notification system (can be simulated/logged)  
- [ ] Status workflow management  

### 3. Technical Documentation
Include in your repository:  
- `README.md` with setup and deployment instructions  
- API Documentation (**Swagger/OpenAPI preferred**)  
- Database Schema diagram or description  
- **AI Usage Report** – document how you leveraged AI tools  

### 4. Design & UX
- Clean, professional interface  
- Mobile-responsive design  
- Intuitive user experience  
- Proper loading states and error handling  

---

## Evaluation Criteria

### Technical Excellence (40%)
- Code quality and organization  
- Database design and relationships  
- API design and RESTful principles  
- Error handling and validation  
- Security best practices  

### Product Completeness (30%)
- All core features implemented  
- Smooth user workflows  
- Proper role-based functionality  
- Document lifecycle management  

### Design & User Experience (20%)
- Visual design quality  
- Responsive implementation  
- Intuitive navigation  
- Professional appearance  

### AI Tool Utilization (10%)
- Effective use of AI for productivity  
- Documentation of AI assistance  
- Code quality despite AI usage  
- Creative problem-solving with AI  

---

## Bonus Points
- Real-time updates using WebSockets  
- Advanced search with filters and facets  
- Document preview capabilities  
- Audit trail/activity logging  
- Docker containerization  
- Comprehensive testing suite  
- Performance optimization  

---

## Submission Guidelines

### What to Submit
- GitHub Repository URL (public or provide access)  
- Live Demo URL (deployed application)  
- AI Usage Report (2–3 paragraphs in README)  
- Brief Architecture Overview (included in README)  

### Repository Structure
