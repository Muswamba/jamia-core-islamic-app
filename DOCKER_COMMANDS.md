# Quick Reference - Docker Commands

## Initial Setup (First Time Only)

```bash
# 1. Navigate to backend
cd backend

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env and add OpenAI API key
# OPENAI_API_KEY=your_key_here

# 4. Build and start all containers
docker compose up -d --build

# 5. Install dependencies
docker compose exec app composer install

# 6. Generate app key
docker compose exec app php artisan key:generate

# 7. Seed database
docker compose exec app php artisan db:seed

# 8. Verify it works
curl http://localhost:8000/api/health
```

## Daily Commands

### Start Backend
```bash
cd backend
docker compose up -d
```

### Stop Backend
```bash
cd backend
docker compose down
```

### Start Mobile
```bash
cd mobile
npm start
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f worker
docker compose logs -f scheduler
```

### Check Status
```bash
docker compose ps
```

## Common Tasks

### Run Artisan Commands
```bash
# Template
docker compose exec app php artisan <command>

# Examples
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear
docker compose exec app php artisan db:seed
docker compose exec app php artisan queue:work --once
docker compose exec app php artisan schedule:run
```

### Access Database
```bash
# MongoDB
docker compose exec mongo mongosh adhan_app

# Redis
docker compose exec redis redis-cli
```

### Restart Services
```bash
# Restart specific service
docker compose restart app
docker compose restart worker
docker compose restart scheduler

# Restart all
docker compose restart
```

### Update Code
```bash
# PHP code changes auto-reload
# For queue jobs:
docker compose restart worker

# For scheduled tasks:
docker compose restart scheduler
```

## API Testing

```bash
# Health check
curl http://localhost:8000/api/health

# Learn content
curl "http://localhost:8000/api/v1/content/learn?lang=en"

# Translation catalog
curl http://localhost:8000/api/v1/quran/translations/catalog

# Quran translation
curl "http://localhost:8000/api/v1/quran/translation?lang=en&surah=1"

# AI chat
curl -X POST http://localhost:8000/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test","message":"What are the five pillars?"}'
```

## Troubleshooting

### Containers Not Starting
```bash
docker compose down
docker compose up -d --build
```

### Clear Everything and Restart
```bash
# Stop and remove containers
docker compose down

# Remove volumes (WARNING: deletes data)
docker compose down -v

# Rebuild and restart
docker compose up -d --build
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan db:seed
```

### Check Container Health
```bash
# View status
docker compose ps

# View resource usage
docker stats adhan_app adhan_worker adhan_scheduler

# Access container shell
docker compose exec app bash
```

### Fix Permissions
```bash
docker compose exec app chmod -R 775 storage bootstrap/cache
docker compose exec app chown -R www-data:www-data storage bootstrap/cache
```

## Complete Cleanup

```bash
# Stop everything
docker compose down

# Remove volumes (deletes MongoDB data)
docker compose down -v

# Remove images too
docker compose down -v --rmi all
```

---

**Quick Start Summary:**

1. `cd backend && cp .env.example .env` (edit OpenAI key)
2. `docker compose up -d --build`
3. `docker compose exec app composer install`
4. `docker compose exec app php artisan key:generate`
5. `docker compose exec app php artisan db:seed`
6. Open new terminal: `cd mobile && npm start`

Backend: http://localhost:8000
Mobile: Scan QR or press 'a'/'i'
