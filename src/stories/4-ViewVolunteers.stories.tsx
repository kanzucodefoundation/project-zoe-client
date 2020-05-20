import React from 'react';
import ViewVolunteers from '@storybook/react/demo';
import { makeStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/core/styles';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';

import { Formik } from "formik";
import * as Yup from "yup";

export default {
  title: 'ViewVolunteers',
  component: ViewVolunteers,
};

const theme = createMuiTheme({
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: '#0097A7',
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      light: '#0066ff',
      main: '#0044ff',
      // dark: will be calculated from palette.secondary.main,
      contrastText: '#ffcc00',
    },
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: 3,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: 0.2,
  },
  typography: {
    fontSize: 11,
  },
});

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

const validationSchema = Yup.object({
  ministry: Yup.string().required("Required")
});

export const ViewVolunteersList = () => {
  const classes = useStyles();
  const [ministry, setMinistry] = React.useState('');

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setMinistry(event.target.value as string);
  };
  
  return (
    <ThemeProvider theme={theme}>
      <Container className={classes.root}>
        <Typography component="div">
          <h2>View volunteers</h2>
          <br />
          <Formik
            initialValues={{ ministry: "" }}
            validationSchema={validationSchema}
            onSubmit={values => {
              console.log(values);
            }}
          >
            {({ handleSubmit, handleChange, values, errors }) => (
              <form onSubmit={handleSubmit}>
                <Grid container xs={6} spacing={2}>
                  <Grid item xs={6}>Ministry:</Grid>
                  <Grid item xs={6}>
                    <FormControl variant="outlined" size="small">
                      <Box boxShadow={1} bgcolor="background.paper" borderRadius={5} width={200} height={35}>
                        <Select
                          name="ministry"
                          value={values.ministry}
                          onChange={handleChange}
                          fullWidth={true}
                        >
                          <MenuItem value={"Ushering"}>Ushering</MenuItem>
                          <MenuItem value={"Media"}>Media</MenuItem>
                          <MenuItem value={"Band"}>Band</MenuItem>
                        </Select>
                      </Box>
                      {errors.ministry}
                    </FormControl>
                  </Grid>

                  <Grid item xs={6}><Button type="submit" variant="contained" color="primary">View</Button></Grid>
                  <Grid item xs={6}></Grid>
                </Grid>
              </form>
              )}
            </Formik>

            <br/>

            <div>
              <List>
                {[0, 1, 2, 3, 4].map((item) => (
                  <ListItem><ListItemText primary={`${item + 1}. Volunteer name`} /></ListItem>
                ))}
              </List>
            </div>
        </Typography>
      </Container>
    </ThemeProvider>
  );
}