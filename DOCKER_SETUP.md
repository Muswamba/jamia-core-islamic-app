# Docker Setup Guide - Adhan Prayer App

Complete guide to running the Adhan Prayer App with Docker for the backend.

## Architecture Overview

```
┌─────────────────┐
│  Mobile App     │
│  (Expo/RN)      │
│  Port: 19000+   │
└────────┬────────┘
         │
         │ HTTP Requests
         │
         ▼
┌─────────────────────────────────────────┐
│  Docker Compose Services                │
│                                         │
│  ┌──────────┐    ┌─────────────────┐  │
│  │  nginx   │───▶│  app (PHP-FPM)  │  │
│  │  :8000   │    │  Laravel API     │  │
│  └──────────┘    └────────┬─────────┘  │
│                           │             │
│  ┌──────────┐    ┌───────▼────────┐   │
│  │  worker  │───▶│  redis          │   │
│  │  queue   │    │  :6379          │   │
│  └──────────┘    └─────────────────┘   │
│                                         │
│  ┌──────────┐    ┌─────────────────┐  │
│  │scheduler │───▶│  mongo          │   │
│  │ schedule │    │  :27017         │   │
│  └──────────┘    └─────────────────┘   │
└─────────────────────────────────────────┘
```

## Prerequisites

### Install Docker
- **Windows**: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- **macOS**: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Linux**: [Docker Engine](https://docs.docker.com/engine/install/)

Verify installation:
```bash
docker --version
docker compose version
```

### Other Requirements
- Node.js 18+ (for mobile app)
- OpenAI API key (for AI features)

## Step-by-Step Setup

### Step 1: Backend Setup with Docker (10 minutes)

```bash
# Navigate to backend directory
cd backend

# Copy environment file
cp .env.example .env

# Edit .env file and add your OpenAI API key
# On Windows: notepad .env
# On macOS/Linux: nano .env or vim .env

# Set this line:
# OPENAI_API_KEY=your_actual_api_key_here

# Verify Docker service names are correct (should already be set):
# DB_HOST=mongo
# REDIS_HOST=redis
# QUEUE_CONNECTION=redis

# Build and start all containers (first time takes 5-10 minutes)
docker compose up -d --build
```

**What this does:**
- Builds PHP 8.2 FPM image with MongoDB and Redis extensions
- Starts MongoDB 7 container
- Starts Redis container
- Starts Nginx container (port 8000)
- Starts Laravel app container
- Starts queue worker container
- Starts scheduler container

**Wait for containers to start** (check status):
```bash
docker compose ps
```

All services should show "Up" or "running" status.

### Step 2: Install Laravel Dependencies

```bash
# Install Composer packages inside container
docker compose exec app composer install

# Generate Laravel application key
docker compose exec app php artisan key:generate
```

### Step 3: Seed the Database

```bash
# Run database seeders
docker compose exec app php artisan db:seed
```

This seeds:
- Learn content packs (English, French, Swahili)
- Translation catalog with attributions

### Step 4: Verify Backend is Working

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Should return:
# {"status":"ok","timestamp":"2025-..."}

# Test learn content endpoint
curl "http://localhost:8000/api/v1/content/learn?lang=en"

# Should return learn content JSON
```

✅ **Backend is now running!**

### Step 5: Mobile App Setup (5 minutes)

Open a new terminal (keep backend running):

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start Expo development server
npm start
```

### Step 6: Run the Mobile App

After `npm start`, you'll see options:

**Option A: Expo Go (Recommended for Quick Testing)**
1. Install "Expo Go" from App Store (iOS) or Play Store (Android)
2. Scan QR code shown in terminal
3. App will load on your phone

**Option B: Emulator/Simulator**
```bash
# For Android
npm run android

# For iOS (macOS only)
npm run ios
```

**Important**: If using a physical device, update API URL:
1. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4)
   - macOS/Linux: `ifconfig` or `ip addr`
2. Edit these files and replace `localhost` with your IP:
   - `mobile/src/modules/ai/api.ts`
   - `mobile/src/modules/quran/api.ts`
3. Restart Expo: `npm start --clear`

## Verifying Everything Works

