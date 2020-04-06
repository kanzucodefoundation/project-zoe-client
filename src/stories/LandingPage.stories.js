import React from "react";
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import AppBar from '@material-ui/core/AppBar';
export default {
  title: 'LandingPage'
};
export const Navbar = () => (
  <MuiThemeProvider>
  <React.Fragment>
    <AppBar title="MAGEZI FAMILY" />
    <h1>Task Rota</h1>
  </React.Fragment>
</MuiThemeProvider>
);