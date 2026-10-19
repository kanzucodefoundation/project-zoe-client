import { alpha, type Theme, type Components } from '@mui/material/styles';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import { inputLabelClasses } from '@mui/material/InputLabel';
import { svgIconClasses } from '@mui/material/SvgIcon';
import { toggleButtonGroupClasses } from '@mui/material/ToggleButtonGroup';
import { toggleButtonClasses } from '@mui/material/ToggleButton';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import { gray, brand } from '../themePrimitives';
import { semantic } from '../tokens';

export const inputsCustomizations: Components<Theme> = {
  MuiButtonBase: {
    defaultProps: {
      disableTouchRipple: true,
      disableRipple: true,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        boxSizing: 'border-box',
        transition: 'all 100ms ease-in',
        '&:focus-visible': {
          outline: `3px solid ${alpha(theme.palette.primary.main, 0.5)}`,
          outlineOffset: '2px',
        },
      }),
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        boxShadow: 'none',
        borderRadius: (theme.vars || theme).shape.borderRadius,
        textTransform: 'none',
        fontWeight: theme.typography.fontWeightMedium,
        letterSpacing: 0,
        color: (theme.vars || theme).palette.text.primary,
        border: '1px solid ',
        borderColor: gray[200],
        backgroundColor: alpha(gray[50], 0.3),
        '&:hover': {
          backgroundColor: gray[100],
          borderColor: gray[300],
        },
        '&:active': {
          backgroundColor: gray[200],
        },
        ...theme.applyStyles('dark', {
          backgroundColor: gray[800],
          borderColor: gray[700],
          '&:hover': {
            backgroundColor: gray[900],
            borderColor: gray[600],
          },
          '&:active': {
            backgroundColor: gray[900],
          },
        }),
        variants: [
          {
            props: {
              size: 'small',
            },
            style: {
              width: '2.25rem',
              height: '2.25rem',
              padding: '0.25rem',
              [`& .${svgIconClasses.root}`]: { fontSize: '1rem' },
            },
          },
          {
            props: {
              size: 'medium',
            },
            style: {
              width: '2.5rem',
              height: '2.5rem',
            },
          },
        ],
      }),
    },
  },
  MuiToggleButtonGroup: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: '10px',
        boxShadow: `0 4px 16px ${alpha(gray[400], 0.2)}`,
        [`& .${toggleButtonGroupClasses.selected}`]: {
          color: brand[500],
        },
        ...theme.applyStyles('dark', {
          [`& .${toggleButtonGroupClasses.selected}`]: {
            color: '#fff',
          },
          boxShadow: `0 4px 16px ${alpha(brand[700], 0.5)}`,
        }),
      }),
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: '12px 16px',
        textTransform: 'none',
        borderRadius: '10px',
        fontWeight: 500,
        ...theme.applyStyles('dark', {
          color: gray[400],
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
          [`&.${toggleButtonClasses.selected}`]: {
            color: brand[300],
          },
        }),
      }),
    },
  },
  MuiCheckbox: {
    defaultProps: {
      disableRipple: true,
      icon: (
        <CheckBoxOutlineBlankRoundedIcon sx={{ color: 'hsla(210, 0%, 0%, 0.0)' }} />
      ),
      checkedIcon: <CheckRoundedIcon sx={{ height: 14, width: 14 }} />,
      indeterminateIcon: <RemoveRoundedIcon sx={{ height: 14, width: 14 }} />,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        margin: 10,
        height: 16,
        width: 16,
        borderRadius: 5,
        border: '1px solid ',
        borderColor: alpha(gray[300], 0.8),
        boxShadow: '0 0 0 1.5px hsla(210, 0%, 0%, 0.04) inset',
        backgroundColor: alpha(gray[100], 0.4),
        transition: 'border-color, background-color, 120ms ease-in',
        '&:hover': {
          borderColor: brand[300],
        },
        '&.Mui-focusVisible': {
          outline: `3px solid ${alpha(brand[500], 0.5)}`,
          outlineOffset: '2px',
          borderColor: brand[400],
        },
        '&.Mui-checked': {
          color: 'white',
          backgroundColor: brand[500],
          borderColor: brand[500],
          boxShadow: `none`,
          '&:hover': {
            backgroundColor: brand[600],
          },
        },
        ...theme.applyStyles('dark', {
          borderColor: alpha(gray[700], 0.8),
          boxShadow: '0 0 0 1.5px hsl(210, 0%, 0%) inset',
          backgroundColor: alpha(gray[900], 0.8),
          '&:hover': {
            borderColor: brand[300],
          },
          '&.Mui-focusVisible': {
            borderColor: brand[400],
            outline: `3px solid ${alpha(brand[500], 0.5)}`,
            outlineOffset: '2px',
          },
        }),
      }),
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        border: 'none',
      },
      input: {
        '&::placeholder': {
          opacity: 0.7,
          color: gray[500],
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      input: {
        padding: '16.5px 14px',
        '&::placeholder': {
          opacity: 0.7,
          color: gray[500],
        },
      },
      root: ({ theme }) => ({
        color: (theme.vars || theme).palette.text.primary,
        borderRadius: (theme.vars || theme).shape.borderRadius,
        border: `1px solid ${(theme.vars || theme).palette.divider}`,
        backgroundColor: (theme.vars || theme).palette.background.default,
        transition: 'border-color 120ms ease-in, box-shadow 120ms ease-in',
        '&:hover': {
          borderColor: gray[400],
        },
        [`&.${outlinedInputClasses.focused}`]: {
          borderColor: brand[400],
          boxShadow: `0 0 0 3px ${alpha(brand[500], 0.1)}`,
          ...theme.applyStyles('dark', {
            borderColor: semantic.dark.brandText,
            boxShadow: `0 0 0 3px ${alpha(semantic.dark.brandText, 0.2)}`,
          }),
        },
        [`&.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline}`]: {
          borderWidth: 0,
        },
        [`&.${outlinedInputClasses.adornedStart} .${outlinedInputClasses.input}`]: {
          paddingLeft: 0,
        },
        [`&.${outlinedInputClasses.adornedEnd} .${outlinedInputClasses.input}`]: {
          paddingRight: 0,
        },
        ...theme.applyStyles('dark', {
          '&:hover': {
            borderColor: gray[500],
          },
        }),
        variants: [
          {
            props: {
              size: 'small',
            },
            style: {
              [`& .${outlinedInputClasses.input}`]: {
                padding: '8.5px 14px',
              },
            },
          },
          {
            props: {
              size: 'medium',
            },
            style: {
              [`& .${outlinedInputClasses.input}`]: {
                padding: '16.5px 14px',
              },
            },
          },
        ],
      }),
      notchedOutline: {
        border: 'none',
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: (theme.vars || theme).palette.text.secondary,
        '&.Mui-focused': {
          color: brand[400],
          ...theme.applyStyles('dark', { color: semantic.dark.brandText }),
        },
      }),
      outlined: ({ theme }) => ({
        transform: 'translate(14px, 16.5px) scale(1)',
        '&.MuiInputLabel-shrink': {
          transform: 'translate(14px, -9px) scale(0.75)',
          backgroundColor: (theme.vars || theme).palette.background.default,
          paddingLeft: '4px',
          paddingRight: '4px',
          marginLeft: '-4px',
        },
        [`&.${inputLabelClasses.sizeSmall}`]: {
          transform: 'translate(14px, 8.5px) scale(1)',
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)',
            backgroundColor: (theme.vars || theme).palette.background.default,
            paddingLeft: '4px',
            paddingRight: '4px',
            marginLeft: '-4px',
          },
        },
      }),
    },
  },
  MuiInputAdornment: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: (theme.vars || theme).palette.grey[500],
        ...theme.applyStyles('dark', {
          color: (theme.vars || theme).palette.grey[400],
        }),
      }),
    },
  },
  MuiFormLabel: {
    styleOverrides: {
      root: ({ theme }) => ({
        typography: theme.typography.caption,
        marginBottom: 8,
      }),
    },
  },
};
