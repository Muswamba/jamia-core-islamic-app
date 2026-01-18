# Adhan & Prayer Times + Quran + Learn + AI Helper

A production-ready mobile application for Muslims featuring prayer times, Quran reading, Islamic learning content, Qibla direction, and an educational AI assistant.

## Stack

- **Mobile**: React Native Expo (TypeScript)
- **Backend**: Laravel (API-only) + MongoDB + Redis Queue + Scheduler
- **Languages**: English (en), French (fr), Swahili (sw)
- **Architecture**: Offline-first for core features

## Features

### Prayer Times & Adhan
- Accurate prayer time calculations with multiple methods (MWL, ISNA, Egypt, Umm al-Qura, Karachi)
- Asr calculation options (Shafi/Hanafi)
- High latitude adjustment rules
- Manual time offsets per prayer
- Local notifications for each prayer
- Location detection with manual fallback
- Auto-reschedule at midnight

### Quran
- Arabic text for all 114 surahs (read-only)
- Translations in English, French, and Swahili
- Translation caching for offline use
- Bookmarks per ayah
- Last read position
- Search within translations
- Credits & Sources screen

### Learn
- Educational content in 3 languages
- Organized by categories (Islamic Basics, Worship, Daily Duas)
- Interactive quizzes with scoring
- Progress tracking
- Sample lessons: Five Pillars, Wudu, Salah, Daily Duas

### Qibla Compass
- Calculates direction to Kaaba from user location
- Animated compass needle (when sensor available)
- Fallback to numeric bearing display
- Calibration help text

### AI Educational Assistant
- Powered by OpenAI GPT-3.5 Turbo
- Strict guardrails: refuses fatwa/legal ruling requests
- Rate limiting per device (10 requests/hour default)
- Request logging and monitoring
- Chat interface with educational context
- Ayah explanation feature
- Visible disclaimer on all AI interactions

## Project Structure

```
/mobile                          # React Native Expo app
  /src
    /app                         # Expo Router screens
      /(tabs)                    # Tab navigation
        index.tsx                # Home (Prayer Times)
        quran.tsx                # Quran reader
        learn.tsx                # Learning modules
        qibla.tsx                # Qibla compass
        settings.tsx             # Settings
      ai-helper.tsx              # AI chat screen
      _layout.tsx                # Root layout
    /components                  # Reusable components
      AIChat.tsx                 # AI chat interface
    /modules                     # Feature modules
      /prayerTimes
        calculations.ts          # Prayer time calculations
        types.ts                 # Type definitions
      /adhan
        notifications.ts         # Notification scheduling
        types.ts
      /quran
        data.ts                  # Quran metadata
        api.ts                   # Backend API calls
        types.ts
      /learn
        data.ts                  # Lesson content
        types.ts
      /qibla
        calculations.ts          # Qibla direction math
      /ai
        api.ts                   # AI API integration
    /i18n                        # Internationalization
      en.json                    # English translations
      fr.json                    # French translations
      sw.json                    # Swahili translations
      index.ts                   # i18n setup
    /storage                     # Local storage utilities
    /utils                       # Utility functions
  package.json
  app.json
  tsconfig.json

/backend                         # Laravel API
  /app
    /Http
      /Controllers/Api
        AIController.php         # AI endpoints
        ContentController.php    # Learn content API
        QuranController.php      # Quran translation API
      /Requests
        AIChatRequest.php        # Validation for chat
        AIExplainAyahRequest.php # Validation for ayah
    /Jobs
      LogAIRequestJob.php        # Queued AI logging
    /Models
      LearnPack.php              # Learn content model
      TranslationCatalog.php     # Translation metadata
      AIRequestLog.php           # AI request logs
      Device.php                 # Device info (optional)
    /Services
      OpenAIService.php          # OpenAI integration
      AIGuardrailService.php     # Safety guardrails
    /Console
      /Commands
        DailyAdhanTasks.php      # Daily maintenance
      Kernel.php                 # Scheduler config
  /config
    database.php                 # MongoDB configuration
    queue.php                    # Redis queue config
    services.php                 # External services
  /database
    /seeders
      LearnPackSeeder.php        # Seed learn content
      TranslationCatalogSeeder.php # Seed catalogs
      DatabaseSeeder.php
  /routes
    api.php                      # API routes
  composer.json
  .env.example
```

