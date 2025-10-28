# Docker Setup Guide - DeraLinks Platform

**Phase 6C:** Database & Backend API Development Environment

---

## 📋 Overview

This Docker setup provides a complete development environment with:
- **PostgreSQL** - Main database
- **Redis** - Caching layer
- **Backend API** - Node.js/TypeScript Express server
- **pgAdmin** - Database GUI (optional)

---

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed (https://www.docker.com/products/docker-desktop)
- Docker Compose v2.0+ included with Docker Desktop
- Git (to clone the repository)

### 1. Configure Environment

Copy the example environment file and update with your values:

```bash
cp .env.docker .env
```

Edit `.env` and add your Hedera credentials:
```bash
OPERATOR_ID=0.0.7125108
OPERATOR_KEY=your_operator_private_key
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret
```

### 2. Start All Services

```bash
# Start all services
docker-compose up

# Or run in background (detached mode)
docker-compose up -d
```

### 3. Verify Services

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f backend

# Test API
curl http://localhost:3001/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-01-27T...",
  "environment": "development",
  "network": "testnet"
}
```

---

## 📦 Services

### Backend API
- **URL:** http://localhost:3600
- **Container:** deralinks-backend
- **Health:** http://localhost:3600/health
- **Hot reload:** Enabled (code changes auto-restart)

### PostgreSQL Database
- **Host:** localhost
- **Port:** 5432
- **Database:** deralinks_db
- **User:** deralinks
- **Password:** deralinks_dev_password
- **Container:** deralinks-postgres

**Connect via CLI:**
```bash
docker exec -it deralinks-postgres psql -U deralinks -d deralinks_db
```

### Redis Cache
- **Host:** localhost
- **Port:** 6379
- **Container:** deralinks-redis

**Test connection:**
```bash
docker exec -it deralinks-redis redis-cli ping
# Should return: PONG
```

### pgAdmin (Optional)
- **URL:** http://localhost:5050
- **Email:** admin@deralinks.com
- **Password:** admin
- **Container:** deralinks-pgadmin

To enable pgAdmin:
```bash
docker-compose --profile dev-tools up -d
```

---

## 🛠️ Common Commands

### Start Services
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Start specific service
docker-compose up backend

# Rebuild and start
docker-compose up --build
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: Deletes database data)
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Execute Commands in Containers
```bash
# Backend shell
docker exec -it deralinks-backend sh

# PostgreSQL shell
docker exec -it deralinks-postgres psql -U deralinks -d deralinks_db

# Redis CLI
docker exec -it deralinks-redis redis-cli

# Run npm commands
docker exec -it deralinks-backend npm run build
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### View Container Status
```bash
# List containers
docker-compose ps

# View resource usage
docker stats
```

---

## 🔧 Development Workflow

### Hot Reload

The backend service uses **nodemon** for automatic restarts when you edit code:

1. Edit any file in `backend/src/`
2. Save the file
3. Server automatically restarts
4. Check logs: `docker-compose logs -f backend`

### Installing New Dependencies

```bash
# Option 1: Exec into container
docker exec -it deralinks-backend npm install express-validator

# Option 2: Rebuild container
# Add dependency to package.json, then:
docker-compose up --build backend
```

### Database Migrations

```bash
# Run migrations
docker exec -it deralinks-backend npm run db:migrate

# Seed database
docker exec -it deralinks-backend npm run db:seed
```

### Debugging

```bash
# View backend logs in real-time
docker-compose logs -f backend

# Check database connections
docker exec -it deralinks-postgres psql -U deralinks -d deralinks_db -c "SELECT count(*) FROM users;"

# Test Redis
docker exec -it deralinks-redis redis-cli SET test "hello"
docker exec -it deralinks-redis redis-cli GET test
```

---

## 📁 Project Structure

```
deralinks/
├── docker-compose.yml          # Orchestration file
├── .env.docker → .env          # Environment variables
│
├── backend/                    # Backend API
│   ├── Dockerfile             # Backend container definition
│   ├── .dockerignore          # Files to exclude from build
│   ├── package.json           # Node.js dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   ├── .env.example           # Backend env template
│   │
│   ├── database/
│   │   └── init/              # Database initialization scripts
│   │       └── 01-init-schema.sql
│   │
│   └── src/                   # Source code
│       ├── index.ts           # Entry point
│       ├── config/            # Configuration
│       ├── controllers/       # Route controllers
│       ├── middleware/        # Express middleware
│       ├── models/            # Database models
│       ├── routes/            # API routes
│       ├── services/          # Business logic
│       ├── utils/             # Utilities
│       └── types/             # TypeScript types
│
└── hedera-setup/              # Hedera scripts & data
    └── output/                # Mounted read-only in backend
```