### 1. Check Docker Containers
```bash
cd backend
docker compose ps
```

Expected output:
```
NAME                STATUS
adhan_app           Up
adhan_nginx         Up (healthy)
adhan_mongo         Up
adhan_redis         Up
adhan_worker        Up
adhan_scheduler     Up
```

### 2. Check Container Logs
```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f app
docker compose logs -f worker
docker compose logs -f scheduler
```

### 3. Test API Endpoints
```bash
# Health check
curl http://localhost:8000/api/health

# Learn content (English)
curl "http://localhost:8000/api/v1/content/learn?lang=en"

# Translation catalog
curl http://localhost:8000/api/v1/quran/translations/catalog

# Quran translation
curl "http://localhost:8000/api/v1/quran/translation?lang=en&surah=1"
```

### 4. Test AI Endpoint (requires OpenAI key)
```bash
curl -X POST http://localhost:8000/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test-device-123",
    "message": "What are the five pillars of Islam?"
  }'
```

Should return educational response with disclaimer.

### 5. Test Mobile App Features

Once app is running:
1. **Home**: Grant location, see prayer times
2. **Quran**: Browse surahs, read with translations
3. **Learn**: Explore lessons and quizzes
4. **Qibla**: See direction compass
5. **Settings**: Change language, open AI Helper
6. **AI Helper**: Ask educational questions

## Daily Development Workflow

### Starting Work
```bash
# Start backend (if stopped)
cd backend
docker compose up -d

# Start mobile
cd ../mobile
npm start
```

### Making Backend Changes
```bash
# Code changes are automatically reflected (volume mounted)

# After changing queue jobs
docker compose restart worker

# After changing scheduled tasks
docker compose restart scheduler

# After changing config
docker compose exec app php artisan config:clear
```

### Stopping Work
```bash
# Stop backend
cd backend
docker compose down

# Mobile stops automatically (Ctrl+C)
```

## Common Docker Commands

### Container Management
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart a service
docker compose restart app

# View logs
docker compose logs -f app

# Access container shell
docker compose exec app bash
```

### Laravel Commands
```bash
# Run any artisan command
docker compose exec app php artisan <command>

# Examples:
docker compose exec app php artisan cache:clear
docker compose exec app php artisan queue:work --once
docker compose exec app php artisan schedule:run
```

### Database Access
```bash
# MongoDB shell
docker compose exec mongo mongosh adhan_app

# Inside mongosh:
> db.learn_packs.find()
> db.ai_request_logs.countDocuments()
> exit

# Redis CLI
docker compose exec redis redis-cli
> PING
> KEYS *
> EXIT
```

## Troubleshooting

### Issue: "Port already in use"

MongoDB or Redis port conflict:
```bash
# Check what's using port
# Windows:
netstat -ano | findstr :27017
netstat -ano | findstr :6379

# macOS/Linux:
lsof -i :27017
lsof -i :6379

# Stop local MongoDB/Redis if running
# Then restart Docker:
docker compose down
docker compose up -d
```

### Issue: "Connection refused" from mobile

Backend not reachable from phone:
1. Verify backend is running: `curl http://localhost:8000/api/health`
2. If using physical device:
   - Get your computer's IP address
   - Update mobile API URLs to use `http://YOUR_IP:8000`
   - Ensure firewall allows port 8000
3. Restart mobile app with cache clear: `npm start --clear`

### Issue: Containers keep restarting
```bash
# Check logs for errors
docker compose logs app
docker compose logs worker

# Common fixes:
# 1. Ensure .env exists
# 2. Check MongoDB/Redis are healthy
# 3. Rebuild containers
docker compose down
docker compose up -d --build
```

### Issue: MongoDB connection error
```bash
# Check MongoDB is running
docker compose ps mongo

# Verify .env has:
# DB_HOST=mongo (not localhost)

# Test MongoDB connection
docker compose exec mongo mongosh --eval "db.version()"
```

### Issue: Queue not processing
```bash
# Check worker logs
docker compose logs -f worker

# Verify Redis is up
docker compose exec redis redis-cli ping

# Restart worker
docker compose restart worker
```

