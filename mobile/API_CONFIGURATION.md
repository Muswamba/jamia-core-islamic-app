# API Configuration Guide

## Backend Connection Setup

The mobile app is configured to connect to your Laravel backend API. The configuration varies based on where the app is running.

### Current Setup

The API configuration is centralized in: `src/config/api.ts`

### Development Mode

#### iOS Simulator
- Uses: `http://localhost:8000/api`
- Works because iOS simulator shares the same network as your Mac

#### Android Emulator
- Uses: `http://10.0.2.2:8000/api`
- `10.0.2.2` is a special alias that points to your host machine's `localhost`

#### Physical Device (Phone/Tablet)
To test on a real device, you need to use your computer's IP address on the same network.

**Find your computer's IP address:**

Windows:
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
# Example: 192.168.1.100
```

Mac/Linux:
```bash
ifconfig
# or
ip addr show
# Look for your local network IP (usually starts with 192.168.x.x or 10.0.x.x)
```

**Update the configuration:**

Edit `src/config/api.ts` and uncomment these lines at the bottom:
```typescript
// For physical devices on the same network, uncomment and set your computer's IP:
export const API_BASE_URL = 'http://192.168.1.XXX:8000/api';
export const API_V1_BASE_URL = `${API_BASE_URL}/v1`;
```

Replace `192.168.1.XXX` with your actual IP address.

### Production Mode

For production deployment, update the API URL in `src/config/api.ts`:
```typescript
// Production mode - replace with your production API URL
return 'https://your-production-api.com/api';
```

## API Endpoints

The app connects to these backend endpoints:

### Learn Content
- **GET** `/api/v1/content/learn?lang={en|fr|sw}`
- Fetches learning content (categories and lessons)
- Cached for 7 days

### Quran Translations
- **GET** `/api/v1/quran/translations/catalog`
- Fetches available Quran translations
- **GET** `/api/v1/quran/translation?lang={lang}&surah={number}`
- Fetches specific translation
- Cached for 7 days

### AI Helper
- **POST** `/api/v1/ai/chat`
- Send chat messages to AI assistant
- Rate limited: 10 requests per device per hour
- **POST** `/api/v1/ai/explain-ayah`
- Get AI explanation of Quranic verses
- Rate limited: 10 requests per device per hour

### Health Check
- **GET** `/api/health`
- Verify backend is running

## Testing the Connection

### Method 1: Check Backend Health
```bash
# From your computer
curl http://localhost:8000/api/health

# From Android emulator
curl http://10.0.2.2:8000/api/health

# From same network (replace with your IP)
curl http://192.168.1.XXX:8000/api/health
```

### Method 2: Test in the App
1. Open the app
2. Navigate to the Learn or Quran section
3. Check the console logs for API calls
4. If you see errors, check:
   - Backend Docker containers are running
   - Firewall allows connections on port 8000
   - IP address is correct (for physical devices)

## Troubleshooting

### "Network Error" or "Connection Refused"

**For Android Emulator:**
- Make sure you're using `10.0.2.2` not `localhost`
- Check backend is running: `docker compose ps`

**For Physical Device:**
- Make sure both device and computer are on the same WiFi network
- Check Windows Firewall allows port 8000:
  ```bash
  netsh advfirewall firewall add rule name="Adhan API" dir=in action=allow protocol=TCP localport=8000
  ```
- Verify backend is accessible from network:
  ```bash
  curl http://YOUR-IP:8000/api/health
  ```

### "Timeout" Errors
- Increase timeout in `src/config/api.ts`:
  ```typescript
  export const API_TIMEOUT = 60000; // 60 seconds
  ```

### "CORS" Errors (Web Only)
- Backend already has CORS enabled in Laravel
- If issues persist, check `backend/config/cors.php`

## Offline Support

The app includes offline fallbacks:
- **Learn Content**: Falls back to hardcoded lessons if API is unavailable
- **Quran Translations**: Includes Surah Al-Fatiha in 3 languages as fallback
- **Cached Data**: API responses are cached for 7 days

## Cache Management

Data is cached using AsyncStorage:
- Clear app data to force fresh API calls
- Cache expires after 7 days automatically
- Location: `@adhan_app:*` keys in AsyncStorage
