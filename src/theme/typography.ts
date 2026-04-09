/**
 * Typography scale — Poppins exclusively.
 * Light 300, Regular 400, Medium 500, SemiBold 600, Bold 700.
 */

export const fontFamilies = {
  light: 'Poppins_300Light',
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

export type FontFamily = (typeof fontFamilies)[keyof typeof fontFamilies];

interface TextStyle {
  readonly fontFamily: FontFamily;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly letterSpacing?: number;
  readonly textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
}

export const textStyles = {
  displayLarge: { fontFamily: fontFamilies.bold, fontSize: 32, lineHeight: 40 },
  displayMedium: { fontFamily: fontFamilies.bold, fontSize: 28, lineHeight: 36 },
  headlineLarge: { fontFamily: fontFamilies.semiBold, fontSize: 24, lineHeight: 32 },
  headlineMedium: { fontFamily: fontFamilies.semiBold, fontSize: 20, lineHeight: 28 },
  headlineSmall: { fontFamily: fontFamilies.semiBold, fontSize: 18, lineHeight: 24 },
  titleLarge: { fontFamily: fontFamilies.medium, fontSize: 16, lineHeight: 22 },
  titleMedium: { fontFamily: fontFamilies.medium, fontSize: 14, lineHeight: 20 },
  titleSmall: { fontFamily: fontFamilies.medium, fontSize: 12, lineHeight: 16 },
  bodyLarge: { fontFamily: fontFamilies.regular, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 20 },
  bodySmall: { fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 16 },
  labelLarge: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  labelSmall: { fontFamily: fontFamilies.medium, fontSize: 10, lineHeight: 14 },
  caption: { fontFamily: fontFamilies.light, fontSize: 12, lineHeight: 16 },
} as const satisfies Record<string, TextStyle>;

export type TextStyleName = keyof typeof textStyles;
