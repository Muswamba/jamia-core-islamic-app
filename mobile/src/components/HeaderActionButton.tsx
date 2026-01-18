import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

const ICON_SIZE = 24;
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

interface HeaderActionButtonProps extends TouchableOpacityProps {
  name: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export function HeaderActionButton({
  name,
  color,
  style,
  accessibilityLabel,
  onPress,
  ...rest
}: HeaderActionButtonProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      {...rest}
      onPress={onPress}
      hitSlop={HIT_SLOP}
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      <Ionicons name={name} size={ICON_SIZE} color={color || colors.text} />
    </TouchableOpacity>
  );
}
