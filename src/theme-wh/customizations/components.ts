import { alpha, type Components, type Theme } from '@mui/material/styles';
import { gray, ink, letterSpacing, radius, semantic, shadow } from '../tokens';

export const componentCustomizations: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
      '*, *::before, *::after': { boxSizing: 'border-box' },
      html: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        scrollPaddingTop: 72,
      },
      body: { overscrollBehaviorY: 'none' },
      'table, .zoe-tabular': { fontVariantNumeric: 'tabular-nums' },
      // Thin, and in a grey that reads as chrome rather than content. Stated
      // for both engines: Firefox takes scrollbar-color, WebKit needs the
      // pseudo-elements.
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: `${gray[300]} transparent`,
      },
      '*::-webkit-scrollbar': { width: 10, height: 10 },
      '*::-webkit-scrollbar-track': { background: 'transparent' },
      '*::-webkit-scrollbar-thumb': {
        backgroundColor: gray[300],
        borderRadius: 8,
        border: '2px solid transparent',
        backgroundClip: 'content-box',
      },
      '*::-webkit-scrollbar-thumb:hover': { backgroundColor: gray[400] },
      '@media (prefers-reduced-motion: reduce)': {
        '*, *::before, *::after': {
          animationDuration: '0.01ms !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important',
        },
      },
    },
  },

  MuiContainer: {
    defaultProps: { maxWidth: false, disableGutters: true },
  },

  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: radius.md,
        paddingInline: 14,
        minHeight: 36,
        textTransform: 'none',
        boxShadow: 'none',
        '&.Mui-disabled': {
          backgroundColor: gray[200],
          color: gray[500],
          backgroundImage: 'none',
          boxShadow: 'none',
          border: `1px solid ${gray[200]}`,
          ...theme.applyStyles('dark', {
            backgroundColor: ink[700],
            color: gray[500],
            border: `1px solid ${ink[700]}`,
          }),
        },
      }),
      sizeLarge: { minHeight: 44, paddingInline: 20 },
      sizeSmall: { minHeight: 30, paddingInline: 10 },
      contained: ({ theme }) => ({
        '&:hover': {
          backgroundColor: (theme.vars || theme).palette.primary.dark,
        },
      }),
      textPrimary: ({ theme }) =>
        theme.applyStyles('dark', {
          color: semantic.dark.brandText,
          '&:hover': { backgroundColor: alpha('#FFFFFF', 0.08) },
        }),
      textInherit: ({ theme }) =>
        theme.applyStyles('dark', {
          '&:hover': { backgroundColor: alpha('#FFFFFF', 0.08) },
        }),
      containedPrimary: ({ theme }) =>
        theme.applyStyles('dark', {
          // Scoped away from the disabled state, which keeps its own grey.
          '&:not(.Mui-disabled)': {
            backgroundColor: '#FFFFFF',
            color: semantic.dark.background,
          },
          '&:not(.Mui-disabled):hover': {
            backgroundColor: alpha('#FFFFFF', 0.88),
          },
        }),
      outlinedInherit: ({ theme }) => ({
        borderColor: alpha(semantic.light.textPrimary, 0.28),
        ...theme.applyStyles('dark', {
          borderColor: alpha('#FFFFFF', 0.3),
        }),
      }),
      outlinedPrimary: ({ theme }) => ({
        borderColor: alpha(semantic.light.textPrimary, 0.28),
        '&:hover': { borderColor: semantic.light.brand },
        ...theme.applyStyles('dark', {
          color: semantic.dark.brandText,
          borderColor: alpha('#FFFFFF', 0.3),
          '&:hover': {
            borderColor: '#FFFFFF',
            backgroundColor: alpha('#FFFFFF', 0.08),
          },
        }),
      }),
    },
  },

  MuiTablePagination: {
    defaultProps: {
      rowsPerPageOptions: [10, 25, 50, 100],
      labelRowsPerPage: 'Rows',
    },
    styleOverrides: {
      root: ({ theme }) => ({
        borderTop: `1px solid ${(theme.vars || theme).palette.divider}`,
        overflow: 'hidden',
        [theme.breakpoints.down('sm')]: {
          '& .MuiTablePagination-toolbar': {
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            height: 'auto',
            paddingInline: 8,
          },
          '& .MuiTablePagination-spacer': { display: 'none' },
        },
      }),
      toolbar: {
        minHeight: 52,
        height: 52,
        paddingInline: 16,
        gap: 4,
      },
      spacer: { flex: '1 1 100%' },
      selectLabel: ({ theme }) => ({
        margin: 0,
        fontSize: theme.typography.pxToRem(13),
        color: (theme.vars || theme).palette.text.secondary,
      }),
      displayedRows: ({ theme }) => ({
        margin: 0,
        fontSize: theme.typography.pxToRem(13),
        color: (theme.vars || theme).palette.text.secondary,
      }),
      select: ({ theme }) => ({
        paddingBlock: 5,
        paddingLeft: 8,
        paddingRight: 26,
        borderRadius: radius.md,
        border: `1px solid ${(theme.vars || theme).palette.divider}`,
        fontSize: theme.typography.pxToRem(13),
        '&:focus': { borderRadius: radius.md },
      }),
      input: { marginRight: 16, marginLeft: 4 },
      actions: {
        display: 'flex',
        gap: 4,
        marginLeft: 8,
        '& .MuiIconButton-root': {
          borderRadius: radius.md,
          width: 32,
          height: 32,
          minWidth: 0,
        },
      },
    },
  },

  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundImage: 'none',
        borderRadius: radius.lg,
        border: `1px solid ${(theme.vars || theme).palette.divider}`,
      }),
      elevation8: { border: 'none', boxShadow: shadow.lg },
    },
  },

  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: radius.lg,
        backgroundColor: (theme.vars || theme).palette.background.paper,
        border: `1px solid ${(theme.vars || theme).palette.divider}`,
        boxShadow: 'none',
        padding: 20,
        gap: 16,
        [theme.breakpoints.down('sm')]: { padding: 16, gap: 12 },
      }),
    },
  },

  MuiCardContent: {
    styleOverrides: {
      root: { padding: 0, '&:last-child': { paddingBottom: 0 } },
    },
  },

  MuiCardHeader: {
    defaultProps: {
      titleTypographyProps: { variant: 'h6' },
      subheaderTypographyProps: { variant: 'body2', color: 'text.secondary' },
    },
    styleOverrides: {
      root: { padding: 0 },
    },
  },

  MuiCardActions: {
    styleOverrides: { root: { padding: 0 } },
  },

  MuiTableContainer: {
    styleOverrides: {
      root: ({ theme }) => ({
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        [theme.breakpoints.down('sm')]: { maxWidth: '100%' },
      }),
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderBottomColor: (theme.vars || theme).palette.divider,
        paddingBlock: 10,
        whiteSpace: 'nowrap',
      }),
      head: ({ theme }) => ({
        backgroundColor: 'transparent',
        color: (theme.vars || theme).palette.text.secondary,
        fontWeight: 600,
        letterSpacing: letterSpacing.wide,
        whiteSpace: 'nowrap',
        borderBottom: `2px solid ${(theme.vars || theme).palette.divider}`,
      }),
      stickyHeader: ({ theme }) => ({
        backgroundColor: (theme.vars || theme).palette.background.paper,
        backgroundImage: 'none',
      }),
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&:last-child td': { borderBottom: 'none' },
        '&.MuiTableRow-hover:hover': {
          backgroundColor: (theme.vars || theme).palette.action.hover,
        },
        '&.Mui-selected': {
          backgroundColor: (theme.vars || theme).palette.action.selected,
        },
      }),
    },
  },

  MuiAvatar: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: gray[300],
        color: gray[800],
        fontWeight: 600,
        ...theme.applyStyles('dark', {
          backgroundColor: ink[600],
          color: '#FFFFFF',
        }),
      }),
    },
  },

  MuiTooltip: {
    defaultProps: { arrow: true, enterDelay: 300 },
    styleOverrides: {
      tooltip: ({ theme }) => ({
        backgroundColor: (theme.vars || theme).palette.text.primary,
        color: (theme.vars || theme).palette.background.default,
        borderRadius: radius.sm,
        paddingInline: 8,
        paddingBlock: 5,
      }),
      arrow: ({ theme }) => ({ color: (theme.vars || theme).palette.text.primary }),
    },
  },

  MuiDialog: {
    styleOverrides: {
      paper: { borderRadius: radius.xl, boxShadow: shadow.xl },
      // A dialog has to fit the phone it opens on: full width inside a small
      // gutter, tighter padding, and actions stacked above the home
      // indicator rather than crowded onto one line.
      root: ({ theme }) => ({
        '& .MuiDialog-paper': {
          border: '1px solid',
          borderColor: (theme.vars || theme).palette.divider,
          maxWidth: 'calc(100vw - 16px)',
          maxHeight: 'calc(100dvh - 16px)',
          margin: 8,
          [theme.breakpoints.down('sm')]: { width: 'calc(100vw - 16px)' },
        },
        '& .MuiDialogTitle-root': {
          [theme.breakpoints.down('sm')]: { padding: '16px 16px 8px' },
        },
        '& .MuiDialogContent-root': {
          [theme.breakpoints.down('sm')]: { padding: '12px 16px' },
        },
        '& .MuiDialogActions-root': {
          gap: 8,
          [theme.breakpoints.down('sm')]: {
            padding: '12px 16px calc(16px + env(safe-area-inset-bottom))',
            flexDirection: 'column-reverse',
            alignItems: 'stretch',
            '& > :not(style) ~ :not(style)': { marginLeft: 0 },
          },
        },
      }),
    },
  },

  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: 0,
        backgroundColor: (theme.vars || theme).palette.background.paper,
      }),
    },
  },

  MuiAppBar: {
    defaultProps: { elevation: 0, color: 'transparent' },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: (theme.vars || theme).palette.background.paper,
        borderBottom: `1px solid ${(theme.vars || theme).palette.divider}`,
        color: (theme.vars || theme).palette.text.primary,
        backgroundImage: 'none',
      }),
    },
  },

  MuiAlert: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: radius.md,
        border: '1px solid',
        color: (theme.vars || theme).palette.text.primary,
      }),
      standardSuccess: ({ theme }) => ({
        backgroundColor: (theme.vars || theme).palette.success.light,
        borderColor: alpha(semantic.light.success, 0.25),
        '& .MuiAlert-icon': { color: (theme.vars || theme).palette.success.main },
        ...theme.applyStyles('dark', {
          borderColor: alpha(semantic.dark.success, 0.35),
        }),
      }),
      standardInfo: ({ theme }) => ({
        backgroundColor: (theme.vars || theme).palette.info.light,
        borderColor: alpha(semantic.light.info, 0.25),
        '& .MuiAlert-icon': { color: (theme.vars || theme).palette.info.main },
        ...theme.applyStyles('dark', {
          borderColor: alpha(semantic.dark.info, 0.35),
        }),
      }),
      standardWarning: ({ theme }) => ({
        backgroundColor: (theme.vars || theme).palette.warning.light,
        borderColor: alpha(semantic.light.warning, 0.25),
        '& .MuiAlert-icon': { color: (theme.vars || theme).palette.warning.main },
        ...theme.applyStyles('dark', {
          borderColor: alpha(semantic.dark.warning, 0.35),
        }),
      }),
      standardError: ({ theme }) => ({
        backgroundColor: (theme.vars || theme).palette.error.light,
        borderColor: alpha(semantic.light.danger, 0.25),
        '& .MuiAlert-icon': { color: (theme.vars || theme).palette.error.main },
        ...theme.applyStyles('dark', {
          borderColor: alpha(semantic.dark.danger, 0.35),
        }),
      }),
    },
  },

  MuiSkeleton: {
    defaultProps: { animation: 'wave' },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: (theme.vars || theme).palette.action.hover,
        borderRadius: radius.sm,
      }),
    },
  },

  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: radius.md,
        minHeight: 38,
        '&.Mui-selected': {
          backgroundColor: (theme.vars || theme).palette.primary.light,
          color: (theme.vars || theme).palette.primary.main,
          '&:hover': {
            backgroundColor: (theme.vars || theme).palette.primary.light,
          },
          ...theme.applyStyles('dark', {
            color: semantic.dark.brandText,
          }),
        },
      }),
    },
  },

  MuiListItemIcon: {
    styleOverrides: {
      root: { color: 'inherit', minWidth: 34 },
    },
  },
};
