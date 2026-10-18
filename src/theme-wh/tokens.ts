/** Project Zoe navy. 800 is the brand colour, RGB(20, 24, 41). */
export const brand = {
  50: 'hsl(225, 30%, 95%)',
  100: 'hsl(225, 30%, 90%)',
  200: 'hsl(225, 30%, 75%)',
  300: 'hsl(225, 30%, 55%)',
  400: 'hsl(225, 34%, 35%)',
  500: 'hsl(225, 34%, 25%)',
  600: 'hsl(225, 34%, 18%)',
  700: 'hsl(225, 34%, 14%)',
  800: 'hsl(225, 34%, 12%)',
  900: 'hsl(225, 34%, 8%)',
};

/** Neutrals carry the brand undertone so surfaces sit with the navy. */
export const gray = {
  50: 'hsl(225, 20%, 98%)',
  100: 'hsl(225, 20%, 95%)',
  200: 'hsl(225, 20%, 90%)',
  300: 'hsl(225, 20%, 80%)',
  400: 'hsl(225, 20%, 65%)',
  500: 'hsl(225, 20%, 50%)',
  600: 'hsl(225, 20%, 35%)',
  700: 'hsl(225, 20%, 25%)',
  800: 'hsl(225, 30%, 15%)',
  900: 'hsl(225, 35%, 8%)',
};

/**
 * Dark-mode ground, built from the brand navy rather than from the neutrals,
 * so the whole dark surface set is one night. Steps rise in lightness as
 * surfaces come forward, which is how depth reads without shadows.
 */
export const ink = {
  1000: 'hsl(225, 40%, 4%)',
  950: 'hsl(225, 34%, 8%)',
  900: 'hsl(225, 34%, 12%)',
  800: 'hsl(225, 32%, 16%)',
  700: 'hsl(225, 30%, 22%)',
  600: 'hsl(225, 28%, 30%)',
  500: 'hsl(225, 25%, 40%)',
};

/** Project Zoe accent. 400 is RGB(244, 139, 34). */
export const orange = {
  50: 'hsl(25, 90%, 97%)',
  100: 'hsl(25, 90%, 92%)',
  200: 'hsl(25, 90%, 85%)',
  300: 'hsl(25, 90%, 70%)',
  400: 'hsl(25, 90%, 55%)',
  500: 'hsl(25, 90%, 48%)',
  600: 'hsl(25, 90%, 42%)',
  700: 'hsl(25, 90%, 35%)',
  800: 'hsl(25, 90%, 28%)',
  900: 'hsl(25, 90%, 20%)',
};

export const yellow = {
  50: 'hsl(45, 100%, 97%)',
  100: 'hsl(45, 100%, 92%)',
  200: 'hsl(45, 100%, 85%)',
  300: 'hsl(45, 100%, 75%)',
  400: 'hsl(45, 100%, 65%)',
  500: 'hsl(45, 100%, 55%)',
  600: 'hsl(45, 100%, 48%)',
  700: 'hsl(45, 100%, 40%)',
  800: 'hsl(45, 100%, 32%)',
  900: 'hsl(45, 100%, 25%)',
};

export const green = {
  50: 'hsl(145, 55%, 96%)',
  100: 'hsl(145, 50%, 88%)',
  200: 'hsl(145, 45%, 78%)',
  300: 'hsl(145, 42%, 60%)',
  400: 'hsl(145, 48%, 42%)',
  500: 'hsl(145, 58%, 32%)',
  600: 'hsl(145, 65%, 26%)',
  700: 'hsl(145, 70%, 20%)',
  800: 'hsl(145, 75%, 14%)',
  900: 'hsl(145, 80%, 9%)',
};

export const red = {
  50: 'hsl(2, 85%, 97%)',
  100: 'hsl(2, 80%, 92%)',
  200: 'hsl(2, 75%, 85%)',
  300: 'hsl(2, 70%, 70%)',
  400: 'hsl(2, 70%, 58%)',
  500: 'hsl(2, 72%, 48%)',
  600: 'hsl(2, 75%, 42%)',
  700: 'hsl(2, 78%, 35%)',
  800: 'hsl(2, 80%, 28%)',
  900: 'hsl(2, 85%, 18%)',
};

export interface SemanticColors {
  background: string;
  surface: string;
  surfaceSunken: string;
  surfaceRaised: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnBrand: string;

  border: string;
  borderStrong: string;

