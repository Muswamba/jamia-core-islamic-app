# Adhan Prayer Times API - Backend

Laravel API-only backend for the Adhan mobile application. Provides content delivery, Quran translations, and AI educational assistant with strict safety guardrails.

## Quick Start

### Prerequisites
- PHP 8.1 or higher
- Composer
- MongoDB 5.0+
- Redis (recommended) or database queue
- OpenAI API key

### Installation

1. Install dependencies:
   ```bash
   composer install
   ```

2. Setup environment:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. Configure `.env` with your MongoDB and Redis credentials:
   ```
   DB_CONNECTION=mongodb
   DB_HOST=127.0.0.1
   DB_PORT=27017
   DB_DATABASE=adhan_app

   QUEUE_CONNECTION=redis
   OPENAI_API_KEY=your_key_here
   ```

4. Seed the database:
   ```bash
   php artisan db:seed
   ```

5. Start services:
   ```bash
   # Terminal 1: API server
   php artisan serve

   # Terminal 2: Queue worker
   php artisan queue:work redis

   # Terminal 3: Scheduler (for testing)
   php artisan schedule:work
   ```

## Architecture

### MongoDB Collections

1. **learn_packs**: Learning content by language
   - Fields: lang, version, categories[], lessons[], updated_at
   - Indexed by: lang

2. **translation_catalogs**: Quran translation metadata
   - Fields: lang, translator_name, source_name, license_note, attribution_text
   - Indexed by: lang

3. **ai_request_logs**: AI interaction logs
   - Fields: device_id, endpoint, allowed, reason, request_data, created_at
   - Indexed by: device_id, created_at

4. **devices** (optional): Device metadata
   - Fields: device_id, locale, notification_prefs, created_at

### API Structure

```
/app
  /Http
    /Controllers/Api
      AIController.php          # AI chat and explain endpoints
      ContentController.php     # Learn content delivery
      QuranController.php       # Translation delivery
    /Requests
      AIChatRequest.php         # Chat validation
      AIExplainAyahRequest.php  # Ayah explanation validation
  /Jobs
    LogAIRequestJob.php         # Async logging
  /Models
    LearnPack.php
    TranslationCatalog.php
    AIRequestLog.php
    Device.php
  /Services
    OpenAIService.php           # OpenAI integration
    AIGuardrailService.php      # Safety enforcement
  /Console
    /Commands
      DailyAdhanTasks.php       # Cleanup and maintenance
```

## API Endpoints

### Content API

#### Get Learn Content
```http
GET /api/v1/content/learn?lang={en|fr|sw}

Response:
{
  "success": true,
  "data": {
    "lang": "en",
    "version": "1.0",
    "categories": [...],
    "lessons": [...]
  }
}
```

### Quran API

#### Get Translation Catalog
```http
GET /api/v1/quran/translations/catalog

Response:
{
  "success": true,
  "data": [
    {
      "lang": "en",
      "translatorName": "Saheeh International",
      "sourceName": "Quran.com",
      "licenseNote": "Public Domain",
      "attributionText": "Translation by Saheeh International..."
    }
  ]
}
```

#### Get Translation
```http
GET /api/v1/quran/translation?lang=en&surah=1

Response:
{
  "success": true,
  "data": {
    "1:1": "In the name of Allah...",
    "1:2": "All praise is due to Allah...",
    ...
  }
}
```

### AI API

#### Chat
```http
POST /api/v1/ai/chat
Content-Type: application/json

{
  "device_id": "unique-device-identifier",
  "message": "What are the five pillars of Islam?"
}

Success Response:
{
  "success": true,
  "data": {
    "response": "The Five Pillars of Islam are..."
  },
  "disclaimer": "This AI assistant is for educational purposes only..."
}

Blocked Response:
{
  "success": false,
  "blocked": true,
  "message": "Request appears to be asking for a religious ruling...",
  "disclaimer": "..."
}

Rate Limited Response (429):
{
  "success": false,
  "message": "Rate limit exceeded. Please try again in X minutes."
}
```

#### Explain Ayah
```http
POST /api/v1/ai/explain-ayah
Content-Type: application/json

{
  "device_id": "unique-device-identifier",
  "surah": 1,
  "ayah": 1,
  "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
}

Response: (same structure as chat)
```

## AI Safety Guardrails

### Keyword Filtering
Blocks requests containing:
- fatwa, fatwas
- religious ruling, legal ruling
- halal or haram
- permissible or not
- is this halal/haram
- give me a fatwa

### Pattern Matching
Blocks patterns like:
- "is X halal"
- "are Y permissible"
- Questions seeking specific religious rulings

### System Prompt
Enforces educational context:
- No religious rulings (fatwas)
- No halal/haram determinations
- Encourages consulting scholars
- Focuses on general Islamic knowledge

### Response Handling
- All responses include disclaimer
- Blocked requests logged with reason
- Rate limiting per device
- Comprehensive logging for monitoring

## Rate Limiting

Default configuration (configurable in `.env`):
- 10 requests per device per hour
- Applies to both /chat and /explain-ayah
- Based on device_id
- Returns 429 status when exceeded

Configuration:
```env
RATE_LIMIT_AI_PER_DEVICE=10
RATE_LIMIT_AI_DECAY_MINUTES=60
```

## Queue System

### Jobs

#### LogAIRequestJob
- Queued: All AI requests
- Purpose: Async logging to MongoDB
- Data: device_id, endpoint, allowed, reason, request_data

