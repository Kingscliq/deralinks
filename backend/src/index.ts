import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { initDatabase, testConnection, getPool } from './config/database';
import { runMigrations } from './database/migrate';

// Route imports
import propertiesRoutes from './routes/properties.routes';
import tokensRoutes from './routes/tokens.routes';
import usersRoutes from './routes/users.routes';
import investorsRoutes from './routes/investors.routes';
import propertyOwnersRoutes from './routes/property-owners.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import filesRoutes from './routes/files.routes';
import adminRoutes from './routes/admin.routes';
import verificationRoutes from './routes/verification.routes';
import daoRoutes from './routes/dao.routes';

// Services
import { startAllJobs, gracefulShutdown } from './services/scheduler.service';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3600;

// ============================================
// Middleware
// ============================================

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3600',
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// Routes
// ============================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    network: process.env.HEDERA_NETWORK || 'testnet'
  });
});

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'DeraLinks API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  });
});

// API v1 routes
app.use('/api/v1/properties', propertiesRoutes);
app.use('/api/v1/tokens', tokensRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/investors', investorsRoutes);
app.use('/api/v1/property-owners', propertyOwnersRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/files', filesRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/verification', verificationRoutes);
app.use('/api/v1/dao', daoRoutes);

// API v1 info endpoint
app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    message: 'DeraLinks API v1',
    version: '1.0.0',
    endpoints: {
      properties: {
        mint: 'POST /api/v1/properties/mint',
        list: 'GET /api/v1/properties',
        details: 'GET /api/v1/properties/:id',
        update: 'PUT /api/v1/properties/:id',
        verify: 'POST /api/v1/properties/:id/verify',
      },
      tokens: {
        mint: 'POST /api/v1/tokens/mint',
        info: 'GET /api/v1/tokens/:tokenId/info',
        transfer: 'POST /api/v1/tokens/transfer',
        holders: 'GET /api/v1/tokens/:tokenId/holders',
      },
      users: {
        assets: 'GET /api/v1/users/:accountId/assets',
      },
      investors: {
        register: 'POST /api/v1/investors/register',
        profile: 'GET /api/v1/investors/:id/profile',
        kyc: 'POST /api/v1/investors/:id/kyc',
        transactions: 'GET /api/v1/investors/:id/transactions',
      },
      propertyOwners: {
        register: 'POST /api/v1/property-owners/register',
        submitVerification: 'POST /api/v1/property-owners/:id/verification',
        verificationStatus: 'GET /api/v1/property-owners/:id/verification-status',
      },
      marketplace: {
        list: 'POST /api/v1/marketplace/list',
        listings: 'GET /api/v1/marketplace/listings',
        offers: 'POST /api/v1/marketplace/offers',
        buy: 'POST /api/v1/marketplace/buy',
      },
      files: {
        upload: 'POST /api/v1/files/upload',
        uploadMultiple: 'POST /api/v1/files/upload-multiple',
        uploadJSON: 'POST /api/v1/files/upload-json',
        info: 'GET /api/v1/files/:cid',
      },
      admin: {
        pendingVerifications: 'GET /api/v1/admin/pending-verifications',
        approveInvestorKYC: 'POST /api/v1/admin/investors/:id/approve-kyc',
        rejectInvestorKYC: 'POST /api/v1/admin/investors/:id/reject-kyc',
        approvePropertyOwner: 'POST /api/v1/admin/property-owners/:id/approve',
        rejectPropertyOwner: 'POST /api/v1/admin/property-owners/:id/reject',
      },
      verification: {
        tokenId: 'GET /api/v1/verification/token-id',
      },
      dao: {
        createProposal: 'POST /api/v1/dao/:propertyId/proposals',
        listProposals: 'GET /api/v1/dao/:propertyId/proposals',
        proposalDetails: 'GET /api/v1/dao/proposals/:id',
        vote: 'POST /api/v1/dao/proposals/:id/vote',
        results: 'GET /api/v1/dao/proposals/:id/results',
        execute: 'POST /api/v1/dao/proposals/:id/execute',
        treasury: 'GET /api/v1/dao/:propertyId/treasury',
      },
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ============================================
// Start Server
// ============================================

const startServer = async () => {
  try {
    // Initialize database
    console.log('🔌 Initializing database connection...');
    initDatabase();

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Run database migrations
    console.log('');
    const pool = getPool();
    await runMigrations(pool);
    console.log('');

    // Start background sync jobs
    console.log('🔄 Starting blockchain event indexer...');
    startAllJobs();

    // Start Express server
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log('🚀 DeraLinks Backend API');
      console.log('='.repeat(50));
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⛓️  Network: ${process.env.HEDERA_NETWORK || 'testnet'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`💚 Health: http://localhost:${PORT}/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/v1`);
      console.log('='.repeat(50));
      console.log('Available Endpoints:');
      console.log('  POST   /api/v1/properties/mint');
      console.log('  GET    /api/v1/properties');
      console.log('  GET    /api/v1/properties/:id');
      console.log('  PUT    /api/v1/properties/:id');
      console.log('  POST   /api/v1/properties/:id/verify');
      console.log('  POST   /api/v1/tokens/mint');
      console.log('  GET    /api/v1/tokens/:tokenId/info');
      console.log('  POST   /api/v1/tokens/transfer');
      console.log('  GET    /api/v1/tokens/:tokenId/holders');
      console.log('  GET    /api/v1/users/:accountId/assets');
      console.log('  POST   /api/v1/investors/register');
      console.log('  GET    /api/v1/investors/:id/profile');
      console.log('  POST   /api/v1/investors/:id/kyc');
      console.log('  GET    /api/v1/investors/:id/transactions');
      console.log('  POST   /api/v1/property-owners/register');
      console.log('  POST   /api/v1/property-owners/:id/verification');
      console.log('  GET    /api/v1/property-owners/:id/verification-status');
      console.log('  POST   /api/v1/marketplace/list');
      console.log('  GET    /api/v1/marketplace/listings');
      console.log('  POST   /api/v1/marketplace/offers');
      console.log('  POST   /api/v1/marketplace/buy');
      console.log('  POST   /api/v1/files/upload');
      console.log('  POST   /api/v1/files/upload-multiple');
      console.log('  POST   /api/v1/files/upload-json');
      console.log('  GET    /api/v1/files/:cid');
      console.log('  GET    /api/v1/admin/pending-verifications');
      console.log('  POST   /api/v1/admin/investors/:id/approve-kyc');
      console.log('  POST   /api/v1/admin/investors/:id/reject-kyc');
      console.log('  POST   /api/v1/admin/property-owners/:id/approve');
      console.log('  POST   /api/v1/admin/property-owners/:id/reject');
      console.log('  GET    /api/v1/verification/token-id');
      console.log('  POST   /api/v1/dao/:propertyId/proposals');
      console.log('  GET    /api/v1/dao/:propertyId/proposals');
      console.log('  GET    /api/v1/dao/proposals/:id');
      console.log('  POST   /api/v1/dao/proposals/:id/vote');
      console.log('  GET    /api/v1/dao/proposals/:id/results');
      console.log('  POST   /api/v1/dao/proposals/:id/execute');
      console.log('  GET    /api/v1/dao/:propertyId/treasury');
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM signal received: closing server gracefully');
  await gracefulShutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('⚠️  SIGINT signal received: closing server gracefully');
  await gracefulShutdown();
  process.exit(0);
});

export default app;