## Setup Instructions

### Prerequisites

1. **Mobile Development**:
   - Node.js 18+ and npm/yarn
   - Expo CLI: `npm install -g expo-cli`
   - For iOS: Xcode (macOS only)
   - For Android: Android Studio + SDK

2. **Backend Development**:
   - PHP 8.1+
   - Composer
   - MongoDB 5.0+
   - Redis (recommended for queue)
   - OpenAI API key

### Mobile Setup

1. Navigate to mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on device/emulator:
   - For iOS: `npm run ios` (requires macOS)
   - For Android: `npm run android`
   - Or scan QR code with Expo Go app

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure `.env`:
   ```
   DB_CONNECTION=mongodb
   DB_HOST=127.0.0.1
   DB_PORT=27017
   DB_DATABASE=adhan_app
   DB_USERNAME=
   DB_PASSWORD=

   QUEUE_CONNECTION=redis
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379

   OPENAI_API_KEY=your_openai_api_key_here

   RATE_LIMIT_AI_PER_DEVICE=10
   RATE_LIMIT_AI_DECAY_MINUTES=60
   ```

5. Generate application key:
   ```bash
   php artisan key:generate
   ```

6. Seed the database:
   ```bash
   php artisan db:seed
   ```

7. Start the development server:
   ```bash
   php artisan serve
   ```
   API will be available at `http://localhost:8000`

8. Start the queue worker (in a separate terminal):
   ```bash
   php artisan queue:work redis
   ```

9. Setup scheduler (for production):

   Add to crontab:
   ```cron
   * * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
   ```

   For local testing:
   ```bash
   php artisan schedule:work
   ```

### MongoDB Setup

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)

2. Start MongoDB service:
   ```bash
   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   net start MongoDB
   ```

3. Verify connection:
   ```bash
   mongosh
   ```

### Redis Setup (Optional but Recommended)

1. Install Redis:
   ```bash
   # macOS
   brew install redis

   # Linux
   sudo apt-get install redis-server

   # Windows
   # Use WSL or download from https://github.com/microsoftarchive/redis
   ```

2. Start Redis:
   ```bash
   # macOS
   brew services start redis

   # Linux
   sudo systemctl start redis

   # Windows
   redis-server
   ```

3. If not using Redis, update `.env`:
   ```
   QUEUE_CONNECTION=database
   ```

## API Endpoints

### Content
- `GET /api/v1/content/learn?lang={en|fr|sw}` - Get learn content for language

### Quran
- `GET /api/v1/quran/translations/catalog` - Get translation catalog with attributions
- `GET /api/v1/quran/translation?lang={en|fr|sw}&surah={1-114}` - Get translation for surah

### AI (Rate Limited)
- `POST /api/v1/ai/chat` - Chat with AI assistant
  ```json
  {
    "device_id": "unique-device-id",
    "message": "What are the five pillars of Islam?"
  }
  ```

- `POST /api/v1/ai/explain-ayah` - Get explanation of Quranic verse
  ```json
  {
    "device_id": "unique-device-id",
    "surah": 1,
    "ayah": 1,
    "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
  }
  ```

### Health Check
- `GET /api/health` - API health status

## Testing

### Mobile
```bash
cd mobile
npm test
```

### Backend
```bash
cd backend
php artisan test
```

## Key Features Implementation Notes

### Offline-First Strategy
- Prayer times calculated locally on device
- Quran Arabic text bundled with app
- Translations cached after first fetch
- Learn content cached from backend
- Settings stored locally
- Only AI features require internet

### Security
- No API keys in mobile app code
- All AI requests go through backend proxy
- Rate limiting enforced server-side
- Request logging for monitoring
- Device ID based throttling
- Input validation on all endpoints

