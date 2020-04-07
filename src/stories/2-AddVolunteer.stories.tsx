import React from 'react';
import AddVolunteer from '@storybook/react/demo';
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
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { Formik } from "formik";
import * as Yup from "yup";

export default {
  title: 'AddVolunteer',
  component: AddVolunteer,
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
  ministry: Yup.string().required("Required"),
  firstName: Yup.string().required("Required"),
  surname: Yup.string().required("Required"),
  dateOfBirth: Yup.string().required("Required"),
  missionalCommunity: Yup.string().required("Required"),
  profession: Yup.string().required("Required")
});

export const AddVolunteerForm = () => {
  const classes = useStyles();
  const [ministry, setMinistry] = React.useState('');

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setMinistry(event.target.value as string);
  };
  
  return (
    <ThemeProvider theme={theme}>
      <Container className={classes.root}>
        <Typography component="div">
          <h2>Add volunteers</h2>
          <br />
          <Formik
            initialValues={{ ministry: "", firstName: "", surname: "", dateOfBirth: "", missionalCommunity: "", profession: "" }}
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

                  <Grid item xs={6}>First name:</Grid>
                  <Grid item xs={6}><Box boxShadow={1} bgcolor="background.paper" borderRadius={5} width={200}><TextField name="firstName" onChange={handleChange} value={values.firstName} id="outlined-basic" variant="outlined" inputProps={{ fontSize: 8 }} size="small" fullWidth={true} /></Box>
                  {errors.firstName}</Grid>

                  <Grid item xs={6}>Surname:</Grid>
                  <Grid item xs={6}><Box boxShadow={1} bgcolor="background.paper" borderRadius={5} width={200}><TextField name="surname" onChange={handleChange} value={values.surname} id="outlined-basic" variant="outlined" size="small" fullWidth={true} /></Box>
                  {errors.surname}</Grid>

                  <Grid item xs={6}>DOB:</Grid>
                  <Grid item xs={6}><Box boxShadow={1} bgcolor="background.paper" borderRadius={5} width={200}><TextField name="dateOfBirth" onChange={handleChange} value={values.dateOfBirth} id="outlined-basic" variant="outlined" size="small" fullWidth={true} /></Box>
                  {errors.dateOfBirth}</Grid>

                  <Grid item xs={6}>Missional community:</Grid>
                  <Grid item xs={6}><Box boxShadow={1} bgcolor="background.paper" borderRadius={5} width={200}><TextField name="missionalCommunity" onChange={handleChange} value={values.missionalCommunity} id="outlined-basic" variant="outlined" size="small" fullWidth={true} /></Box>
                  {errors.missionalCommunity}</Grid>

                  <Grid item xs={6}>Profession:</Grid>
                  <Grid item xs={6}><Box boxShadow={1} bgcolor="background.paper" borderRadius={5} width={200}><TextField name="profession" onChange={handleChange} value={values.profession} id="outlined-basic" variant="outlined" size="small" fullWidth={true} /></Box>
                  {errors.profession}</Grid>

                  <Grid item xs={6}><Button type="submit" variant="contained" color="primary">Add</Button></Grid>
                  <Grid item xs={6}></Grid>
                </Grid>
              </form>
              )}
            </Formik>
        </Typography>
      </Container>
    </ThemeProvider>
  );
}