# GRC Shield - Deployment Guide

Complete guide for deploying GRC Shield on various platforms.

## Table of Contents
- [Quick Start](#quick-start)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Cloud Deployments](#cloud-deployments)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring & Health Checks](#monitoring--health-checks)

---

## Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20+ (for local development)
- PostgreSQL 15+ (or use Docker)

### Local Development
```bash
# Clone the repository
git clone https://github.com/uttamkhot007/grc-shield.git
cd grc-shield

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Start with Docker Compose
docker-compose up -d

# Or for development with hot reload
docker-compose -f docker-compose.dev.yml up
```

---

## Docker Deployment

### Build the Image
```bash
# Build production image
docker build -t grc-shield:latest .

# Build with specific tag
docker build -t grc-shield:v1.0.0 .
```

### Run with Docker Compose
```bash
# Production
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

### Manual Docker Run
```bash
# Create network
docker network create grc-network

# Run PostgreSQL
docker run -d \
  --name grc-db \
  --network grc-network \
  -e POSTGRES_USER=grcuser \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=grcshield \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Run Application
docker run -d \
  --name grc-app \
  --network grc-network \
  -p 5000:5000 \
  -e DATABASE_URL=postgresql://grcuser:yourpassword@grc-db:5432/grcshield \
  -e SESSION_SECRET=your-secret \
  grc-shield:latest
```

---

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (1.25+)
- kubectl configured
- Helm (optional)

### Deploy to Kubernetes
```bash
# Create namespace and deploy
kubectl apply -f k8s/deployment.yaml

# Check status
kubectl get pods -n grc-shield
kubectl get services -n grc-shield

# View logs
kubectl logs -f deployment/grc-shield -n grc-shield

# Scale deployment
kubectl scale deployment grc-shield --replicas=5 -n grc-shield
```

### Create Image Pull Secret (for private registry)
```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN \
  -n grc-shield
```

---

## Cloud Deployments

### AWS (ECS/Fargate)

1. **Push to ECR:**
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

aws ecr create-repository --repository-name grc-shield

docker tag grc-shield:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/grc-shield:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/grc-shield:latest
```

2. **Create ECS Task Definition** (via AWS Console or Terraform)

3. **Create ECS Service** with Application Load Balancer

### Google Cloud (Cloud Run)

```bash
# Configure gcloud
gcloud auth configure-docker

# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT/grc-shield

# Deploy
gcloud run deploy grc-shield \
  --image gcr.io/YOUR_PROJECT/grc-shield \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=YOUR_DB_URL,SESSION_SECRET=YOUR_SECRET" \
  --memory 1Gi \
  --cpu 1
```

### Azure (Container Apps)

```bash
# Login
az login
az acr login --name yourregistry

# Push image
docker tag grc-shield:latest yourregistry.azurecr.io/grc-shield:latest
docker push yourregistry.azurecr.io/grc-shield:latest

# Create Container App
az containerapp create \
  --name grc-shield \
  --resource-group myResourceGroup \
  --environment myEnvironment \
  --image yourregistry.azurecr.io/grc-shield:latest \
  --target-port 5000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 10 \
  --env-vars "DATABASE_URL=secretref:db-url" "SESSION_SECRET=secretref:session-secret"
```

### DigitalOcean (App Platform)

1. Connect your GitHub repository
2. Configure as Docker deployment
3. Set environment variables in dashboard
4. Deploy

---

## CI/CD Pipeline

### GitHub Actions (Included)

The repository includes two workflow files:

1. **`.github/workflows/ci-cd.yml`** - Main build and deploy pipeline
2. **`.github/workflows/security-scan.yml`** - Security scanning

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `STAGING_SERVER_HOST` | Staging server IP/hostname |
| `STAGING_SERVER_USER` | SSH username for staging |
| `STAGING_SSH_PRIVATE_KEY` | SSH private key for staging |
| `PROD_SERVER_HOST` | Production server IP/hostname |
| `PROD_SERVER_USER` | SSH username for production |
| `PROD_SSH_PRIVATE_KEY` | SSH private key for production |
| `SNYK_TOKEN` | (Optional) Snyk API token |

### Pipeline Stages

1. **Build & Test** - Install dependencies, lint, test, build
2. **Docker Build** - Build and push Docker image to GHCR
3. **Deploy Staging** - Deploy to staging (on `develop` branch)
4. **Deploy Production** - Deploy to production (on `main` branch)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secret for session encryption |
| `NODE_ENV` | Yes | `production` or `development` |
| `PORT` | No | Application port (default: 5000) |
| `OPENAI_API_KEY` | No | OpenAI API key for AI features |
| `REDIS_URL` | No | Redis connection string for caching |

---

## Database Setup

### Run Migrations
```bash
# Using npm
npm run db:push

# Using Docker
docker-compose exec app npm run db:push
```

### Database Backup
```bash
# Manual backup
./scripts/backup-db.sh

# Restore from backup
gunzip -c backup.sql.gz | docker-compose exec -T db psql -U grcuser grcshield
```

---

## SSL/TLS Configuration

### Using Let's Encrypt with Nginx

1. Place certificates in `nginx/ssl/`:
   - `fullchain.pem`
   - `privkey.pem`

2. Enable nginx profile:
```bash
docker-compose --profile production up -d
```

### Using Certbot
```bash
certbot certonly --webroot -w /var/www/certbot -d grc-shield.com -d www.grc-shield.com
```

---

## Monitoring & Health Checks

### Health Endpoints

| Endpoint | Description |
|----------|-------------|
| `/health/live` | Liveness probe |
| `/health/ready` | Readiness probe |
| `/health` | Detailed health status |
| `/metrics` | Prometheus metrics |

### Docker Health Check
```bash
docker inspect --format='{{.State.Health.Status}}' grc-shield-app
```

### Kubernetes Probes
Configured in `k8s/deployment.yaml` with liveness and readiness probes.

---

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs app

# Check health
docker inspect grc-shield-app
```

### Database connection issues
```bash
# Test connection
docker-compose exec app node -e "require('./dist/db').testConnection()"

# Check PostgreSQL logs
docker-compose logs db
```

### Build failures
```bash
# Clean build
docker-compose build --no-cache

# Check disk space
docker system df
docker system prune -a
```

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/uttamkhot007/grc-shield/issues
- Documentation: See `replit.md` for architecture details
