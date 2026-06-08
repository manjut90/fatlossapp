// src/components/primitives/Text.tsx

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeProvider';

type TextProps = RNTextProps & {
  color?: keyof (typeof useTheme)['colors'];
  variant?: keyof (typeof useTheme)['textVariants']; // We will define this later
};

const Text: React.FC<TextProps> = ({
  style,
  color,
  variant,
  ...rest
}) => {
  const { colors, textVariants } = useTheme();

  const themedStyle = [
    styles.default,
    color && { color: colors[color] },
    variant && textVariants[variant],
    style,
  ];

  return <RNText style={themedStyle} {...rest} />;
};

const styles = StyleSheet.create({
  default: {
    // Default text styles can go here
  },
});

export default Text;