### Issue: Seeding fails
```bash
# Check MongoDB connection
docker compose exec app php artisan tinker
>>> DB::connection()->getMongoDB()->command(['ping' => 1])

# Drop and reseed
docker compose exec mongo mongosh adhan_app --eval "db.dropDatabase()"
docker compose exec app php artisan db:seed
```

### Issue: AI not working
1. Check OpenAI key in `.env`
2. Verify key is valid at [platform.openai.com](https://platform.openai.com)
3. Check you have API credits
4. View logs: `docker compose logs -f app`

## File Locations

```
/backend
  docker-compose.yml        # All services configuration
  .env                      # Your environment (create from .env.example)
  /docker
    /php/Dockerfile         # PHP 8.2 + MongoDB + Redis
    /nginx/default.conf     # Nginx proxy config
  /app                      # Laravel application code
  /storage/logs            # Application logs
    laravel.log            # Main log file

/mobile
  /src                     # React Native source
  package.json            # Dependencies
```

## Accessing Logs

### Application Logs
```bash
# Laravel logs (inside container)
docker compose exec app tail -f storage/logs/laravel.log

# Or from host machine
cd backend
tail -f storage/logs/laravel.log
```

### Container Logs
```bash
# All containers
docker compose logs -f

# Specific container
docker compose logs -f app
docker compose logs -f worker
docker compose logs -f scheduler
docker compose logs -f nginx
```

### Nginx Access Logs
```bash
docker compose exec nginx tail -f /var/log/nginx/access.log
docker compose exec nginx tail -f /var/log/nginx/error.log
```

## Performance Monitoring

```bash
# Container resource usage
docker stats

# Specific containers
docker stats adhan_app adhan_worker adhan_scheduler

# Queue status
docker compose exec app php artisan queue:work --once --verbose

# Failed jobs
docker compose exec app php artisan queue:failed
```

## Backup and Restore

### Backup MongoDB
```bash
# Create backup
docker compose exec mongo mongodump \
  --db=adhan_app \
  --out=/tmp/backup

# Copy to host
docker cp adhan_mongo:/tmp/backup ./mongodb-backup-$(date +%Y%m%d)
```

### Restore MongoDB
```bash
# Copy backup to container
docker cp ./mongodb-backup-20250113 adhan_mongo:/tmp/backup

# Restore
docker compose exec mongo mongorestore \
  --db=adhan_app \
  /tmp/backup/adhan_app
```

## Production Deployment

For production:
1. **Remove dev port mappings** (mongo:27017, redis:6379)
2. **Add authentication**:
   - MongoDB username/password
   - Redis requirepass
3. **Use Docker secrets** for sensitive data
4. **Setup SSL** with Let's Encrypt
5. **Configure monitoring** (Prometheus, Grafana)
6. **Scale workers**: `docker compose up -d --scale worker=3`
7. **Use production `.env`**: `APP_DEBUG=false`

See [backend/README.docker.md](backend/README.docker.md) for detailed production guide.

## Cleanup

### Stop Everything
```bash
cd backend
docker compose down
```

### Remove Volumes (deletes data)
```bash
docker compose down -v
```

### Complete Cleanup
```bash
# Remove containers, volumes, images
docker compose down -v --rmi all --remove-orphans

# Verify cleanup
docker compose ps
docker volume ls
```

## Next Steps

1. **Explore the API**: Try all endpoints with curl or Postman
2. **Test mobile features**: Prayer times, Quran, Learn, AI
3. **Customize content**: Edit seeders and re-run `db:seed`
4. **Add more lessons**: Update LearnPackSeeder
5. **Extend Quran data**: Add full Arabic text for all surahs
6. **Setup monitoring**: Add Prometheus exporters
7. **Deploy to production**: Follow production checklist

## Getting Help

- **Docker Issues**: Check [backend/README.docker.md](backend/README.docker.md)
- **API Issues**: Check Laravel logs in `storage/logs/laravel.log`
- **Mobile Issues**: Check Expo terminal output
- **General**: Review main [README.md](README.md)

---

**You're ready to develop!** 🚀

Backend API: `http://localhost:8000`
Mobile App: Expo Dev Server
MongoDB: `localhost:27017`
Redis: `localhost:6379`

All services running in Docker with hot-reload for development.
