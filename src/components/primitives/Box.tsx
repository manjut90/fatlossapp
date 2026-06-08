// src/components/primitives/Box.tsx

import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../context/ThemeProvider';
import { Spacing, Radii } from '../../theme';

type BoxProps = ViewProps & {
  backgroundColor?: keyof (typeof useTheme)['colors'];
  padding?: Spacing;
  paddingHorizontal?: Spacing;
  paddingVertical?: Spacing;
  margin?: Spacing;
  marginHorizontal?: Spacing;
  marginVertical?: Spacing;
  borderRadius?: Radii;
  // Add any other theme-based props you need
};

const Box: React.FC<BoxProps> = ({
  style,
  backgroundColor,
  padding,
  paddingHorizontal,
  paddingVertical,
  margin,
  marginHorizontal,
  marginVertical,
  borderRadius,
  ...rest
}) => {
  const { colors, spacing, radii } = useTheme();

  const themedStyle = [
    backgroundColor && { backgroundColor: colors[backgroundColor] },
    padding && { padding: spacing[padding] },
    paddingHorizontal && { paddingHorizontal: spacing[paddingHorizontal] },
    paddingVertical && { paddingVertical: spacing[paddingVertical] },
    margin && { margin: spacing[margin] },
    marginHorizontal && { marginHorizontal: spacing[marginHorizontal] },
    marginVertical && { marginVertical: spacing[marginVertical] },
    borderRadius && { borderRadius: radii[borderRadius] },
    style,
  ];

  return <View style={themedStyle} {...rest} />;
};

export default Box;