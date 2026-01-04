import { blue, blueGrey, red } from '@mui/material/colors';

const white = '#FFFFFF';

const palette = {
  primary: {
    contrastText: white,
    dark: blue[900],
    main: blue[500],
    light: blue[100],
  },
  secondary: {
    contrastText: white,
    dark: blueGrey[900],
    main: blueGrey.A400,
    light: blueGrey.A400,
  },
  error: {
    contrastText: white,
    dark: red[900],
    main: red[600],
    light: red[400],
  },
  text: {
    primary: blueGrey[900],
    secondary: blueGrey[600],
  },
  background: {
    default: '#F4F6F8',
    paper: white,
  },
};

export default palette;