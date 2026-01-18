import React from 'react';
import { ViewProps, StyleSheet } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  edges?: Edge[];
}

export const Screen: React.FC<ScreenProps> = ({
  style,
  children,
  edges = ['top', 'bottom'],
  ...props
}) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.container,
        { backgroundColor: colors.background },
        style,
      ]}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
