import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useFontScale } from '../theme/FontScaleProvider';

interface ThemedTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'bodyLarge' | 'caption' | 'label';
  color?: 'text' | 'textSecondary' | 'primary' | 'error' | 'success';
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  variant = 'body',
  color = 'text',
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const { typography } = useFontScale();

  const textColor = colors[color];
  const fontSize = typography[variant];

  return (
    <Text
      style={[
        { color: textColor, fontSize },
        style,
      ]}
      {...props}
    />
  );
};
