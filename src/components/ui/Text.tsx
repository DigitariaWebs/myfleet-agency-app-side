import React from 'react';
import { Text as RNText, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { textStyles, type TextStyleName } from '@/theme/typography';

export interface TextProps {
  variant?: TextStyleName;
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  children: React.ReactNode;
  className?: string;
  style?: TextStyle;
}

export function Text({
  variant = 'bodyMedium',
  color,
  align,
  numberOfLines,
  children,
  className,
  style: styleProp,
}: TextProps) {
  const theme = useTheme();
  const base = textStyles[variant] as {
    readonly fontFamily: string;
    readonly fontSize: number;
    readonly lineHeight: number;
    readonly letterSpacing?: number;
    readonly textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  };

  const inlineStyle: TextStyle = {
    fontFamily: base.fontFamily,
    fontSize: base.fontSize,
    lineHeight: base.lineHeight,
    color: color ?? theme.textPrimary,
    ...(base.letterSpacing != null && { letterSpacing: base.letterSpacing }),
    ...(base.textTransform != null && { textTransform: base.textTransform }),
    ...(align != null && { textAlign: align }),
    ...styleProp,
  };

  return (
    <RNText
      style={inlineStyle}
      numberOfLines={numberOfLines}
      className={className}
    >
      {children}
    </RNText>
  );
}
