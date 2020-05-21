import React, {SyntheticEvent, useState} from 'react';
import AppBar from '@material-ui/core/AppBar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import image from "../../assets/WH-11-1920w.webp";
import {Box} from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import logo from "../../assets/WHLogo3.svg";
import RegisterForm from "./RegisterForm";
import {useHistory} from "react-router";
import {localRoutes} from "../../data/constants";
import {Alert} from "@material-ui/lab";

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://www.worshipharvest.org/">
                Worship Harvest Ministries
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        color: 'white'
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
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8),
    },
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    cardMedia: {
        paddingTop: '56.25%', // 16:9
    },
    cardContent: {
        flexGrow: 1,
    },
    footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(6),
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
        setDone(true)
    }

    function handleLogin(e: SyntheticEvent<any>) {
        e.preventDefault()
        history.push(localRoutes.login)
    }

    return (
        <div
            style={{
                backgroundImage: "url(" + image + ")",
                backgroundSize: "auto",
                backgroundPosition: "top center"
            }}
            className={classes.root}
        >
            <CssBaseline/>
            <AppBar position="relative" color="transparent">
                <Toolbar>
                    <Avatar alt="Logo" src={logo} className={classes.icon}/>
                    <Typography variant="h6" color="inherit" noWrap className={classes.toolbarTitle}>
                        Worship Harvest
                    </Typography>
                    <nav>
                        <Link
                            variant="button"
                            color="inherit" href="#"
                            onClick={handleLogin}
                        >
                            Login
                        </Link>
                    </nav>
                </Toolbar>
            </AppBar>
            <main>
                <Container className={classes.cardGrid} maxWidth="md">
                    <Box display='flex' justifyContent='center'>
                        <Card className={classes.card}>
                            <CardContent className={classes.cardContent}>
                                <Box p={3} pb={0}>
                                    <Typography variant="h5" component="h2">
                                        Help us serve you better
                                    </Typography>

                                    {
                                        done &&
                                        <Box pt={2}>
                                            <Alert>We have received your data, Thank you</Alert>
                                        </Box>
                                    }
                                </Box>
                                <Box p={3} pt={2}>
                                    <RegisterForm data={startData} done={handleDone}/>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Container>
            </main>
            <footer className={classes.footer}>
                <Typography variant="h6" align="center" gutterBottom color='primary'>
                    Worship Harvest is a Movement of
                    the Gospel, Discipleship and Mission.
                </Typography>
                <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
                    We exist to catalyze Spiritual, Social and Economic Renewal in our immediate communities and as a
                    result, the world.
                </Typography>
                <Copyright/>
            </footer>
        </div>
    );
}
