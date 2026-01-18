import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { I18nextProvider } from 'react-i18next';
import { initI18n } from '../src/i18n';
import i18n from '../src/i18n';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { FontScaleProvider } from '../src/theme/FontScaleProvider';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initI18n();
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <FontScaleProvider>
          <Slot />
        </FontScaleProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});
