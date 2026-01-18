import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as ExpoLocation from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { calculateQiblaDirection, getCardinalDirection } from '../../src/modules/qibla/calculations';
import { storage, STORAGE_KEYS } from '../../src/storage';
import { Location } from '../../src/modules/prayerTimes/types';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useFontScale } from '../../src/theme/FontScaleProvider';
import { Screen, ThemedCard, ThemedText } from '../../src/components';

export default function QiblaScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { typography } = useFontScale();
  const [location, setLocation] = useState<Location | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sensorAvailable, setSensorAvailable] = useState(true);
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const lastRotation = useRef(0);
  const relativeQibla = (qiblaDirection - compassHeading + 360) % 360;
  const rotationDegrees = rotationAnim.interpolate({
    inputRange: [-720, 0, 720],
    outputRange: ['-720deg', '0deg', '720deg'],
  });
  const isAligned = Math.min(relativeQibla, 360 - relativeQibla) <= 5;

  useEffect(() => {
    loadLocation();
    checkMagnetometerAvailability();
  }, []);

  useEffect(() => {
    let subscription: any = null;

    if (location && sensorAvailable) {
      subscription = Magnetometer.addListener((data) => {
        const { x, y } = data;
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        angle = (angle + 360) % 360;
        setCompassHeading(angle);
      });

      Magnetometer.setUpdateInterval(100);
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [location, sensorAvailable]);

  useEffect(() => {
    if (!sensorAvailable) {
      rotationAnim.setValue(relativeQibla);
      lastRotation.current = relativeQibla;
      return;
    }

    const normalizedCurrent = ((lastRotation.current % 360) + 360) % 360;
    const delta = (((relativeQibla - normalizedCurrent + 540) % 360) - 180);
    const destination = lastRotation.current + delta;

    Animated.timing(rotationAnim, {
      toValue: destination,
      duration: 280,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    lastRotation.current = destination;
  }, [relativeQibla, sensorAvailable, rotationAnim]);

  const checkMagnetometerAvailability = async () => {
    try {
      const available = await Magnetometer.isAvailableAsync();
      setSensorAvailable(available);
    } catch (error) {
      console.error('Error checking magnetometer:', error);
      setSensorAvailable(false);
    }
  };

  const loadLocation = async () => {
    try {
      const storedLocation = await storage.get<Location>(STORAGE_KEYS.LOCATION);

      if (storedLocation) {
        setLocation(storedLocation);
        const direction = calculateQiblaDirection(
          storedLocation.latitude,
          storedLocation.longitude
        );
        setQiblaDirection(direction);
        setLoading(false);
      } else {
        await requestLocation();
      }
    } catch (error) {
      console.error('Error loading location:', error);
      setError(t('location.locationError'));
      setLoading(false);
    }
  };

  const requestLocation = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError(t('location.locationPermissionDenied'));
        setLoading(false);
        return;
      }

      const loc = await ExpoLocation.getCurrentPositionAsync({});
      const newLocation: Location = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setLocation(newLocation);
      await storage.set(STORAGE_KEYS.LOCATION, newLocation);

      const direction = calculateQiblaDirection(
        newLocation.latitude,
        newLocation.longitude
      );
      setQiblaDirection(direction);
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setError(t('location.locationError'));
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen edges={['top']}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText variant="body" color="textSecondary" style={{ marginTop: 16 }}>
            {t('common.loading')}
          </ThemedText>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen edges={['top']}>
        <View style={styles.container}>
          <ThemedText variant="body" color="error" style={{ textAlign: 'center', marginBottom: 20 }}>
            {error}
          </ThemedText>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={requestLocation}
          >
            <ThemedText variant="body" style={{ color: '#fff', fontWeight: '600' }}>
              {t('common.retry')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  if (!sensorAvailable) {
    return (
      <Screen edges={['top']}>
        <View style={styles.container}>
          <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 }}>
            {t('qibla.compassUnavailable')}
          </ThemedText>
          <ThemedCard style={{ padding: 24, alignItems: 'center', marginBottom: 24, width: '100%' }}>
            <ThemedText variant="bodySmall" color="textSecondary" style={{ marginBottom: 8 }}>
              {t('qibla.bearing')}
            </ThemedText>
            <ThemedText variant="bodySmall" color="textSecondary" style={{ marginBottom: 6 }}>
              Mecca
            </ThemedText>
            <ThemedText variant="h1" color="primary" style={{ fontWeight: 'bold', marginBottom: 8 }}>
              {qiblaDirection.toFixed(1)} deg
            </ThemedText>
            <ThemedText variant="h3" color="textSecondary" style={{ fontWeight: '600' }}>
              {getCardinalDirection(qiblaDirection)}
            </ThemedText>
          </ThemedCard>
          <View style={styles.staticArrow}>
            <Ionicons name="arrow-up" size={72} color={colors.primary} />
            <ThemedText variant="h4" color="primary" style={{ fontWeight: '600', marginTop: 8 }}>
              {t('qibla.qibla')}
            </ThemedText>
          </View>
        </View>
      </Screen>
    );
  }

  const labelRotation = `${(360 - relativeQibla) % 360}deg`;
  const needleRotationStyle = {
    transform: [{ rotate: rotationDegrees }],
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.container}>
        <View style={styles.compassContainer}>
          <View style={[styles.compass, {
            backgroundColor: colors.card,
            borderColor: colors.primary,
            shadowColor: colors.text
          }]}>
            <Animated.View
              style={[
                styles.connectionBeam,
                { backgroundColor: colors.primary },
                needleRotationStyle,
              ]}
            />
            <Animated.View
              style={[
                styles.needle,
                {
                  backgroundColor: colors.error,
                },
                needleRotationStyle,
              ]}
            >
              <View
                style={[
                  styles.needlePoint,
                  {
                    borderBottomColor: colors.error,
                  },
                ]}
              />
              <Ionicons name="caret-up" size={16} color="#fff" />
            </Animated.View>

            <Animated.View
              style={[styles.meccaMarker, needleRotationStyle]}
            >
              <View style={[styles.meccaPin, { backgroundColor: colors.primary }]}>
                <Ionicons name="cube" size={12} color="#fff" />
              </View>
              <View style={[styles.meccaLabel, { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ rotate: labelRotation }] }]}>
                <ThemedText variant="caption" style={{ color: colors.text, fontWeight: '600' }}>
                  Mecca
                </ThemedText>
                <ThemedText variant="caption" color="textSecondary">
                  {qiblaDirection.toFixed(1)} deg
                </ThemedText>
              </View>
            </Animated.View>

            <View style={[styles.compassCenter, { backgroundColor: colors.primary }]} />
          </View>

          <ThemedCard style={{ padding: 20, width: '100%', alignItems: 'center', marginBottom: 16 }}>
            <ThemedText variant="bodySmall" color="textSecondary" style={{ marginBottom: 8 }}>
              {t('qibla.bearing')}
            </ThemedText>
            <ThemedText variant="bodySmall" color="textSecondary" style={{ marginBottom: 6 }}>
              Mecca
            </ThemedText>
            <ThemedText variant="h3" color="primary" style={{ fontWeight: '600' }}>
              {qiblaDirection.toFixed(1)} deg {getCardinalDirection(qiblaDirection)}
            </ThemedText>
          </ThemedCard>

          {isAligned && (
            <View
              style={[
                styles.alignmentBadge,
                { backgroundColor: colors.success, borderColor: colors.success },
              ]}
            >
              <ThemedText variant="bodySmall" style={{ color: '#fff', fontWeight: '600' }}>
                {t('qibla.aligned')}
              </ThemedText>
            </View>
          )}

          <View
            style={[
              styles.calibrationCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <ThemedText
              variant="bodySmall"
              style={{ fontWeight: '600', color: colors.primary, marginBottom: 8 }}
            >
              {t('qibla.calibration')}
            </ThemedText>
            <ThemedText variant="caption" color="textSecondary" style={{ lineHeight: 18 }}>
              {t('qibla.calibrationHelp')}
            </ThemedText>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  compassContainer: {
    width: '100%',
    alignItems: 'center',
  },
  compass: {
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
  },
  connectionBeam: {
    position: 'absolute',
    width: 3,
    top: 60,
    bottom: 60,
    left: '50%',
    marginLeft: -1.5,
    borderRadius: 2,
    opacity: 0.35,
  },
  needle: {
    position: 'absolute',
    width: 4,
    height: 120,
    alignItems: 'center',
    zIndex: 2,
  },
  needlePoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: 4,
  },
  compassCenter: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  meccaMarker: {
    position: 'absolute',
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 3,
  },
  meccaPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  meccaLabel: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  calibrationCard: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  alignmentBadge: {
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staticArrow: {
    alignItems: 'center',
  },
});

