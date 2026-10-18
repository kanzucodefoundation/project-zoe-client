import { alpha, createTheme, type Shadows } from '@mui/material/styles';
import {
  letterSpacing,
  radius,
  semantic,
  shadow,
  type SemanticColors,
} from './tokens';

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    highlighted: true;
  }
}

declare module '@mui/material/styles' {
  interface PaletteColor {
    onSurface: string;
  }
  interface SimplePaletteColorOptions {
    onSurface?: string;
  }
  interface Palette {
    baseShadow: string;
  }
  interface PaletteOptions {
    baseShadow?: string;
  }
}

const defaultTheme = createTheme();

export {
  brand,
  gray,
  ink,
  green,
  orange,
  yellow,
  red,
  semantic,
  layout,
} from './tokens';

const paletteFor = (c: SemanticColors) => ({
  primary: {
    main: c.brand,
    light: c.brandSubtle,
    dark: c.brandActive,
    onSurface: c.brandText,
    contrastText: c.textOnBrand,
  },
  secondary: {
    main: c.accent,
    light: c.accentSubtle,
    contrastText: '#FFFFFF',
  },
  success: { main: c.success, light: c.successSubtle, contrastText: '#FFFFFF' },
  warning: { main: c.warning, light: c.warningSubtle, contrastText: '#FFFFFF' },
  error: { main: c.danger, light: c.dangerSubtle, contrastText: '#FFFFFF' },
  info: { main: c.info, light: c.infoSubtle, contrastText: '#FFFFFF' },
  background: { default: c.background, paper: c.surface },
  text: {
    primary: c.textPrimary,
    secondary: c.textSecondary,
    disabled: c.textMuted,
  },
  divider: c.border,
  action: {
    hover: alpha(c.textPrimary, 0.04),
    hoverOpacity: 0.04,
    selected: c.brandSubtle,
    selectedOpacity: 0.08,
    focus: c.focusRing,
  },
  baseShadow: shadow.sm,
});

export const colorSchemes = {
  light: { palette: paletteFor(semantic.light) },
  dark: { palette: paletteFor(semantic.dark) },
};
export const typography = {
  fontFamily: 'Inter, sans-serif',
  h1: {
    fontSize: defaultTheme.typography.pxToRem(48),
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: defaultTheme.typography.pxToRem(36),
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h3: {
    fontSize: defaultTheme.typography.pxToRem(30),
    lineHeight: 1.2,
  },
  h4: {
    fontSize: defaultTheme.typography.pxToRem(24),
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h5: {
    fontSize: defaultTheme.typography.pxToRem(20),
    fontWeight: 600,
  },
  h6: {
    fontSize: defaultTheme.typography.pxToRem(18),
    fontWeight: 600,
  },
  subtitle1: {
    fontSize: defaultTheme.typography.pxToRem(18),
  },
  subtitle2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    fontWeight: 500,
  },
  body1: {
    fontSize: defaultTheme.typography.pxToRem(14),
  },
  body2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    fontWeight: 400,
  },
  caption: {
    fontSize: defaultTheme.typography.pxToRem(12),
    fontWeight: 400,
  },
  overline: {
    fontSize: defaultTheme.typography.pxToRem(12),
    fontWeight: 600,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase' as const,
  },
};

export const shape = {
  borderRadius: radius.md,
};

export const shadows = [
  shadow.none,
  shadow.xs,
  shadow.sm,
  shadow.sm,
  shadow.md,
  shadow.md,
  shadow.md,
  shadow.md,
  shadow.lg,
  ...Array<string>(15).fill(shadow.lg),
  shadow.xl,
] as Shadows;

export const transitions = {
  duration: {
    shortest: 80,
    shorter: 140,
    short: 200,
    standard: 200,
    complex: 320,
    enteringScreen: 200,
    leavingScreen: 140,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.2, 0, 0, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.2, 0, 0, 1)',
  },
};

export { defaultTheme };
