import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import palette from './palette';

const theme = createTheme({
  palette,
});

export default responsiveFontSizes(theme);