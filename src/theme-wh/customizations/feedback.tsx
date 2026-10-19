import { type Theme, type Components } from '@mui/material/styles';
import { gray } from '../themePrimitives';

export const feedbackCustomizations: Components<Theme> = {
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
