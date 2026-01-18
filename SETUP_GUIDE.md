# Quick Setup Guide - Adhan Prayer App

Follow these steps to get the app running on your machine.

## Prerequisites Installation

### 1. Install Node.js and npm
- Download from [nodejs.org](https://nodejs.org/) (v18 or higher)
- Verify: `node --version` and `npm --version`

### 2. Install Expo CLI
```bash
npm install -g expo-cli
```

### 3. Install PHP
- **Windows**: Download from [windows.php.net](https://windows.php.net/download/)
- **macOS**: `brew install php`
- **Linux**: `sudo apt-get install php8.1`
- Verify: `php --version` (should be 8.1+)

### 4. Install Composer
- Download from [getcomposer.org](https://getcomposer.org/)
- Verify: `composer --version`

### 5. Install MongoDB
- Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- Start service:
  - **Windows**: `net start MongoDB`
  - **macOS**: `brew services start mongodb-community`
  - **Linux**: `sudo systemctl start mongod`
- Verify: `mongosh` (should connect)

### 6. Install Redis (Optional but Recommended)
- **Windows**: Use WSL or download from [github.com/microsoftarchive/redis](https://github.com/microsoftarchive/redis)
- **macOS**: `brew install redis` then `brew services start redis`
- **Linux**: `sudo apt-get install redis-server` then `sudo systemctl start redis`
- Verify: `redis-cli ping` (should return PONG)

### 7. Get OpenAI API Key
- Sign up at [platform.openai.com](https://platform.openai.com/)
- Create API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Save the key for later

## Backend Setup (5 minutes)

Open a terminal in the project directory:

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies (may take 2-3 minutes)
composer install

# 3. Setup environment
cp .env.example .env

# 4. Generate app key
php artisan key:generate

# 5. Edit .env file
# Open backend/.env in a text editor and set:
#   OPENAI_API_KEY=your_api_key_here
#   (Keep other settings as default for local development)

# 6. Seed the database
php artisan db:seed

# 7. Start the API server (keep this terminal open)
php artisan serve
```

The API should now be running at `http://localhost:8000`

Open a **second terminal** for the queue worker:

```bash
cd backend

# If using Redis (recommended):
php artisan queue:work redis

# If not using Redis:
php artisan queue:work database
```

Keep both terminals open while developing.

## Mobile Setup (3 minutes)

Open a **third terminal**:

```bash
# 1. Navigate to mobile
cd mobile

# 2. Install dependencies (may take 2-3 minutes)
npm install

# 3. Start Expo dev server
npm start
```

## Running the App

After `npm start`, you'll see a QR code and menu options:

### Option A: Use Expo Go App (Easiest)
1. Install "Expo Go" from App Store (iOS) or Play Store (Android)
2. Scan the QR code with your phone camera
3. Expo Go will open automatically

### Option B: Use Emulator/Simulator
- For Android: Press `a` in the terminal
- For iOS (macOS only): Press `i` in the terminal

## Testing the Features

Once the app loads:

1. **Home Screen**:
   - Grant location permission when prompted
   - See today's prayer times
   - Watch the countdown to next prayer

2. **Quran Tab**:
   - Browse surahs
   - Tap a surah to read
   - Bookmark ayahs
   - Search translations

3. **Learn Tab**:
   - Explore categories
   - Read lessons
   - Take quizzes

4. **Qibla Tab**:
   - See direction to Makkah
   - Calibrate compass by moving phone in figure-8

5. **Settings Tab**:
   - Change language (English/French/Swahili)
   - Configure notifications
   - Change calculation method
   - Access AI Helper

6. **AI Helper** (from Settings):
   - Ask educational questions about Islam
   - Get ayah explanations
   - See disclaimer notice

## Verifying Everything Works

### Check API is Running
Open browser to: `http://localhost:8000/api/health`

Should see: `{"status":"ok","timestamp":"..."}`

### Check MongoDB
```bash
mongosh
use adhan_app
db.learn_packs.countDocuments()  # Should return 3 (en, fr, sw)
exit
```

### Check Queue Worker
In the queue worker terminal, you should see:
```
INFO  Processing jobs from the [default] queue.
```

### Test AI Feature
1. Open AI Helper in app
2. Send message: "What are the five pillars of Islam?"
3. Should receive educational response
4. Check backend terminal for logs

## Common Issues

### Mobile app shows "Network Error"
- Ensure backend is running: `php artisan serve`
- Check URL in [mobile/src/modules/ai/api.ts](mobile/src/modules/ai/api.ts:3) and [mobile/src/modules/quran/api.ts](mobile/src/modules/quran/api.ts:3)
- For physical device, replace `localhost` with your computer's IP

### "MongoDB connection failed"
```bash
# Check MongoDB is running
mongosh

# If not, start it:
# Windows:
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

### "Queue not processing"
- Check Redis is running: `redis-cli ping`
- If no Redis, change `.env`: `QUEUE_CONNECTION=database`
- Restart queue worker

### AI not responding
- Check OpenAI API key in `backend/.env`
- Verify API key is valid at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Check you have API credits
- Look for errors in backend terminal

### Location not detected
- Grant location permission when prompted
- If denied, use manual city entry
- On iOS simulator, set custom location: Features > Location > Custom Location

### Expo won't start
```bash
# Clear cache and restart
cd mobile
rm -rf node_modules
npm install
npx expo start --clear
```

## Production Deployment Notes

### Mobile App
1. Update API URL in code to production URL
2. Configure `app.json` with production settings
3. Build: `expo build:android` and `expo build:ios`
4. Submit to stores

### Backend API
1. Use production MongoDB with authentication
2. Setup Redis in production (required)
3. Configure HTTPS
4. Setup Supervisor for queue workers
5. Add cron job for scheduler
6. Set `APP_DEBUG=false` in `.env`
7. Review security checklist in backend/README.md

## File Structure Overview

```
/mobile                    # React Native Expo app
  /src
    /app                   # Screens (Expo Router)
    /components            # Reusable UI components
    /modules              # Feature modules
    /i18n                 # Translations (en/fr/sw)
    /storage              # Local persistence
  package.json
  app.json

/backend                   # Laravel API
  /app
    /Http/Controllers/Api  # API endpoints
    /Jobs                  # Queue jobs
    /Models               # MongoDB models
    /Services             # Business logic
    /Console/Commands     # Artisan commands
  /config                  # Configuration files
  /database/seeders        # Database seeders
  /routes/api.php         # API routes
  composer.json
  .env

README.md                  # Main documentation
SETUP_GUIDE.md            # This file
```

## Next Steps

1. **Extend Quran Data**: Add full Arabic text for all 114 surahs from Tanzil.net
2. **Add More Lessons**: Expand learn content library
3. **Improve AI**: Fine-tune prompts and add more safety checks
4. **Add Push Notifications**: Implement server-side push using Device model
5. **User Accounts**: Add authentication for cloud sync
6. **Advanced Features**:
   - Tafsir (commentary)
   - Hadith collection
   - Islamic calendar
   - Mosque finder

## Getting Help

- Check main [README.md](README.md) for detailed documentation
- Check backend [README.md](backend/README.md) for API details
- Review code comments for implementation details
- Check Laravel logs: `backend/storage/logs/laravel.log`

## Development Tips

### Hot Reload
- Mobile: Save files and see changes instantly
- Backend: Restart `php artisan serve` after changing routes/config

### Debugging
- Mobile: Shake device for debug menu
- Backend: Check `storage/logs/laravel.log`
- MongoDB: Use MongoDB Compass GUI

### Testing Changes
- Mobile: `npm test`
- Backend: `php artisan test`

### Database Reset
```bash
cd backend
php artisan db:seed --class=DatabaseSeeder
```

---

**You're all set!** 🎉

The app should now be running with all features working. Try exploring each tab and testing the AI helper.

For questions or issues, review the detailed documentation in README.md or check the troubleshooting section above.
