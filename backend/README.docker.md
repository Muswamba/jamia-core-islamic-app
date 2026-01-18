# Adhan Prayer Times API - Docker Setup

Laravel API backend running in Docker containers with MongoDB, Redis, Queue Worker, and Scheduler.

## Docker Architecture

### Services

1. **app** (PHP 8.2 FPM)
   - Main Laravel application
   - MongoDB driver installed
   - Redis extension installed
   - Port: 9000 (internal)

2. **nginx** (Alpine)
   - Web server
   - Port: 8000 (mapped to host)
   - Proxies requests to app:9000

3. **mongo** (MongoDB 7)
   - Database service
   - Port: 27017 (mapped to host for development)
   - Volume: mongo_data (persistent)

4. **redis** (Alpine)
   - Cache and queue service
   - Port: 6379 (mapped to host for development)

5. **worker**
   - Same PHP image as app
   - Runs: `php artisan queue:work redis`
   - Processes queued jobs (AI logging, etc.)

6. **scheduler**
   - Same PHP image as app
   - Runs: `php artisan schedule:work`
   - Executes scheduled tasks (daily cleanup at 2 AM)

## Quick Start

### Prerequisites
- Docker Desktop installed
- Docker Compose V2
- OpenAI API key

### Installation

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Edit .env and add OpenAI key**:
   ```bash
   # Edit .env file and set:
   OPENAI_API_KEY=your_openai_api_key_here

   # Verify Docker service names are set:
   DB_HOST=mongo
   REDIS_HOST=redis
   QUEUE_CONNECTION=redis
   ```

4. **Build and start all containers**:
   ```bash
   docker compose up -d --build
   ```

   This will:
   - Build PHP images with all extensions
   - Start MongoDB, Redis, Nginx, App, Worker, Scheduler
   - Create persistent volumes

5. **Install Composer dependencies** (first time only):
   ```bash
   docker compose exec app composer install
   ```

6. **Generate application key**:
   ```bash
   docker compose exec app php artisan key:generate
   ```

7. **Seed the database**:
   ```bash
   docker compose exec app php artisan db:seed
   ```

8. **Verify API is running**:
   ```bash
   curl http://localhost:8000/api/health
   ```

   Should return:
   ```json
   {"status":"ok","timestamp":"2025-..."}
   ```

## Common Commands

### Container Management

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart services
docker compose restart

# View running containers
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f app
docker compose logs -f worker
docker compose logs -f scheduler
```

### Laravel Artisan Commands

Run any artisan command inside the `app` container:

```bash
# General format
docker compose exec app php artisan <command>

# Examples:
docker compose exec app php artisan db:seed
docker compose exec app php artisan queue:work
docker compose exec app php artisan schedule:run
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear
```

### Database Operations

```bash
# Access MongoDB shell
docker compose exec mongo mongosh adhan_app

# Inside mongosh:
> show collections
> db.learn_packs.find()
> db.translation_catalogs.find()
> db.ai_request_logs.countDocuments()
> exit
```

### Redis Operations

```bash
# Access Redis CLI
docker compose exec redis redis-cli

# Inside redis-cli:
> PING
> KEYS *
> MONITOR  # Watch live commands
> EXIT
```

### Queue Worker

The worker container runs automatically and processes:
- AI request logging jobs
- Future notification jobs

```bash
# View worker logs
docker compose logs -f worker

# Restart worker (after code changes)
docker compose restart worker

# Check failed jobs
docker compose exec app php artisan queue:failed

# Retry failed jobs
docker compose exec app php artisan queue:retry all
```

### Scheduler

The scheduler container runs `schedule:work` which checks for scheduled tasks every minute.

Currently scheduled:
- `adhan:daily-tasks` at 2:00 AM daily
  - Cleans up old AI request logs (90+ days)

```bash
# View scheduler logs
docker compose logs -f scheduler

# List scheduled tasks
docker compose exec app php artisan schedule:list

# Run scheduler manually (testing)
docker compose exec app php artisan schedule:run

# Restart scheduler
docker compose restart scheduler
```

## Development Workflow

### Code Changes

For PHP/Laravel code changes:
1. Edit files on host machine
2. Changes are reflected immediately (volume mounted)
3. For queue jobs: restart worker
4. For scheduled tasks: restart scheduler

```bash
# After changing queue job
docker compose restart worker

# After changing scheduled task
docker compose restart scheduler
```

### Installing New Packages

```bash
# Composer packages
docker compose exec app composer require vendor/package

# After composer changes
docker compose restart app worker scheduler
```

### Database Seeding

```bash
# Run all seeders
docker compose exec app php artisan db:seed

# Run specific seeder
docker compose exec app php artisan db:seed --class=LearnPackSeeder

# Fresh seed (warning: deletes data)
docker compose exec mongo mongosh adhan_app --eval "db.dropDatabase()"
docker compose exec app php artisan db:seed
```

## API Endpoints

All endpoints available at `http://localhost:8000/api/...`

### Health Check
```bash
curl http://localhost:8000/api/health
```

### Content API
```bash
# Get learn content
curl "http://localhost:8000/api/v1/content/learn?lang=en"
```

