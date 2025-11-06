# RBAC System Deployment Guide

## Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Git

### Quick Start

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd rbac-system
   \`\`\`

2. **Start development environment**
   \`\`\`bash
   chmod +x scripts/dev.sh
   ./scripts/dev.sh
   \`\`\`

3. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api

### Test Credentials
| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password | Admin |
| editor@example.com | password | Editor |
| viewer@example.com | password | Viewer |

## Environment Variables

Create `.env.local`:
\`\`\`
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://rbac_user:rbac_password@localhost:5432/rbac_db
NODE_ENV=development
\`\`\`

## Docker Compose Services

### app
- Next.js application
- Port: 3000
- Command: `pnpm dev`

### postgres
- PostgreSQL database
- Port: 5432
- User: rbac_user
- Password: rbac_password
- Database: rbac_db

## Database Migrations

The database schema is automatically initialized via `scripts/init.sql`.

To manually run migrations:
\`\`\`bash
docker-compose exec postgres psql -U rbac_user -d rbac_db -f /docker-entrypoint-initdb.d/init.sql
\`\`\`

## Useful Commands

### View logs
\`\`\`bash
docker-compose logs -f app
docker-compose logs -f postgres
\`\`\`

### Stop services
\`\`\`bash
docker-compose down
\`\`\`

### Rebuild images
\`\`\`bash
docker-compose build --no-cache
\`\`\`

### Access PostgreSQL
\`\`\`bash
docker-compose exec postgres psql -U rbac_user -d rbac_db
\`\`\`

## Production Deployment

### Security Considerations
1. Change all default passwords
2. Use strong JWT_SECRET (minimum 32 characters)
3. Enable HTTPS
4. Set up proper firewall rules
5. Use environment-specific configuration
6. Enable database backups
7. Set up monitoring and alerting

### Deployment Steps
1. Set environment variables for production
2. Build Docker image: `docker build -t rbac-system:latest .`
3. Push to container registry
4. Deploy using orchestration platform (Kubernetes, Docker Swarm, etc.)
5. Set up reverse proxy (Nginx, Traefik)
6. Configure SSL/TLS certificates
7. Set up monitoring and logging

### Database Backups
\`\`\`bash
# Create backup
docker-compose exec postgres pg_dump -U rbac_user rbac_db > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U rbac_user rbac_db < backup.sql