### Running Queue Worker

Development:
```bash
php artisan queue:work redis --queue=default
```

Production (use process manager like Supervisor):
```ini
[program:adhan-queue-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/backend/artisan queue:work redis --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/logs/queue-worker.log
```

## Scheduler

### Daily Tasks

Command: `adhan:daily-tasks`
Schedule: Daily at 2:00 AM

Tasks:
- Clean up old AI request logs (90+ days)
- Future: notification scheduling, cache updates

### Setup

Add to crontab:
```bash
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
```

For development:
```bash
php artisan schedule:work
```

## Database Seeding

### Seed All Data
```bash
php artisan db:seed
```

### Specific Seeders

Learn Content:
```bash
php artisan db:seed --class=LearnPackSeeder
```

Translation Catalog:
```bash
php artisan db:seed --class=TranslationCatalogSeeder
```

### Seeded Data

**Learn Packs (en, fr, sw)**:
- Categories: Islamic Basics, Worship, Daily Duas
- Lessons: Five Pillars, Wudu, Salah, Morning Duas, etc.
- Quizzes included for some lessons

**Translation Catalogs**:
- English: Saheeh International
- French: Muhammad Hamidullah
- Swahili: Ali Muhsin Al-Barwani

## Configuration Files

### config/database.php
MongoDB connection settings

### config/queue.php
Redis and database queue configuration

### config/services.php
OpenAI and rate limiting configuration

## Artisan Commands

### Custom Commands

```bash
# Daily maintenance tasks
php artisan adhan:daily-tasks

# Queue management
php artisan queue:work redis
php artisan queue:failed
php artisan queue:retry all

# Scheduler
php artisan schedule:run
php artisan schedule:work  # For development

# Database
php artisan db:seed
```

## Error Handling

### API Errors

All endpoints return consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

### HTTP Status Codes
- 200: Success
- 400: Bad request / validation error
- 404: Resource not found
- 429: Rate limit exceeded
- 500: Server error

### Logging

Logs location: `storage/logs/laravel.log`

Key events logged:
- OpenAI API errors
- AI guardrail blocks
- Queue job failures
- Daily task execution

## Monitoring

### Key Metrics to Monitor

1. **AI Request Logs**
   - Total requests per day
   - Blocked requests count
   - Most common block reasons
   - Response times

2. **Queue Health**
   - Failed jobs count
   - Average processing time
   - Queue depth

3. **API Performance**
   - Response times per endpoint
   - Error rates
   - Rate limit hits

### MongoDB Queries

Count AI requests today:
```javascript
db.ai_request_logs.countDocuments({
  created_at: { $gte: new Date(new Date().setHours(0,0,0,0)) }
})
```

Count blocked requests:
```javascript
db.ai_request_logs.countDocuments({ allowed: false })
```

## Testing

### Setup Test Database
```env
DB_DATABASE=adhan_app_test
```

### Run Tests
```bash
php artisan test
```

### Test Coverage
- Unit tests for services
- Feature tests for API endpoints
- AI guardrail tests

## Deployment

### Production Checklist

1. ✅ Set `APP_DEBUG=false`
2. ✅ Set `APP_ENV=production`
3. ✅ Configure MongoDB authentication
4. ✅ Setup Redis with password
5. ✅ Set secure `APP_KEY`
6. ✅ Configure OpenAI API key
7. ✅ Setup HTTPS
8. ✅ Configure CORS if needed
9. ✅ Setup queue worker with supervisor
10. ✅ Add cron job for scheduler
11. ✅ Setup log rotation
12. ✅ Configure monitoring

### Environment Variables

Required:
```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=                    # Generate with php artisan key:generate
APP_URL=https://api.example.com

DB_CONNECTION=mongodb
DB_HOST=127.0.0.1
DB_PORT=27017
DB_DATABASE=adhan_app
DB_USERNAME=your_username
DB_PASSWORD=your_password

QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

OPENAI_API_KEY=sk-...
RATE_LIMIT_AI_PER_DEVICE=10
RATE_LIMIT_AI_DECAY_MINUTES=60
```

## Security Best Practices

1. ✅ Never expose OpenAI API key to mobile app
2. ✅ Rate limit all AI endpoints
3. ✅ Validate all inputs
4. ✅ Log suspicious activity
5. ✅ Use MongoDB authentication in production
6. ✅ Secure Redis with password
7. ✅ Enable HTTPS only
8. ✅ Regular security updates
9. ✅ Monitor for abuse patterns
10. ✅ Implement IP-based rate limiting if needed

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongosh

# Check connection in Laravel
php artisan tinker
>>> DB::connection()->getMongoDB()->command(['ping' => 1])
```

### Queue Not Processing
```bash
# Check Redis connection
redis-cli ping

# Restart queue worker
php artisan queue:restart

# Check failed jobs
php artisan queue:failed
```

### OpenAI API Errors
- Verify API key in `.env`
- Check OpenAI account balance
- Review rate limits at OpenAI dashboard
- Check logs: `storage/logs/laravel.log`

## Contributing

When adding new features:
1. Follow Laravel conventions
2. Add validation for all inputs
3. Write tests
4. Update documentation
5. Add logging for important operations

## License

MIT License

---

**API Documentation**: See main README.md for complete API reference
**Mobile App**: See `/mobile/README.md`
