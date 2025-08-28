import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import authRouter from './router/auth.router';
import rfpRouter from './router/rfp.router';
import dashboardRouter from './router/dashboard.router';
import notificationRouter from './router/notification.router';
import auditRouter from './router/audit.router';
import adminRouter from './router/admin.router';
import { setupSwagger } from './config/swagger';
import { initializeWebSocket } from './services/websocket.service';
import { PrismaClient } from '@prisma/client';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import * as path from 'path';

const prisma = new PrismaClient();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

// Enable CORS for all origins
const allowedOrigins = [
  'https://rfpflow.xyz',
  'https://www.rfpflow.xyz',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:4173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, origin); // echo back the allowed origin
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json());

// Serve static files from exports directory
app.use('/exports', express.static(path.join(__dirname, '../exports')));

app.use('/api/auth', authRouter);
app.use('/api/rfp', rfpRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/audit', auditRouter);
app.use('/api/admin', adminRouter);

setupSwagger(app);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check the health status of the application and its services
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                   example: 3600
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: "connected"
 *                     websocket:
 *                       type: string
 *                       example: "active"
 *                     api:
 *                       type: string
 *                       example: "running"
 *       503:
 *         description: Application is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "unhealthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 environment:
 *                   type: string
 *                 version:
 *                   type: string
 *                 services:
 *                   type: object
 *                 error:
 *                   type: string
 *                   description: Error message
 */
// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'connected',
        websocket: 'active',
        api: 'running'
      }
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    
    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'disconnected',
        websocket: 'active',
        api: 'running'
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(503).json(healthStatus);
  }
});

// Initialize WebSocket
initializeWebSocket(server);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});