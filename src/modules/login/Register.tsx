import React, { SyntheticEvent, useState } from "react";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import image from "../../assets/WH-11-1920w.webp";
import { Box } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import logo from "../../assets/WHLogo3.svg";
import RegisterForm from "./RegisterForm";
import { useHistory } from "react-router";
import { localRoutes } from "../../data/constants";
import { Alert } from "@material-ui/lab";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://www.worshipharvest.org/">
        Worship Harvest Ministries
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    color: "white",
    width: "100%",
    height: "100%",
    overflowY: "scroll",
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    color: "black",
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(8),
    padding: theme.spacing(2),
    width: 500,
    maxWidth: "100%",
    margin: "0 auto",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      padding: theme.spacing(1),
    },
  },

  content: {
    padding: theme.spacing(1),
    paddingTop: 0,
    [theme.breakpoints.down("sm")]: {
      padding: 0,
    },
  },
  titleContent: {
    padding: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
      paddingBottom: 0,
    },
  },
  footer: {
    backgroundColor: "black",
    padding: theme.spacing(6),
    color: "whitesmoke",
  },
  toolbarTitle: {
    flexGrow: 1,
  },
}));

export default function Register() {
  const classes = useStyles();
  const history = useHistory();
  const [done, setDone] = useState<boolean>(false);
  const startData: any = {};

  function handleDone() {
    setDone(true);
  }

  function handleLogin(e: SyntheticEvent<any>) {
    e.preventDefault();
    history.push(localRoutes.login);
  }

  return (
    <div
      style={{
        backgroundImage: "url(" + image + ")",
        backgroundSize: "cover",
        backgroundPosition: "top center",
      }}
      className={classes.root}
    >
      <CssBaseline />
      <AppBar position="relative" color="transparent">
        <Toolbar>
          <Avatar alt="Logo" src={logo} className={classes.icon} />
          <Typography
            variant="h5"
            color="inherit"
            noWrap
            className={classes.toolbarTitle}
          >
            Worship Harvest
          </Typography>
          <nav>
            <Link
              variant="button"
              color="inherit"
              href="#"
              onClick={handleLogin}
            >
              Login
            </Link>
          </nav>
        </Toolbar>
      </AppBar>
      <Box px={2}>
        <div className={classes.cardGrid}>
          <div className={classes.titleContent}>
            <Typography variant="h5" component="h2">
              Register
            </Typography>
            {done && (
              <Box pt={2}>
                <Alert>
                  We have received your data, Please check your 
                  email for a link to setup a password. Thank you.
                </Alert>
              </Box>
            )}
          </div>
          <div className={classes.content}>
            <RegisterForm data={startData} done={handleDone} />
          </div>
        </div>
      </Box>

      <footer className={classes.footer}>
        <Typography variant="h6" align="center" gutterBottom color="inherit">
          Worship Harvest is a Movement of the Gospel, Discipleship and Mission.
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="inherit"
          component="p"
        >
          <b>
            We exist to catalyze Spiritual, Social and Economic Renewal in our
            immediate communities and as a result, the world.
          </b>
        </Typography>
        <Copyright />
      </footer>
    </div>
  );
}
