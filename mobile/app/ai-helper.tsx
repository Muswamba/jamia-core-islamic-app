import React from 'react';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AIChat from '../src/components/AIChat';
import { Screen } from '../src/components';

export default function AIHelperScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          title: t('ai.aiHelper'),
          headerStyle: {
            backgroundColor: '#2E7D32',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Screen edges={['top', 'bottom']}>
        <AIChat />
      </Screen>
    </>
  );
}
