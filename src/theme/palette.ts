import { colors } from '@material-ui/core';

const white = '#FFFFFF';
// const black = '#000000';

const palette = {
  primary: {
    contrastText: white,
    dark: colors.blue[900],
    main: colors.blue[500],
    light: colors.blue[100],
  },
  secondary: {
    contrastText: white,
    dark: colors.blueGrey[900],
    main: colors.blueGrey.A400,
    light: colors.blueGrey.A400,
  },
  error: {
    contrastText: white,
    dark: colors.red[900],
    main: colors.red[600],
    light: colors.red[400],
  },
  text: {
    primary: colors.blueGrey[900],
    secondary: colors.blueGrey[600],
  },
  background: {
    default: '#F4F6F8',
    paper: white,
  },
  links: {
    white: '#FFFFFF',
    black: '#000000',
  },
};
export default palette;