### Quran API
```bash
# Get translation catalog
curl http://localhost:8000/api/v1/quran/translations/catalog

# Get translation
curl "http://localhost:8000/api/v1/quran/translation?lang=en&surah=1"
```

### AI API (requires OpenAI key)
```bash
# Chat
curl -X POST http://localhost:8000/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test-device","message":"What are the five pillars of Islam?"}'

# Explain Ayah
curl -X POST http://localhost:8000/api/v1/ai/explain-ayah \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test-device","surah":1,"ayah":1,"text":"بِسْمِ اللَّهِ"}'
```

## Troubleshooting

### Containers won't start

```bash
# Check container status
docker compose ps

# View logs for errors
docker compose logs

# Rebuild containers
docker compose down
docker compose up -d --build
```

### MongoDB connection error

```bash
# Verify MongoDB is running
docker compose ps mongo

# Check MongoDB logs
docker compose logs mongo

# Test connection
docker compose exec mongo mongosh --eval "db.version()"
```

### Redis connection error

```bash
# Verify Redis is running
docker compose ps redis

# Check Redis logs
docker compose logs redis

# Test connection
docker compose exec redis redis-cli ping
```

### Queue not processing

```bash
# Check worker logs
docker compose logs -f worker

# Verify Redis connection
docker compose exec worker php artisan queue:work redis --once

# Restart worker
docker compose restart worker
```

### Scheduler not running

```bash
# Check scheduler logs
docker compose logs -f scheduler

# List scheduled tasks
docker compose exec scheduler php artisan schedule:list

# Test manual run
docker compose exec scheduler php artisan schedule:run
```

### Permission errors

```bash
# Fix storage permissions
docker compose exec app chmod -R 775 storage bootstrap/cache
docker compose exec app chown -R www-data:www-data storage bootstrap/cache
```

### Clear caches

```bash
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear
docker compose exec app php artisan route:clear
docker compose exec app php artisan view:clear
```

## File Structure

```
/backend
  /docker
    /php
      Dockerfile           # PHP 8.2 FPM with MongoDB & Redis
    /nginx
      default.conf         # Nginx configuration
  docker-compose.yml       # All services definition
  .env.example             # Environment template
  .env                     # Your environment (create from example)
  /app                     # Laravel application
  /routes
    api.php                # API routes
  /database
    /seeders              # Database seeders
```

## Production Considerations

For production deployment:

1. **Remove port mappings** for mongo/redis (security)
2. **Add MongoDB authentication**:
   ```yaml
   environment:
     MONGO_INITDB_ROOT_USERNAME: admin
     MONGO_INITDB_ROOT_PASSWORD: secure_password
   ```
3. **Add Redis password**:
   ```yaml
   command: redis-server --requirepass your_password
   ```
4. **Use secrets** instead of environment variables
5. **Setup monitoring** (Prometheus, Grafana)
6. **Configure log rotation**
7. **Use production nginx config** with SSL
8. **Scale workers** based on load:
   ```bash
   docker compose up -d --scale worker=3
   ```

## Stopping and Cleanup

```bash
# Stop all containers
docker compose down

# Stop and remove volumes (WARNING: deletes data)
docker compose down -v

# Stop and remove images
docker compose down --rmi all

# Complete cleanup
docker compose down -v --rmi all --remove-orphans
```

## Performance Tuning

### PHP-FPM Settings

Edit `docker/php/Dockerfile` to adjust:
- `pm.max_children`
- `pm.start_servers`
- `pm.min_spare_servers`
- `pm.max_spare_servers`

### Worker Scaling

```bash
# Run multiple workers
docker compose up -d --scale worker=3
```

### MongoDB Indexing

```bash
# Add indexes for performance
docker compose exec mongo mongosh adhan_app

> db.ai_request_logs.createIndex({ device_id: 1, created_at: -1 })
> db.learn_packs.createIndex({ lang: 1 })
> db.translation_catalogs.createIndex({ lang: 1 })
```

## Monitoring

### Container Resource Usage

```bash
# View resource stats
docker stats

# Specific container
docker stats adhan_app adhan_worker adhan_scheduler
```

### Application Logs

```bash
# Laravel logs (inside container)
docker compose exec app tail -f storage/logs/laravel.log

# Or from host
tail -f storage/logs/laravel.log
```

### Queue Metrics

```bash
# Queue status
docker compose exec app php artisan queue:work redis --once --verbose

# Failed jobs
docker compose exec app php artisan queue:failed
```

## Backup and Restore

### MongoDB Backup

```bash
# Backup
docker compose exec mongo mongodump \
  --db=adhan_app \
  --out=/tmp/backup

docker cp adhan_mongo:/tmp/backup ./backup

# Restore
docker cp ./backup adhan_mongo:/tmp/backup
docker compose exec mongo mongorestore \
  --db=adhan_app \
  /tmp/backup/adhan_app
```

## Support

For issues:
1. Check logs: `docker compose logs -f`
2. Verify services: `docker compose ps`
3. Test connections to MongoDB/Redis
4. Review main [README.md](../README.md)

---

**Docker-based Laravel API** - Ready for development and production deployment
