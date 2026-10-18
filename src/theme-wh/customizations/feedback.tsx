import { type Theme, type Components } from '@mui/material/styles';
import { gray } from '../themePrimitives';

export const feedbackCustomizations: Components<Theme> = {
  MuiDialog: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiDialog-paper': {
          borderRadius: '10px',
          border: '1px solid',
          borderColor: (theme.vars || theme).palette.divider,
          maxWidth: 'calc(100vw - 16px)',
          maxHeight: 'calc(100dvh - 16px)',
          margin: 8,
          [theme.breakpoints.down('sm')]: {
            width: 'calc(100vw - 16px)',
            borderRadius: 14,
          },
        },
        '& .MuiDialogTitle-root': {
          [theme.breakpoints.down('sm')]: {
            padding: '16px 16px 8px',
          },
        },
        '& .MuiDialogContent-root': {
          [theme.breakpoints.down('sm')]: {
            padding: '12px 16px',
          },
        },
        '& .MuiDialogActions-root': {
          gap: 8,
          [theme.breakpoints.down('sm')]: {
            padding: '12px 16px calc(16px + env(safe-area-inset-bottom))',
            flexDirection: 'column-reverse',
            alignItems: 'stretch',
            '& > :not(style) ~ :not(style)': {
              marginLeft: 0,
            },
          },
        },
      }),
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: ({ theme }) => ({
        height: 8,
        borderRadius: 8,
        backgroundColor: gray[200],
        ...theme.applyStyles('dark', {
          backgroundColor: gray[800],
        }),
      }),
    },
  },
  MuiCircularProgress: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: gray[700],
        ...theme.applyStyles('dark', {
          color: gray[100],
        }),
      }),
      circle:{
        strokeLinecap: 'round',
      },
    },
  },
};