---

## 🗄️ Database Access

### Using psql (PostgreSQL CLI)

```bash
# Connect to database
docker exec -it deralinks-postgres psql -U deralinks -d deralinks_db

# List tables
\dt

# Describe table
\d users

# Query
SELECT * FROM users;

# Exit
\q
```

### Using pgAdmin (GUI)

1. Start pgAdmin: `docker-compose --profile dev-tools up -d`
2. Open: http://localhost:5050
3. Login: admin@deralinks.com / admin
4. Add server:
   - **Name:** DeraLinks
   - **Host:** postgres (container name)
   - **Port:** 5432
   - **Database:** deralinks_db
   - **Username:** deralinks
   - **Password:** deralinks_dev_password

### Backup & Restore

```bash
# Backup database
docker exec deralinks-postgres pg_dump -U deralinks deralinks_db > backup.sql

# Restore database
docker exec -i deralinks-postgres psql -U deralinks -d deralinks_db < backup.sql
```

---

## 🔐 Environment Variables

### Docker Compose (.env)
```bash
# Database
DB_USER=deralinks
DB_PASSWORD=deralinks_dev_password
DB_NAME=deralinks_db
DB_PORT=5432

# Backend API
API_PORT=3001

# Hedera
OPERATOR_ID=0.0.7125108
OPERATOR_KEY=your_key_here
HEDERA_NETWORK=testnet

# IPFS
PINATA_API_KEY=your_key
PINATA_SECRET_KEY=your_secret
```

### Backend (.env)
See `backend/.env.example` for full list of backend-specific variables.

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3001
lsof -i :5432

# Change port in .env
API_PORT=3002
DB_PORT=5433

# Restart
docker-compose down
docker-compose up
```

### Container Won't Start

```bash
# View detailed logs
docker-compose logs backend

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Database Connection Failed

```bash
# Check PostgreSQL health
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Test connection
docker exec -it deralinks-postgres psql -U deralinks -d deralinks_db -c "SELECT 1;"
```

### Hot Reload Not Working

```bash
# Check nodemon is running
docker-compose logs backend | grep nodemon

# Restart backend
docker-compose restart backend

# Rebuild if needed
docker-compose up --build backend
```

### Clear All Data

```bash
# WARNING: This deletes all database data!
docker-compose down -v
docker-compose up
```

---

## 🚀 Production Deployment

For production, use the production stage in Dockerfile:

```bash
# Build for production
docker build --target production -t deralinks-backend:prod backend/

# Run production container
docker run -d \
  --name deralinks-backend \
  -p 3001:3001 \
  --env-file .env.production \
  deralinks-backend:prod
```

Or use docker-compose.prod.yml (to be created).

---

## 📊 Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Backend health endpoint
curl http://localhost:3001/health

# Database health
docker exec deralinks-postgres pg_isready -U deralinks

# Redis health
docker exec deralinks-redis redis-cli ping
```

---

## 🔄 Update Strategy

### Updating Code
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up --build
```

### Updating Dependencies
```bash
# Update package.json
# Then rebuild
docker-compose build backend
docker-compose up backend
```

### Database Migrations
```bash
# Run migrations
docker exec -it deralinks-backend npm run db:migrate
```

---

## 📝 Next Steps

1. ✅ Docker environment running
2. ⏳ Create database schema & migrations
3. ⏳ Build API endpoints:
   - Property minting
   - User assets
   - Marketplace listings
   - Verification token ID
4. ⏳ Test API endpoints
5. ⏳ Connect to frontend

---

## 🆘 Support

### Check Logs
```bash
docker-compose logs -f
```

### Container Shell Access
```bash
docker exec -it deralinks-backend sh
```

### Reset Everything
```bash
docker-compose down -v
rm -rf backend/node_modules
docker-compose up --build
```

---

## ✅ Verification Checklist

- [ ] Docker Desktop running
- [ ] `.env` file configured with Hedera credentials
- [ ] `docker-compose up` successful
- [ ] http://localhost:3001/health returns {"status": "ok"}
- [ ] Can connect to PostgreSQL
- [ ] Can connect to Redis
- [ ] Backend logs show no errors
- [ ] Hot reload working (edit file, see restart)

---

**Docker setup complete! Ready for Phase 6C development.** 🎉
