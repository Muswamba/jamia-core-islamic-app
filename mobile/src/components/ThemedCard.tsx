import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface ThemedCardProps extends ViewProps {
  variant?: 'default' | 'surface';
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
  variant = 'default',
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();

  const backgroundColor = variant === 'surface' ? colors.surface : colors.card;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor, borderColor: colors.border },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
});