### AI Safety Guardrails
- System prompt enforces educational purpose only
- Keyword filtering for fatwa/ruling requests
- Pattern matching for halal/haram questions
- Refusal messages encourage consulting scholars
- All responses include disclaimer
- Comprehensive request logging

### Internationalization
- All UI strings use i18n
- Device language auto-detection
- Fallback to English
- Language persistence
- RTL-ready layout support

### Prayer Time Calculation
- Multiple calculation methods supported
- DST aware timezone handling
- High latitude adjustments
- Manual time corrections
- Supports global locations

### Data Attribution
- Quran text: Tanzil.net
- Translations: Attributed in catalog
- Credits screen in Settings
- Source links provided
- License notes included

## Artisan Commands

### Daily Tasks
```bash
php artisan adhan:daily-tasks
```
Runs daily maintenance:
- Cleans up old AI request logs (90+ days)
- Future: notification scheduling, cache updates

### Queue Worker
```bash
php artisan queue:work redis --queue=default --tries=3
```

### Scheduler (runs automatically via cron)
```bash
php artisan schedule:run
```

### Database Seeding
```bash
# Seed all
php artisan db:seed

# Specific seeders
php artisan db:seed --class=LearnPackSeeder
php artisan db:seed --class=TranslationCatalogSeeder
```

## Environment Variables

### Mobile
Configure in `mobile/.env` if needed (currently using hardcoded localhost):
```
API_BASE_URL=http://localhost:8000/api/v1
```

### Backend
Required in `backend/.env`:
```
APP_NAME="Adhan Prayer API"
APP_ENV=local
APP_KEY=                              # Generated by php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mongodb
DB_HOST=127.0.0.1
DB_PORT=27017
DB_DATABASE=adhan_app

QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

OPENAI_API_KEY=                       # Your OpenAI API key
RATE_LIMIT_AI_PER_DEVICE=10           # Requests per device per hour
RATE_LIMIT_AI_DECAY_MINUTES=60        # Rate limit window
```

## Production Deployment

### Mobile
1. Configure `app.json` with production values
2. Build standalone app:
   ```bash
   expo build:android
   expo build:ios
   ```
3. Submit to stores:
   ```bash
   expo upload:android
   expo upload:ios
   ```

### Backend
1. Use production environment variables
2. Set `APP_DEBUG=false`
3. Configure MongoDB with authentication
4. Setup Redis for queue (required in production)
5. Configure cron for scheduler
6. Use process manager for queue workers (e.g., Supervisor)
7. Setup HTTPS
8. Configure CORS if needed
9. Monitor logs and queue jobs

## Known Limitations

1. **Arabic Text**: Currently includes sample data for Al-Fatihah only. Full Quran text should be bundled from Tanzil.net
2. **Translations**: Only Surah 1 translations fully implemented. Extend to all 114 surahs
3. **Learn Content**: Contains 15-30 lessons. Expand library as needed
4. **AI Model**: Uses GPT-3.5 Turbo. Consider GPT-4 for better responses
5. **Push Notifications**: Local only. Backend has hooks for future server-side push
6. **User Accounts**: Not implemented in MVP. Can be added for cloud sync

## Credits & Sources

- **Quran Arabic Text**: [Tanzil.net](https://tanzil.net)
- **Prayer Times Algorithm**: Based on standard Islamic astronomical calculations
- **Translations**: Public domain translations (see Translation Catalog)
- **AI**: OpenAI GPT-3.5 Turbo (educational use only)

## Disclaimer

This application is provided as a tool for Muslims. Users should:
- Verify prayer times with local mosques
- Consult qualified Islamic scholars for religious guidance
- Not rely on AI for religious rulings (fatwas)
- Understand AI responses are educational only

## License

MIT License - See LICENSE file for details

## Support

For issues and feature requests, please open an issue on the project repository.

---

**Built with care for the Muslim community** 🕌
# jamia-core-islamic-app