  /** Brand navy used as a FILL: buttons, filled surfaces, the brand tile. */
  brand: string;
  brandHover: string;
  brandActive: string;
  /** Brand navy used as TEXT or an icon on the page ground. */
  brandText: string;
  /** Tinted wash for selected rows and the active nav item. */
  brandSubtle: string;

  accent: string;
  accentSubtle: string;

  success: string;
  successSubtle: string;
  warning: string;
  warningSubtle: string;
  danger: string;
  dangerSubtle: string;
  info: string;
  infoSubtle: string;

  focusRing: string;
}

export const semantic: { light: SemanticColors; dark: SemanticColors } = {
  light: {
    background: gray[50],
    surface: '#FFFFFF',
    surfaceSunken: gray[100],
    surfaceRaised: '#FFFFFF',

    textPrimary: gray[800],
    textSecondary: gray[600],
    textMuted: gray[500],
    textOnBrand: '#FFFFFF',

    border: gray[200],
    borderStrong: gray[300],

    brand: brand[800],
    brandHover: brand[600],
    brandActive: brand[900],
    brandText: brand[700],
    brandSubtle: brand[50],

    accent: orange[600],
    accentSubtle: orange[50],

    success: green[600],
    successSubtle: green[50],
    warning: orange[600],
    warningSubtle: orange[50],
    danger: red[600],
    dangerSubtle: red[50],
    info: brand[400],
    infoSubtle: brand[50],

    focusRing: orange[500],
  },

  /**
   * Not an inversion. The navy that fills a button on white disappears against
   * a navy ground, so the fill steps to brand[400]: the same hue, light enough
   * to carry white at 8:1 and to be seen against the page.
   */
  dark: {
    background: ink[950],
    surface: ink[900],
    surfaceSunken: ink[1000],
    surfaceRaised: ink[800],

    textPrimary: '#FFFFFF',
    textSecondary: gray[300],
    textMuted: gray[400],
    textOnBrand: '#FFFFFF',

    border: ink[700],
    borderStrong: ink[600],

    brand: brand[400],
    brandHover: brand[300],
    brandActive: brand[500],
    brandText: brand[200],
    brandSubtle: 'hsla(225, 30%, 55%, 0.18)',

    accent: orange[300],
    accentSubtle: 'hsla(25, 90%, 70%, 0.14)',

    success: green[300],
    successSubtle: 'hsla(145, 42%, 60%, 0.14)',
    warning: orange[300],
    warningSubtle: 'hsla(25, 90%, 70%, 0.14)',
    danger: red[300],
    dangerSubtle: 'hsla(2, 70%, 70%, 0.14)',
    info: brand[200],
    infoSubtle: 'hsla(225, 30%, 75%, 0.14)',

    focusRing: orange[400],
  },
};

export const fontFamily = {
  sans: '"Open Sans", "Segoe UI", system-ui, -apple-system, sans-serif',
  /** Headings only. Anything set in this face is a heading. */
  display: '"Bricolage Grotesque", "Open Sans", system-ui, sans-serif',
  /** Numerals, so money and counts line up column to column. */
  data: 'Roboto, "Open Sans", system-ui, sans-serif',
};

export const fontSize = {
  h1: '1.75rem',
  h2: '1.375rem',
  h3: '1.125rem',
  h4: '1rem',
  body: '0.9375rem',
  bodySm: '0.875rem',
  caption: '0.8125rem',
  overline: '0.75rem',
};

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const lineHeight = {
  tight: 1.2,
  snug: 1.4,
  normal: 1.55,
};

export const letterSpacing = {
  tighter: '-0.02em',
  tight: '-0.01em',
  normal: '0',
  wide: '0.02em',
  wider: '0.08em',
};

export const radius = {
  sm: 4,
  md: 6,
  lg: 10,
  xl: 14,
};

export const shadow = {
  none: 'none',
  xs: 'hsla(225, 35%, 8%, 0.06) 0 1px 2px',
  sm: 'hsla(225, 35%, 8%, 0.08) 0 1px 3px, hsla(225, 35%, 8%, 0.04) 0 1px 2px',
  md: 'hsla(225, 35%, 8%, 0.08) 0 4px 12px, hsla(225, 35%, 8%, 0.04) 0 1px 3px',
  lg: 'hsla(225, 35%, 8%, 0.12) 0 12px 28px, hsla(225, 35%, 8%, 0.05) 0 2px 6px',
  xl: 'hsla(225, 35%, 8%, 0.16) 0 24px 48px',
};

export const layout = {
  sidebarWidth: 264,
  sidebarCollapsedWidth: 68,
  topbarHeight: 60,
  contentMaxWidth: 1440,
};
