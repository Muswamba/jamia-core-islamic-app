# Quick Start Guide

## 1. Start Backend
```bash
cd backend
docker compose up -d
docker compose exec app php artisan db:seed
```

## 2. Configure Mobile App
```bash
cd mobile

# Edit .env file with your IP address
echo "EXPO_PUBLIC_API_BASE_URL=http://192.168.1.6:8002" > .env

# Start Expo
npx expo start
```

## 3. Test in Expo Go
1. Install Expo Go app on your phone
2. Scan QR code from terminal
3. App should load with prayer times

## 4. Test Settings
- Navigate to Settings tab
- Change calculation method
- Go back to Home - times should update
- Enable notifications (grant permission)

## 5. Test Credits
- Settings → Credits & Sources
- Should fetch translations from API
- Pull to refresh

## Common Issues

### "App entry not found"
- Metro bundler still loading - wait 30 seconds
- Clear cache: `npx expo start -c`

### API not connecting
- Check IP in .env matches your computer
- Ensure backend is running: `curl http://localhost:8002/api/health`
- Check firewall allows port 8002

### Notifications not working
- Grant permissions when prompted
- Check Settings → enable notifications toggle
- Expo Go has limitations - build standalone app for full features

### Prayer times wrong
- Check location permissions granted
- Try different calculation method in Settings
- Adjust individual prayer times in Settings if needed
