import { createTheme, alpha, type PaletteMode, type Shadows } from '@mui/material/styles';

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    highlighted: true;
  }
}
declare module '@mui/material/styles' {
  interface ColorRange {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface PaletteColor extends ColorRange {}

  interface Palette {
    baseShadow: string;
  }
}

const defaultTheme = createTheme();

const customShadows: Shadows = [...defaultTheme.shadows];

// Brand blue: rgba(20, 24, 41, .8) = RGB(20, 24, 41) = HSL(225, 34%, 12%)
export const brand = {
  50: 'hsl(225, 30%, 95%)',
  100: 'hsl(225, 30%, 90%)',
  200: 'hsl(225, 30%, 75%)',
  300: 'hsl(225, 30%, 55%)',
  400: 'hsl(225, 34%, 35%)',
  500: 'hsl(225, 34%, 25%)',
  600: 'hsl(225, 34%, 18%)',
  700: 'hsl(225, 34%, 14%)',
  800: 'hsl(225, 34%, 12%)', // Main brand color: rgba(20, 24, 41)
  900: 'hsl(225, 34%, 8%)',
};

// Gray scale aligned with brand blue undertones
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

export const green = {
  50: 'hsl(120, 80%, 98%)',
  100: 'hsl(120, 75%, 94%)',
  200: 'hsl(120, 75%, 87%)',
  300: 'hsl(120, 61%, 77%)',
  400: 'hsl(120, 44%, 53%)',
  500: 'hsl(120, 59%, 30%)',
  600: 'hsl(120, 70%, 25%)',
  700: 'hsl(120, 75%, 16%)',
  800: 'hsl(120, 84%, 10%)',
  900: 'hsl(120, 87%, 6%)',
};

// Accent orange: RGB(244, 139, 34) = HSL(25, 90%, 55%)
export const orange = {
  50: 'hsl(25, 90%, 97%)',
  100: 'hsl(25, 90%, 92%)',
  200: 'hsl(25, 90%, 85%)',
  300: 'hsl(25, 90%, 70%)',
  400: 'hsl(25, 90%, 55%)', // Main accent orange: RGB(244, 139, 34)
  500: 'hsl(25, 90%, 48%)',
  600: 'hsl(25, 90%, 42%)',
  700: 'hsl(25, 90%, 35%)',
  800: 'hsl(25, 90%, 28%)',
  900: 'hsl(25, 90%, 20%)',
};

// Yellow/Gold for logo and secondary accents
export const yellow = {
  50: 'hsl(45, 100%, 97%)',
  100: 'hsl(45, 100%, 92%)',
  200: 'hsl(45, 100%, 85%)',
  300: 'hsl(45, 100%, 75%)',
  400: 'hsl(45, 100%, 65%)',
  500: 'hsl(45, 100%, 55%)', // Bright yellow/gold for logo
  600: 'hsl(45, 100%, 48%)',
  700: 'hsl(45, 100%, 40%)',
  800: 'hsl(45, 100%, 32%)',
  900: 'hsl(45, 100%, 25%)',
};

// Red for status/highlight (e.g., "ON AIR" indicator)
export const red = {
  50: 'hsl(0, 100%, 97%)',
  100: 'hsl(0, 95%, 92%)',
  200: 'hsl(0, 95%, 85%)',
  300: 'hsl(0, 95%, 75%)',
  400: 'hsl(0, 95%, 60%)',
  500: 'hsl(0, 95%, 50%)', // Main red for status indicators
  600: 'hsl(0, 95%, 45%)',
  700: 'hsl(0, 95%, 38%)',
  800: 'hsl(0, 95%, 30%)',
  900: 'hsl(0, 95%, 20%)',
};

export const getDesignTokens = (mode: PaletteMode) => {
  customShadows[1] =
    mode === 'dark'
      ? 'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px'
      : 'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px';

  return {
    palette: {
      mode,
      primary: {
        light: brand[300],
        main: brand[800], // Main brand blue: rgba(20, 24, 41)
        dark: brand[900],
        contrastText: '#FFFFFF',
        ...(mode === 'dark' && {
          contrastText: '#FFFFFF',
          light: brand[600],
          main: brand[800],
          dark: brand[900],
        }),
      },
      info: {
        light: brand[100],
        main: brand[300],
        dark: brand[600],
        contrastText: gray[50],
        ...(mode === 'dark' && {
          contrastText: brand[300],
          light: brand[500],
          main: brand[700],
          dark: brand[900],
        }),
      },
      warning: {
        light: orange[300],
        main: orange[400], // Vibrant orange accent: RGB(244, 139, 34)
        dark: orange[700],
        contrastText: '#FFFFFF',
        ...(mode === 'dark' && {
          light: orange[300],
          main: orange[400],
          dark: orange[600],
          contrastText: '#FFFFFF',
        }),
      },
      error: {
        light: red[300],
        main: red[400],
        dark: red[800],
        ...(mode === 'dark' && {
          light: red[400],
          main: red[500],
          dark: red[700],
        }),
      },
      success: {
        light: green[300],
        main: green[400],
        dark: green[800],
        ...(mode === 'dark' && {
          light: green[400],
          main: green[500],
          dark: green[700],
        }),
      },
      grey: {
        ...gray,
      },
      divider: mode === 'dark' ? alpha(gray[700], 0.6) : alpha(gray[300], 0.4),
      background: {
        default: 'hsl(0, 0%, 99%)',
        paper: 'hsl(225, 20%, 98%)',
        ...(mode === 'dark' && {
          default: brand[900], // Dark brand blue background
          paper: brand[800] // Slightly lighter for paper surfaces
        }),
      },
      text: {
        primary: gray[800],
        secondary: gray[600],
        warning: orange[400],
        ...(mode === 'dark' && { primary: 'hsl(0, 0%, 100%)', secondary: gray[400] }),
      },
      action: {
        hover: alpha(gray[200], 0.2),
        selected: `${alpha(gray[200], 0.3)}`,
        ...(mode === 'dark' && {
          hover: alpha(gray[600], 0.2),
          selected: alpha(gray[600], 0.3),
        }),
      },
    },
    typography: {
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
    },
    shape: {
      borderRadius: 8,
    },
    shadows: customShadows,
  };
};

export const colorSchemes = {
  light: {
    palette: {
      primary: {
        light: brand[300],
        main: brand[800], // Main brand blue: rgba(20, 24, 41)
        dark: brand[900],
        contrastText: '#FFFFFF',
      },
      info: {
        light: brand[100],
        main: brand[300],
        dark: brand[600],
        contrastText: gray[50],
      },
      warning: {
        light: orange[300],
        main: orange[400], // Vibrant orange accent: RGB(244, 139, 34)
        dark: orange[700],
        contrastText: '#FFFFFF',
      },
      error: {
        light: red[300],
        main: red[400],
        dark: red[800],
      },
      success: {
        light: green[300],
        main: green[400],
        dark: green[800],
      },
      grey: {
        ...gray,
      },
      divider: alpha(gray[300], 0.4),
      background: {
        default: 'hsl(0, 0%, 99%)',
        paper: 'hsl(225, 20%, 98%)',
      },
      text: {
        primary: gray[800],
        secondary: gray[600],
        warning: orange[400],
      },
      action: {
        hover: alpha(gray[200], 0.2),
        selected: `${alpha(gray[200], 0.3)}`,
      },
      baseShadow:
        'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px',
    },
  },
  dark: {
    palette: {
      primary: {
        contrastText: '#FFFFFF',
        light: brand[600],
        main: brand[800], // Main brand blue: rgba(20, 24, 41)
        dark: brand[900],
      },
      info: {
        contrastText: brand[300],
        light: brand[500],
        main: brand[700],
        dark: brand[900],
      },
      warning: {
        light: orange[300],
        main: orange[400], // Vibrant orange accent: RGB(244, 139, 34)
        dark: orange[600],
        contrastText: '#FFFFFF',
      },
      error: {
        light: red[400],
        main: red[500],
        dark: red[700],
      },
      success: {
        light: green[400],
        main: green[500],
        dark: green[700],
      },
      grey: {
        ...gray,
      },
      divider: alpha(gray[700], 0.6),
      background: {
        default: brand[900], // Dark brand blue background
        paper: brand[800], // Slightly lighter for paper surfaces
      },
      text: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: gray[400],
      },
      action: {
        hover: alpha(gray[600], 0.2),
        selected: alpha(gray[600], 0.3),
      },
      baseShadow:
        'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px',
    },
  },
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
};

export const shape = {
  borderRadius: 8,
};

// @ts-expect-error to fix
const defaultShadows: Shadows = [
  'none',
  'var(--template-palette-baseShadow)',
  ...defaultTheme.shadows.slice(2),
];
export const shadows = defaultShadows;
