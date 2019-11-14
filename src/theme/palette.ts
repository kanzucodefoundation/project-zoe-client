import {colors} from '@material-ui/core';
import {PaletteOptions} from "@material-ui/core/styles/createPalette";

const white = '#FFFFFF';

const palette: PaletteOptions = {
    primary: colors.indigo,
    secondary: colors.lightBlue,
    error: colors.red,
    // text: {
    //     primary: colors.blueGrey[900],
    //     secondary: colors.blueGrey[600]
    // },
    background: {
        default: '#F4F6F8',
        paper: white
    },
    divider: colors.grey[200]
};
export default palette
